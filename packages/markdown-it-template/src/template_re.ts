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

import names from './names.json';

const string = '"([^"]*)"';
const identifier = '([a-zA-Z_][a-zA-Z0-9_]+)';
const name = '(?:\\s+([A-Za-z0-9_-]+))';
const attributes = '(.*?)';

const format = '(:?\\s+as\\s*' + string + '\\s*)?';
const variable = '{{\\s*' + identifier + format + '\\s*}}';

const open_block = '{{#\\s*' + identifier + name + attributes + '\\s*}}';
const close_block = '{{/\\s*' + identifier + '\\s*}}';
const formula = '{{%([^%]*)%}}';

export const VARIABLE_RE = new RegExp('^(?:' + variable + ')');
export const OPEN_BLOCK_RE = new RegExp('^(?:' + open_block + ')');
export const CLOSE_BLOCK_RE = new RegExp('^(?:' + close_block + ')');
export const FORMULA_RE = new RegExp('^(?:' + formula + ')');

/**
 * Parses an argument string into an object
 */
function parseArguments(input: string): [string, string][] {
    const regex = /(\w+)\s*=\s*"([^"]+)"/g;
    let match;
    const result: [string, string][] = [];
    while ((match = regex.exec(input))) {
        const argName = match[1];
        const argValue = match[2];
        result.push([argName, argValue]);
    }
    return result;
}

/**
 * Extract attributes from opening blocks
 */
export function getBlockAttributes(match: RegExpMatchArray): [string, string][] {
    let result: [string, string][] = [];
    result.push(['name', match[2]]);
    if (match[3]) {
        const args = parseArguments(match[3]);
        if (args && args.length > 0) {
            result = result.concat(args);
        }
    }
    return result;
}

/**
 * Match opening blocks
 */
export function matchOpenBlock(text: string, stack: string[]): { tag: string; attrs: [string, string][]; matched: RegExpMatchArray } | null {
    const match = text.match(OPEN_BLOCK_RE);
    if (!match) { return null; }
    const block_open = match[1];
    if (!names.blocks.includes(block_open)) { return null; }
    stack.unshift(block_open);
    return { tag: block_open, attrs: getBlockAttributes(match), matched: match };
}

/**
 * Match closing blocks
 */
export function matchCloseBlock(text: string, _block_open: string, stack: string[]): { tag: string; matched: RegExpMatchArray } | null {
    const match = text.match(CLOSE_BLOCK_RE);
    if (!match) {
        return null;
    }
    const block_close = match[1];
    if (stack[0] === block_close) {
        stack.shift();
    }
    if (stack.length > 0) {
        return null;
    } else {
        return { tag: block_close, matched: match };
    }
}
