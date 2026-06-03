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

import { normalizeNLs, normalizeFromMarkdownCicero, normalizeToMarkdownCicero } from './normalize';

describe('#normalize', () => {
    describe('#normalizeNLs', () => {
        it('should normalize to \\n', () => {
            expect(normalizeNLs('Hello\r\nWorld!')).toBe('Hello\nWorld!');
        });
    });
    describe('#normalizeMarkdownCicero', () => {
        it('should normalize to \\n', () => {
            expect(normalizeToMarkdownCicero(normalizeFromMarkdownCicero('Hello\r\nWorld!'))).toBe('Hello\nWorld!');
        });
    });
});
