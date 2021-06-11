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

const { sanitizeHtmlChars } = require('./CiceroMarkToOOXMLHelpers');

/**
 * Inserts text.
 *
 * @param {string}  value Enclosing value of the OOXML tag
 * @returns {string} OOXML tag for the text
 */
const TEXT_RULE = (value) => {
    return `<w:r><w:t xml:space="preserve">${sanitizeHtmlChars(value)}</w:t></w:r>`;
};

/**
 * Inserts emphasised text.
 *
 * @param {string}  value  Enclosing value of the OOXML tag
 * @returns {string} OOXML tag for the emphasised text
 */
const EMPHASIS_RULE = (value) => {
    return `<w:r><w:rPr><w:i w:val="true" /></w:rPr><w:t>${sanitizeHtmlChars(value)}</w:t></w:r>`;
};

module.exports = { TEXT_RULE, EMPHASIS_RULE };