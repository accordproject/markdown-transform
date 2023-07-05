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

'use strict';

const names = require('./names.json');

const string = '"([^"]*)"';
const identifier = '([a-zA-Z_][a-zA-Z0-9_]+)';
const name = '(?:\\s+([A-Za-z0-9_-]+))';
const attributes = '(.*)';

const format = '(:?\\s+as\\s*'+ string + '\\s*)?';
const variable = '{{\\s*' + identifier + format + '\\s*}}';

const open_block = '{{#\\s*' + identifier + name + attributes + '\\s*}}';
const close_block = '{{/\\s*' + identifier + '\\s*}}';
const formula = '{{%([^%]*)%}}';

const VARIABLE_RE = new RegExp('^(?:' + variable + ')');
const OPEN_BLOCK_RE = new RegExp('^(?:' + open_block + ')');
const CLOSE_BLOCK_RE = new RegExp('^(?:' + close_block + ')');
const FORMULA_RE = new RegExp('^(?:' + formula + ')');

/**
 * Parses an argument string into an object
 * @param {string} input the argument string to parse
 * @returns {[string]} an array of strings, key/value
 */
function parseArguments(input) {
    const regex = /(\w+)\s*=\s*"([^"]+)"/g;
    let match;
    const result = [];
    while ((match = regex.exec(input))) {
        const argName = match[1];
        const argValue = match[2];
        result.push([argName, argValue]);
    }
    return result;
}

/**
 * Extract attributes from opening blocks
 * @param {string[]} match the block data
 * @return {*[]} attributes
 */
function getBlockAttributes(match) {
    let result = [];
    // name is always present in the block
    result.push([ 'name', match[2] ]);

    // the fourth match is all the arguments
    // e.g. style="long" locale="en"
    if(match[3]) {
        const args = parseArguments(match[3]);
        if(args && args.length > 0) {
            result = result.concat(args);
        }
    }
    return result;
}

/**
 * Match opening blocks
 * @param {string} text - the text
 * @param {Array<string>} stack - the block stack
 * @return {*} open tag
 */
function matchOpenBlock(text,stack) {
    const match = text.match(OPEN_BLOCK_RE);
    if (!match) { return null; }
    const block_open = match[1];
    if (!names.blocks.includes(block_open)) { return null; }
    stack.unshift(block_open);
    return { tag: block_open, attrs: getBlockAttributes(match), matched: match };
}
/**
 * Match closing blocks
 * @param {string} text - the text
 * @param {string} block_open - the opening block name
 * @param {Array<string>} stack - the block stack
 * @return {*} close tag
 */
function matchCloseBlock(text,block_open,stack) {
    const match = text.match(CLOSE_BLOCK_RE);
    if (!match) {
        return null;
    }
    const block_close = match[1];
    // Handle proper nesting
    if (stack[0] === block_close) {
        stack.shift();
    }
    // Handle stack depleted
    if (stack.length > 0) {
        return null;
    } else {
        return { tag: block_close, matched: match };
    }
}

module.exports.VARIABLE_RE = VARIABLE_RE;
module.exports.OPEN_BLOCK_RE = OPEN_BLOCK_RE;
module.exports.CLOSE_BLOCK_RE = CLOSE_BLOCK_RE;
module.exports.FORMULA_RE = FORMULA_RE;
module.exports.matchOpenBlock = matchOpenBlock;
module.exports.matchCloseBlock = matchCloseBlock;
module.exports.getBlockAttributes = getBlockAttributes;