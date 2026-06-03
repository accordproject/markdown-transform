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

// Regexps to match cicero elements

import { FORMULA_RE } from './cicero_re';

export function cicero_inline(state: any, silent: boolean): boolean {
    let ch: number;
    let match;
    let token: any;
    const pos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x7B ||
        pos + 2 >= max) {
        return false;
    }

    ch = state.src.charCodeAt(pos + 1);
    if (ch !== 0x7B) {
        return false;
    }

    ch = state.src.charCodeAt(pos + 2);
    if (ch === 0x25) {
        match = state.src.slice(pos).match(FORMULA_RE);
        if (!match) { return false; }

        if (!silent) {
            token = state.push('formula', 'formula', 0);
            token.content = match[1];
            token.attrs = [['name', 'formula']];
        }
        state.pos += match[0].length;

        return true;
    } else {
        return false;
    }
}

export default cicero_inline;
