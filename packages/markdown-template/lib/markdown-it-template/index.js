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

const ParseException = require('@accordproject/concerto-core').ParseException;
let P = require('parsimmon');

// Regexps to match template elements

const VARIABLE_RE = require('./template_re').VARIABLE_RE;
const OPEN_BLOCK_RE = require('./template_re').OPEN_BLOCK_RE;
const CLOSE_BLOCK_RE = require('./template_re').CLOSE_BLOCK_RE;
const FORMULA_RE = require('./template_re').FORMULA_RE;

function template_plugin(md) {
    function template_inline(state, silent) {
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
        if (ch === 0x23/* # */) {
            match = state.src.slice(pos).match(OPEN_BLOCK_RE);
            if (!match) { return false; }

            const block = match[1];
            if (block !== 'if' && block !== 'clause' && block !== 'with') {
                return false;
            }
            if (!silent) {
                token         = state.push(block + '_block_inline_open', '', 0);
                token.content = match[0];
            }
            if (block === 'if') {
                token.attrs = [ [ 'name', match[2] ] ]
            }
            state.pos += match[0].length;
            return true;
        } else if (ch === 0x2F/* / */) {
            match = state.src.slice(pos).match(CLOSE_BLOCK_RE);
            if (!match) { return false; }

            const block = match[1];
            if (block !== 'if' && block !== 'clause' && block !== 'with') {
                return false;
            }
            if (!silent) {
                token         = state.push(block + '_block_inline_close', '', 0);
                token.content = match[1];
            }
            state.pos += match[0].length;
            return true;
        } else if (ch === 0x25/* % */) {
            match = state.src.slice(pos).match(FORMULA_RE);
            if (!match) { return false; }

            if (!silent) {
                token         = state.push('formula', '', 0);
                token.content = match[1];
            }
            state.pos += match[0].length;
            return true;
        } else {
            match = state.src.slice(pos).match(VARIABLE_RE);
            if (!match) { return false; }
            if (!silent) {
                token         = state.push('variable', '', 0);
                token.content = match[0];
            }
            token.attrs = [ [ 'name', match[1] ] ];
            if (match[3]) {
                token.attrs.push([ 'format', match[3] ]);
            }
            state.pos += match[0].length;
            return true;
        }
    };

    md.inline.ruler.before('emphasis', 'template', template_inline);
}
module.exports = template_plugin;
