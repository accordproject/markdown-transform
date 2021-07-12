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

const { sanitizeHtmlChars, titleGenerator } = require('./helpers');

/**
 * Wraps given value in OOXML text(<w:t>) tag.
 *
 * @param {string}  value Enclosing value of the OOXML tag
 * @returns {string} OOXML tag for the text
 */
const TEXT_RULE = value => {
    return `
      <w:t xml:space="preserve">${sanitizeHtmlChars(value)}</w:t>
    `;
};

/**
 * Provides the OOXML for emphasis.
 *
 * @returns {string} Emphasis properties in OOXML tag
 */
const EMPHASIS_RULE = () => {
    return `
      <w:i/>
      <w:iCs/>
    `;
};

/**
 * Generates OOXML for paragraph properties.
 *
 * @param {string} level Level of heading
 * @returns {string} OOXML tag for paragraph properties
 */
const HEADING_PROPERTIES_RULE = (level = '') => {
    const headingLevels = {
        1: { style: 'Heading1', size: 25 },
        2: { style: 'Heading2', size: 20 },
        3: { style: 'Heading3', size: 16 },
        4: { style: 'Heading4', size: 16 },
        5: { style: 'Heading5', size: 16 },
        6: { style: 'Heading6', size: 16 },
    };

    return `
      <w:pPr>
        ${level ? `<w:pStyle w:val="${headingLevels[level].style}"/>` : ''}
      </w:pPr>
    `;
};

/**
 * Wraps given value in OOXML paragraph(<w:p>) tag.
 *
 * @param {string} value OOXML to be wrapped
 * @returns {string} Value wrapped in OOXML paragraph tag.
 */
const PARAGRAPH_RULE = value => {
    return `
      <w:p>
        ${value}
      </w:p>
    `;
};

/**
 * Wraps the style properties in <w:rPr> tags
 *
 * @param {string} value Style properties to be wrapped
 * @returns {string} Value wrapped in <w:rPr>
 */
const TEXT_STYLES_RULE = value => {
    return `
    <w:rPr>
      ${value}
    </w:rPr>
  `;
};

/**
 * Wraps the properties and text to be rendered in <w:r> tag.
 *
 * @param {*} properties Styling properties in OOXML tags format for a node
 * @param {*} value Text value to be rendered for a node
 * @returns {string} OOXML tag containing style properties and text value
 */
const TEXT_WRAPPER_RULE = (properties, value) => {
    return `
      <w:r>
        ${properties}
        ${value}
      </w:r>`;
};

/**
 * Provides OOXML for strong.
 *
 * @returns {string} OOXML tag for the strong property
 */
const STRONG_RULE = () => {
    return `
      <w:b />
      <w:bCs />
    `;
};

/**
 * Inserts a variable.
 *
 * @param {string} title Title of the variable. Eg. receiver-1, shipper-1
 * @param {string} tag   Name of the variable. Eg. receiver, shipper
 * @param {string} value Value of the variable
 * @param {string} type  Type of the variable - Long, Double, etc.
 * @returns {string} OOXML string for the variable
 */
const VARIABLE_RULE = (title, tag, value, type) => {
    return `
      <w:sdt>
        <w:sdtPr>
          <w:rPr>
            <w:sz w:val="24"/>
          </w:rPr>
          <w:alias w:val="${titleGenerator(title, type)}"/>
          <w:tag w:val="${tag}"/>
        </w:sdtPr>
        <w:sdtContent>
          <w:r>
            <w:rPr>
              <w:sz w:val="24"/>
            </w:rPr>
            <w:t xml:space="preserve">${sanitizeHtmlChars(value)}</w:t>
          </w:r>
        </w:sdtContent>
      </w:sdt>
    `;
};

/**
 * Inserts a soft break.
 *
 * @returns {string} OOXML for softbreak
 */
const SOFTBREAK_RULE = () => {
    return `
      <w:r>
        <w:sym w:font="Calibri" w:char="2009" />
      </w:r>
    `;
};

const CODE_PROPERTIES_RULE = () => {
    return `
      <w:color w:val="C7254E" />
      <w:shd w:fill="F9F2F4"/>
    `;
};

const THEMATICBREAK_RULE = () => {
    return `
      <w:p>
        <w:pPr>
          <w:pBdr>
            <w:bottom w:val="single" w:sz="6" w:space="1" w:color="auto"/>
          </w:pBdr>
        </w:pPr>
      </w:p>
    `;
};

module.exports = {
    TEXT_RULE,
    EMPHASIS_RULE,
    TEXT_STYLES_RULE,
    TEXT_WRAPPER_RULE,
    HEADING_PROPERTIES_RULE,
    PARAGRAPH_RULE,
    VARIABLE_RULE,
    SOFTBREAK_RULE,
    STRONG_RULE,
    CODE_PROPERTIES_RULE,
    THEMATICBREAK_RULE,
};
