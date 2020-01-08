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

const parsePdf = require('easy-pdf-parser').parsePdf;
const extractPlainText = require('easy-pdf-parser').extractPlainText;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Converts a PDF to CiceroMark DOM
 */
class PdfTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options = {}) {
        this.options = options;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
    }

    /**
     * Converts an pdf buffer to a CiceroMark DOM
     * @param {Buffer} input - pdf buffer
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {promise} a Promise to the CiceroMark DOM
     */
    async toCiceroMark(input, format = 'concerto') {
        const plainText = await parsePdf(input).then(extractPlainText);
        return this.ciceroMarkTransformer.fromMarkdown(plainText, format);

    }
}

module.exports = PdfTransformer;