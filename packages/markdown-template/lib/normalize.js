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
 * Normalize to markdown cicero text
 * @param {*} input - the CiceroMark DOM
 * @return {string} - the normalized markdown cicero text
 */
function normalizeToMarkdownCicero(input) {
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    const result = ciceroMarkTransformer.toMarkdownCicero(input);
    return result;
}

/**
 * Normalize from markdown cicero text
 * @param {string} input - the markdown cicero text
 * @return {object} - the normalized CiceroMark DOM
 */
function normalizeFromMarkdownCicero(input) {
    // Normalizes new lines
    const inputNLs = normalizeNLs(input);
    // Roundtrip through the CommonMark parser
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    return ciceroMarkTransformer.fromMarkdownCicero(inputNLs);
}

/**
 * Normalize markdown cicero text
 * @param {string} input - the markdown cicero text
 * @return {string} - the normalized text
 */
function normalizeCiceroMark(input) {
    // Roundtrip through the CiceroMark parser
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    const result = ciceroMarkTransformer.toMarkdownCicero(ciceroMarkTransformer.fromMarkdownCicero(input));
    return result;
}

module.exports.normalizeNLs = normalizeNLs;
module.exports.normalizeToMarkdownCicero = normalizeToMarkdownCicero;
module.exports.normalizeFromMarkdownCicero = normalizeFromMarkdownCicero;
module.exports.normalizeCiceroMark = normalizeCiceroMark;
