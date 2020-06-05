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

// Regexps to match template elements

'use strict';

const string = '"([^"]*)"';
const format = '(as\\s*'+ string + '\\s*)?';
const variable = '{{\\s*([A-Za-z][A-Za-z0-9]+)\\s*' + format + '}}';
const open_block = '{{#\\s*([A-Za-z][A-Za-z0-9]+)\\s*([A-Za-z][A-Za-z0-9]+)\\s*}}';
const close_block = '{{/\\s*([A-Za-z][A-Za-z0-9]+)\\s*}}';
const formula = '{{%([^%]*)%}}';

const VARIABLE_RE = new RegExp('^(?:' + variable + ')');
const OPEN_BLOCK_RE = new RegExp('^(?:' + open_block + ')');
const CLOSE_BLOCK_RE = new RegExp('^(?:' + close_block + ')');
const FORMULA_RE = new RegExp('^(?:' + formula + ')');

module.exports.VARIABLE_RE = VARIABLE_RE;
module.exports.OPEN_BLOCK_RE = OPEN_BLOCK_RE;
module.exports.CLOSE_BLOCK_RE = CLOSE_BLOCK_RE;
module.exports.FORMULA_RE = FORMULA_RE;
