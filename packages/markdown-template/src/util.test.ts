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

import { createHash } from 'crypto';
import { formulaName } from './util';

describe('#util', () => {
    describe('#formulaName', () => {
        it('should hash the code with SHA-256', () => {
            expect(formulaName('')).toBe('formula_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        });

        // Formula names used to come from Node's crypto module. They are
        // stored in TemplateMark, so they must not change.
        it.each([
            ['simple code', 'return 1 + 2;'],
            ['multi-line code', 'const a = 1;\r\nconst b = 2;\nreturn a + b;'],
            ['non-ASCII text', 'return "ünïcødé 🙂 €";'],
            ['an unpaired surrogate', 'return "\uD800";'],
            ['long code', 'return now;'.repeat(10000)],
        ])('should match Node crypto for %s', (_name, code) => {
            const expected = 'formula_' + createHash('sha256').update(code).digest('hex');
            expect(formulaName(code)).toBe(expected);
        });
    });
});
