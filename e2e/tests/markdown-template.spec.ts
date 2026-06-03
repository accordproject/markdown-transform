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

const UMD_BUNDLE = path.resolve(__dirname, '../../packages/markdown-template/umd/markdown-template.js');

test.describe('@accordproject/markdown-template UMD', () => {
    test('exposes TemplateMarkTransformer on the global', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const result = await page.evaluate(() => {
            const mod = (window as any)['markdown-template'];
            return {
                hasTransformer: typeof mod?.TemplateMarkTransformer === 'function',
                hasNormalize: typeof mod?.normalizeNLs === 'function',
            };
        });

        expect(result.hasTransformer).toBe(true);
        expect(result.hasNormalize).toBe(true);
    });

    test('toTokens produces a markdown-it token stream', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const tokenCount = await page.evaluate(() => {
            const { TemplateMarkTransformer } = (window as any)['markdown-template'];
            const transformer = new TemplateMarkTransformer();
            const tokens = transformer.toTokens({ content: 'Hello {{name}}.' });
            return tokens.length;
        });

        expect(tokenCount).toBeGreaterThan(0);
    });

    test('normalizeNLs converts CRLF to LF', async ({ page }) => {
        await page.setContent('<!doctype html><html><body></body></html>');
        await page.addScriptTag({ path: UMD_BUNDLE });

        const out = await page.evaluate(() => {
            const { normalizeNLs } = (window as any)['markdown-template'];
            return normalizeNLs('Hello\r\nWorld!');
        });

        expect(out).toBe('Hello\nWorld!');
    });
});
