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

// Regexps to match template elements

const VARIABLE_RE = require('./template_re').VARIABLE_RE;
const OPEN_BLOCK_RE = require('./template_re').OPEN_BLOCK_RE;
const CLOSE_BLOCK_RE = require('./template_re').CLOSE_BLOCK_RE;
const FORMULA_RE = require('./template_re').FORMULA_RE;
const getBlockAttributes = require('./template_re').getBlockAttributes;

function template_inline(state, silent) {
    let ch, match, max, token, attrs,
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
        if (silent) { return false; }

        match = state.src.slice(pos).match(OPEN_BLOCK_RE);
        if (!match) { return false; }

        attrs = getBlockAttributes(match);

        const block = match[1];
        if (block !== 'if' && block !== 'optional' && block !== 'with' && block !== 'join') {
            return false;
        }
        token         = state.push('inline_block_' + block + '_open', 'div', 1);
        token.content = match[0];
        token.attrs = attrs;

        state.pos += match[0].length;

        return true;
    } else if (ch === 0x2F/* / */) {
        if (silent) { return false; }

        match = state.src.slice(pos).match(CLOSE_BLOCK_RE);
        if (!match) { return false; }

        const block = match[1];
        if (block !== 'if' && block !== 'optional' && block !== 'with' && block !== 'join') {
            return false;
        }

        token         = state.push('inline_block_' + block + '_close', 'div', -1);
        token.content = match[1];
        state.pos += match[0].length;

        return true;
    } else if (ch === 0x25/* % */) {
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
        match = state.src.slice(pos).match(VARIABLE_RE);
        if (!match) { return false; }
        const content = match[0];
        const name = match[1];
        const format = match[3];
        if (!silent) {
            if (name === 'else') { // XXX 'else' is reserved in variable names
                token         = state.push('inline_block_else', 'else', 0);
                token.content = content;
            } else if (name === 'this') { // XXX 'this' is reserved in variable names
                token         = state.push('this', 'this', 0);
                token.content = content;
                token.attrs = [ ];
            } else {
                token         = state.push('variable', 'variable', 0);
                token.content = content;
                token.attrs = [ [ 'name', name ] ];
                if (format) {
                    token.attrs.push([ 'format', format ]);
                }
            }
        }
        state.pos += content.length;
        return true;
    }
}

module.exports = template_inline;
