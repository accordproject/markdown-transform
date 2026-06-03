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

import { test, expect } from '@playwright/test';
import * as path from 'path';

const UMD_BUNDLE = path.resolve(__dirname, '../../packages/markdown-html/umd/markdown-html.js');

test.describe('@accordproject/markdown-html UMD', () => {
    test('exposes HtmlTransformer on the global', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const result = await page.evaluate(() => {
            const mod = (window as any)['markdown-html'];
            return {
                hasHtmlTransformer: typeof mod?.HtmlTransformer === 'function',
                hasToHtmlStringVisitor: typeof mod?.ToHtmlStringVisitor === 'function',
            };
        });

        expect(result.hasHtmlTransformer).toBe(true);
        expect(result.hasToHtmlStringVisitor).toBe(true);
    });

    test('toHtml renders a CommonMark Document', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const html = await page.evaluate(() => {
            const { HtmlTransformer } = (window as any)['markdown-html'];
            const transformer = new HtmlTransformer();
            return transformer.toHtml({
                $class: 'org.accordproject.commonmark@0.5.0.Document',
                xmlns: 'http://commonmark.org/xml/1.0',
                nodes: [{
                    $class: 'org.accordproject.commonmark@0.5.0.Paragraph',
                    nodes: [{
                        $class: 'org.accordproject.commonmark@0.5.0.Text',
                        text: 'Hello, browser!',
                    }],
                }],
            });
        });

        expect(html).toContain('<p>Hello, browser!</p>');
    });

    test('toCiceroMark parses HTML using the native DOMParser', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const dom = await page.evaluate(() => {
            const { HtmlTransformer } = (window as any)['markdown-html'];
            return new HtmlTransformer().toCiceroMark('<p>Roundtripped</p>');
        });

        expect(dom.$class).toBe('org.accordproject.commonmark@0.5.0.Document');
        expect(dom.nodes[0].$class).toBe('org.accordproject.commonmark@0.5.0.Paragraph');
        expect(dom.nodes[0].nodes[0].text).toBe('Roundtripped');
    });
});
