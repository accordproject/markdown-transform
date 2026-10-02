/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect, type Page } from '@playwright/test';
import * as esbuild from 'esbuild';
import { createHash } from 'crypto';

// A bundler targeting the web resolves each package's `browser` export
// condition to lib/esm-browser and bundles it into the application, resolving
// the bare imports that graph leaves (markdown-it, dayjs, Concerto, sibling
// packages) from node_modules. This suite does the same with esbuild and runs
// the result in Chromium, so it tests what browser consumers actually ship.
const ENTRY = `
export { ModelManager } from '@accordproject/concerto-core';
export { HtmlTransformer } from '@accordproject/markdown-html';
export { TemplateMarkTransformer, normalizeNLs } from '@accordproject/markdown-template';
export { transform, formatDescriptor, generateTransformationDiagram, TransformEngine } from '@accordproject/markdown-transform';
`;

const PACKAGES = [
    'markdown-cicero',
    'markdown-common',
    'markdown-html',
    'markdown-it-cicero',
    'markdown-it-template',
    'markdown-template',
    'markdown-transform',
];

const COMMONMARK = 'org.accordproject.commonmark@0.5.0';

let bundle: string;
let inputs: string[];

test.beforeAll(async () => {
    const result = await esbuild.build({
        stdin: { contents: ENTRY, resolveDir: __dirname, loader: 'js' },
        bundle: true,
        platform: 'browser',
        format: 'iife',
        globalName: 'markdownTransform',
        write: false,
        metafile: true,
        logLevel: 'silent',
    });
    bundle = result.outputFiles[0].text;
    inputs = Object.keys(result.metafile.inputs).map(input => input.split('\\').join('/'));
});

/**
 * Loads the bundle into a blank page, exposing its exports on
 * `window.markdownTransform`.
 *
 * @param {Page} page - the Playwright page
 */
async function loadBundle(page: Page): Promise<void> {
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: bundle });
}

test.describe('browser ES module build', () => {
    test('the bundler resolves every package to lib/esm-browser', () => {
        const ownModules = inputs.filter(input => /(^|\/)packages\/markdown-/.test(input));
        const packages = [...new Set(ownModules.map(input => input.match(/packages\/(markdown-[a-z-]+)\//)![1]))].sort();
        expect(packages).toEqual(PACKAGES);
        expect(ownModules.filter(input => !input.includes('/lib/esm-browser/'))).toEqual([]);
    });

    test('Node-only modules stay out of the bundle', () => {
        const nodeOnly = inputs.filter(input => /node_modules\/(jsdom|crypto-browserify|bn\.js|stream-browserify)\//.test(input));
        expect(nodeOnly).toEqual([]);
    });

    test('exposes the transform API', async ({ page }) => {
        await loadBundle(page);
        const exports = await page.evaluate(() => {
            const mod = (window as any).markdownTransform;
            return ['transform', 'formatDescriptor', 'generateTransformationDiagram', 'TransformEngine', 'HtmlTransformer', 'TemplateMarkTransformer']
                .filter(name => typeof mod[name] !== 'function');
        });
        expect(exports).toEqual([]);
    });

    test('markdown -> commonmark', async ({ page }) => {
        await loadBundle(page);
        const result = await page.evaluate(() => {
            const { transform } = (window as any).markdownTransform;
            return transform('# Hello\n\nWorld.', 'markdown', ['commonmark']);
        });
        expect(result.$class).toBe(`${COMMONMARK}.Document`);
        expect(result.nodes[0].$class).toBe(`${COMMONMARK}.Heading`);
        expect(result.nodes[0].nodes[0].text).toBe('Hello');
    });

    test('markdown -> html via ciceromark', async ({ page }) => {
        await loadBundle(page);
        const html = await page.evaluate(() => {
            const { transform } = (window as any).markdownTransform;
            return transform('# Hello\n\nWorld.', 'markdown', ['ciceromark_parsed', 'html']);
        });
        expect(html).toContain('<h1>Hello</h1>');
        expect(html).toContain('<p>World.</p>');
    });

    test('toHtml renders a CommonMark Document', async ({ page }) => {
        await loadBundle(page);
        const html = await page.evaluate((commonMark) => {
            const { HtmlTransformer } = (window as any).markdownTransform;
            return new HtmlTransformer().toHtml({
                $class: `${commonMark}.Document`,
                xmlns: 'http://commonmark.org/xml/1.0',
                nodes: [{
                    $class: `${commonMark}.Paragraph`,
                    nodes: [{ $class: `${commonMark}.Text`, text: 'Hello, browser!' }],
                }],
            });
        }, COMMONMARK);
        expect(html).toContain('<p>Hello, browser!</p>');
    });

    test('toCiceroMark parses HTML using the native DOMParser', async ({ page }) => {
        await loadBundle(page);
        const dom = await page.evaluate(() => {
            const { HtmlTransformer } = (window as any).markdownTransform;
            return new HtmlTransformer().toCiceroMark('<p>Roundtripped</p>');
        });
        expect(dom.$class).toBe(`${COMMONMARK}.Document`);
        expect(dom.nodes[0].nodes[0].text).toBe('Roundtripped');
    });

    test('a template with a date and a formula parses', async ({ page }) => {
        await loadBundle(page);
        const formula = await page.evaluate(() => {
            const { ModelManager, TemplateMarkTransformer } = (window as any).markdownTransform;
            const modelManager = new ModelManager();
            modelManager.addCTOModel(`namespace e2e@1.0.0
@template
concept Agreement {
  o String party
  o DateTime effective
}`);
            const templateMark = new TemplateMarkTransformer().fromMarkdownTemplate(
                { content: 'Between {{party}}, from {{effective as "D MMMM YYYY"}}, for {{% return 1 + 2 %}} days.' },
                modelManager,
                'contract',
            );
            const find = (node: any): any => node.$class?.endsWith('.FormulaDefinition')
                ? node
                : (node.nodes || []).map(find).find(Boolean);
            const found = find(templateMark);
            return { name: found.name, code: found.code.contents };
        });
        // The browser has no Node crypto; the name must still match it.
        expect(formula.name).toBe('formula_' + createHash('sha256').update(formula.code).digest('hex'));
    });

    test('toTokens produces a markdown-it token stream', async ({ page }) => {
        await loadBundle(page);
        const tokenCount = await page.evaluate(() => {
            const { TemplateMarkTransformer } = (window as any).markdownTransform;
            return new TemplateMarkTransformer().toTokens({ content: 'Hello {{name}}.' }).length;
        });
        expect(tokenCount).toBeGreaterThan(0);
    });

    test('normalizeNLs converts CRLF to LF', async ({ page }) => {
        await loadBundle(page);
        const out = await page.evaluate(() => (window as any).markdownTransform.normalizeNLs('Hello\r\nWorld!'));
        expect(out).toBe('Hello\nWorld!');
    });
});
