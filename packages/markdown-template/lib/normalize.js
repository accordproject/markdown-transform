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

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text
 * @return {string} - the normalized text
 */
function normalizeNLs(input) {
    // we replace all \r and \n with \n
    let text =  input.replace(/\r/gm,'');
    return text;
}

/**
 * Normalize CiceroMark to markdown text
 * @param {*} input - the CiceroMark DOM
 * @return {string} - the normalized markdown text
 */
function normalizeToMarkdown(input) {
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    const result = ciceroMarkTransformer.toMarkdown(input);
    return result;
}

/**
 * Normalize markdown text
 * @param {string} input - the markdown text
 * @return {string} - the normalized markdown text
 */
function normalizeMarkdown(input) {
    // Normalizes new lines
    const inputNLs = normalizeNLs(input);
    // Roundtrip the grammar through the Ciceromark parser
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    const concertoAst = ciceroMarkTransformer.fromMarkdown(inputNLs);
    const result = normalizeToMarkdown(concertoAst);
    return result;
}

module.exports.normalizeNLs = normalizeNLs;
module.exports.normalizeToMarkdown = normalizeToMarkdown;
module.exports.normalizeMarkdown = normalizeMarkdown;