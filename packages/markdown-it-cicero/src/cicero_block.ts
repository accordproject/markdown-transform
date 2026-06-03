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

import { matchOpenBlock, matchCloseBlock } from './cicero_re';

export function cicero_block(state: any, startLine: number, endLine: number, silent: boolean): boolean {
    let match;
    let pos: number;
    let nextLine: number;
    let token: any;
    let auto_closed = false;
    let start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    const stack: string[] = [];

    if (0x7B !== state.src.charCodeAt(start)) { return false; }
    if (0x7B !== state.src.charCodeAt(start + 1)) { return false; }
    if (0x23 !== state.src.charCodeAt(start + 2)) { return false; }

    match = matchOpenBlock(state.src.slice(start), stack);
    if (!match) { return false; }

    pos = start + match.matched[0].length;
    pos = state.skipSpaces(pos);

    if (pos < max) { return false; }

    const block_open = match.tag;
    const attrs = match.attrs;
    const block_name = block_open;
    const markup = '';

    if (silent) { return true; }

    nextLine = startLine;

    for (; ;) {
        nextLine++;
        if (nextLine >= endLine) {
            break;
        }

        start = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (start < max && state.sCount[nextLine] < state.blkIndent) {
            break;
        }

        if (0x7B !== state.src.charCodeAt(start)) { continue; }
        if (0x7B !== state.src.charCodeAt(start + 1)) { continue; }
        if (0x2F !== state.src.charCodeAt(start + 2) && 0x23 !== state.src.charCodeAt(start + 2)) { continue; }

        if (0x23 === state.src.charCodeAt(start + 2)) {
            match = matchOpenBlock(state.src.slice(start), stack);
            continue;
        }

        if (state.sCount[nextLine] - state.blkIndent >= 4) {
            continue;
        }

        match = matchCloseBlock(state.src.slice(start), block_open, stack);
        if (!match) { continue; }

        pos = start + match.matched[0].length;
        pos = state.skipSpaces(pos);

        if (pos < max) { continue; }

        auto_closed = true;
        break;
    }

    const old_parent = state.parentType;
    const old_line_max = state.lineMax;
    state.parentType = 'block';

    state.lineMax = nextLine;

    token = state.push('block_' + block_name + '_open', 'div', 1);
    token.markup = markup;
    token.block = true;
    token.info = '';
    token.map = [startLine, nextLine];

    token.attrs = attrs;

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token = state.push('block_' + block_name + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
}

export default cicero_block;
