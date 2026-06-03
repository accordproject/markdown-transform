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

const UMD_BUNDLE = path.resolve(__dirname, '../../packages/markdown-transform/umd/markdown-transform.js');

test.describe('@accordproject/markdown-transform UMD', () => {
    test('exposes the transform API on the global', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const exports = await page.evaluate(() => {
            const mod = (window as any)['markdown-transform'];
            return {
                hasTransform: typeof mod?.transform === 'function',
                hasFormatDescriptor: typeof mod?.formatDescriptor === 'function',
                hasGenerateDiagram: typeof mod?.generateTransformationDiagram === 'function',
                hasTransformEngine: typeof mod?.TransformEngine === 'function',
            };
        });

        expect(exports).toEqual({
            hasTransform: true,
            hasFormatDescriptor: true,
            hasGenerateDiagram: true,
            hasTransformEngine: true,
        });
    });

    test('markdown -> commonmark roundtrip', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const result = await page.evaluate(async () => {
            const { transform } = (window as any)['markdown-transform'];
            return transform('# Hello\n\nWorld.', 'markdown', ['commonmark']);
        });

        expect(result.$class).toBe('org.accordproject.commonmark@0.5.0.Document');
        const heading = result.nodes[0];
        expect(heading.$class).toBe('org.accordproject.commonmark@0.5.0.Heading');
        expect(heading.nodes[0].text).toBe('Hello');
    });

    test('markdown -> html via ciceromark', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const html = await page.evaluate(async () => {
            const { transform } = (window as any)['markdown-transform'];
            return transform('# Hello\n\nWorld.', 'markdown', ['ciceromark_parsed', 'html']);
        });

        expect(html).toContain('<h1>Hello</h1>');
        expect(html).toContain('<p>World.</p>');
    });
});
