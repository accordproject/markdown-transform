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

const { sanitizeHtmlChars } = require('./helpers');

/**
 * Inserts text.
 *
 * @param {string}  value Enclosing value of the OOXML tag
 * @returns {string} OOXML tag for the text
 */
const TEXT_RULE = (value) => {
    return `
        <w:r>
            <w:t xml:space="preserve">${sanitizeHtmlChars(value)}</w:t>
        </w:r>
    `;
};

/**
 * Inserts emphasised text.
 *
 * @param {string}  value  Enclosing value of the OOXML tag
 * @returns {string} OOXML tag for the emphasised text
 */
const EMPHASIS_RULE = (value) => {
    return `
        <w:r>
            <w:rPr>
                <w:i />
            </w:rPr>
            <w:t>${sanitizeHtmlChars(value)}</w:t>
        </w:r>
    `;
};

/**
 * Transforms the given heading node into OOXML heading.
 *
 * @param {string} value Text to be rendered as heading
 * @param {number} level Level of heading - ranges from 1 to 6
 * @returns {string} OOXMl for heading
 *
 */
const HEADING_RULE = (value, level) => {
    const definedLevels = {
        1: { style: 'Heading1', size: 25 },
        2: { style: 'Heading2', size: 20 },
        3: { style: 'Heading3', size: 16 },
        4: { style: 'Heading4', size: 16 },
        5: { style: 'Heading5', size: 16 },
        6: { style: 'Heading6', size: 16 },
    };

    return `
      <w:pPr>
        <w:pStyle w:val="${definedLevels[level].style}"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="${definedLevels[level].size * 2}"/>
        </w:rPr>
        <w:t xml:space="preserve">${sanitizeHtmlChars(value)}</w:t>
      </w:r>
    `;
};

module.exports = { TEXT_RULE, EMPHASIS_RULE, HEADING_RULE };