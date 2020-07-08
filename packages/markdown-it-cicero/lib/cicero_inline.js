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

'use strict';

// Regexps to match cicero elements

const VARIABLE_RE = require('./cicero_re').VARIABLE_RE;
const OPEN_BLOCK_RE = require('./cicero_re').OPEN_BLOCK_RE;
const CLOSE_BLOCK_RE = require('./cicero_re').CLOSE_BLOCK_RE;
const FORMULA_RE = require('./cicero_re').FORMULA_RE;

function cicero_inline(state, silent) {
    let ch, match, max, token,
        pos = state.pos;

    // Check start
    max = state.posMax;
    if (state.src.charCodeAt(pos) !== 0x7B/* { */ ||
        pos + 2 >= max) {
        return false;
    }

    // Quick fail on second char
    ch = state.src.charCodeAt(pos + 1);
    if (ch !== 0x7B/* { */) {
        return false;
    }

    // Quick dispatch on third char
    ch = state.src.charCodeAt(pos + 2);
    if (ch === 0x25/* % */) {
        match = state.src.slice(pos).match(FORMULA_RE);
        if (!match) { return false; }

        if (!silent) {
            token         = state.push('formula', 'formula', 0);
            token.content = match[1];
            token.attrs = [ [ 'name', 'formula' ] ];
        }
        state.pos += match[0].length;

        return true;
    } else {
        return false;
    }
}

module.exports = cicero_inline;
