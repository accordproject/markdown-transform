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

const mammoth = require('mammoth');

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Converts a DOCX file to a CiceroMark DOM
 */
class DocxTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options = {}) {
        this.options = options;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
    }

    /**
     * Converts an html string to a CiceroMark DOM
     * @param {Buffer} input - docx buffer
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {promise} promise to the CiceroMark DOM
     */
    async toCiceroMark(input, format = 'concerto') {
        const result = await mammoth.convertToMarkdown({buffer: input});
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        return ciceroMarkTransformer.fromMarkdown(result.value, format);
    }
}

module.exports = DocxTransformer;