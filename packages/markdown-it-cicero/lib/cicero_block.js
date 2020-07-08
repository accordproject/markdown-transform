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

const OPEN_BLOCK_RE = require('./cicero_re').OPEN_BLOCK_RE;
const CLOSE_BLOCK_RE = require('./cicero_re').CLOSE_BLOCK_RE;

function cicero_block(state, startLine, endLine, silent) {
    let block_name,
        name,
        match;

    let pos, nextLine, markup, token,
        old_parent, old_line_max,
        auto_closed = false,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine],
        stack = [];

    // Check out the first three characters quickly,
    // this should filter out most of non-containers
    //
    if (0x7B/* { */ !== state.src.charCodeAt(start)) { return false; }
    if (0x7B/* { */ !== state.src.charCodeAt(start+1)) { return false; }
    if (0x23/* # */ !== state.src.charCodeAt(start+2)) { return false; }

    match = state.src.slice(start).match(OPEN_BLOCK_RE);
    if (!match) { return false; }

    const block_open = match[1];
    if (block_open !== 'clause') { return false; }

    block_name = block_open;
    name = match[2];
    markup = '';

    // Since start is found, we can report success here in validation mode
    //
    if (silent) { return true; }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
        nextLine++;
        if (nextLine >= endLine) {
            // unclosed block should be autoclosed by end of document.
            // also block seems to be autoclosed by end of parent
            break;
        }

        start = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (start < max && state.sCount[nextLine] < state.blkIndent) {
            // non-empty line with negative indent should stop the list:
            // - ```
            //  test
            break;
        }

        // Check out the first three character quickly,
        // this should filter out most of non-containers
        //
        if (0x7B/* { */ !== state.src.charCodeAt(start)) { continue; }
        if (0x7B/* { */ !== state.src.charCodeAt(start+1)) { continue; }
        if (0x2F/* / */ !== state.src.charCodeAt(start+2)) { continue; }

        if (state.sCount[nextLine] - state.blkIndent >= 4) {
            // closing fence should be indented less than 4 spaces
            continue;
        }

        match = state.src.slice(start).match(CLOSE_BLOCK_RE);
        if (!match) { continue; }

        const block_close = match[1];
        if (block_close !== block_open) { continue; }

        // make sure tail has spaces only
        pos = start + match[0].length;
        pos = state.skipSpaces(pos);

        if (pos < max) { continue; }

        // found!
        auto_closed = true;
        break;
    }

    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = 'block';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token        = state.push('block_' + block_name + '_open', 'div', 1);
    token.markup = markup;
    token.block  = true;
    token.info   = '';
    token.map    = [ startLine, nextLine ];

    token.attrs = [ [ 'name', name ] ];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token        = state.push('block_' + block_name + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block  = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
}

module.exports = cicero_block;
