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

const string = '"([^"]*)"';
const identifier = '([a-zA-Z_][a-zA-Z0-9_]*)';
const name = '(?:\\s+([A-Za-z0-9_\-]+))';
var attribute = '(?:\\s+' + identifier + '(?:\\s*=\\s*' + string + ')?)';

const format = '(:?\\s+as\\s*'+ string + '\\s*)?';
const variable = '{{\\s*' + identifier + format + '\\s*}}';

const open_block = '{{#\\s*' + identifier + name + attribute + '*\\s*}}';
const close_block = '{{/\\s*' + identifier + '\\s*}}';
const formula = '{{%([^%]*)%}}';

const VARIABLE_RE = new RegExp('^(?:' + variable + ')');
const OPEN_BLOCK_RE = new RegExp('^(?:' + open_block + ')');
const CLOSE_BLOCK_RE = new RegExp('^(?:' + close_block + ')');
const FORMULA_RE = new RegExp('^(?:' + formula + ')');

/**
 * Extract attributes from opening blocks
 * @param {string[]} match
 * @return {*[]} attributes
 */
function getBlockAttributes(match) {
    const result = [];
    // name is always present in the block
    result.push([ 'name', match[2] ])
    // those are block attributes
    for(let i = 3; i < match.length; i = i+2) {
        if (match[i]) {
            result.push([ match[i], match[i+1] ]);
        }
    }
    return result;
}

module.exports.VARIABLE_RE = VARIABLE_RE;
module.exports.OPEN_BLOCK_RE = OPEN_BLOCK_RE;
module.exports.CLOSE_BLOCK_RE = CLOSE_BLOCK_RE;
module.exports.FORMULA_RE = FORMULA_RE;
module.exports.getBlockAttributes = getBlockAttributes;