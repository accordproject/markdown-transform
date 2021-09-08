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

const ToCiceroMark = require('./ToCiceroMark');
const PdfTransformerBase = require('./PdfTransformerBase');

const dsutil = require('./dsutil');

/**
 * Converts a PDF to CiceroMark DOM
 */
class PdfTransformer extends PdfTransformerBase {
    /**
     * Converts an pdf buffer to a CiceroMark DOM
     * @param {Buffer} input - pdf buffer
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @param {object} [options] - the PDF parsing options
     * @param {number} [options.paragraphVerticalOffset] - the vertical offset used to detect
     * pararaphs as a multiple of the line height (defaults to 2)
     * @param {boolean} [options.preservePages] - whether to preserve PDF page breaks (defaults to false)
     * @param {boolean} [options.loadCiceroMark] - whether to load embedded CiceroMark (defaults to true)
     * @param {boolean} [options.loadTemplates] - whether to load embedded templates (defaults to false)
     * @returns {promise} a Promise to the CiceroMark DOM
     */
    static async toCiceroMark(input, format = 'concerto', options = { paragraphVerticalOffset: 2, preservePages: false, loadCiceroMark: true }) {
        return ToCiceroMark(input, format, options);
    }

    /**
     * Converts a pdfmake DOM to a PDF Buffer
     * @param {*} input - pdfmake DOM (JSON)
     * @param {*} progressCallback - a callback function used during pdf emit
     * @return {*} a pdf buffer
     */
    static async pdfMakeToPdfBuffer(input, progressCallback) {
        return PdfTransformerBase.toBuffer(input, PdfTransformerBase.pdfMakeToPdfStreamWithCallback(progressCallback));
    }

    /**
     * Converts a pdfmake DOM to a DocuSign template
     * @param {*} input - pdfmake DOM (JSON)
     * @param {string} name - the template name
     * @param {string[]} roles - an array of participants roles
     * @param {*} outputStream - the output stream
     */
    static async pdfMakeToDsTemplate(input, name, roles) {
        // Progress data
        const variables = [];
        const progressCallback = (item, x, y, options, pageNb) => {
            if (item.style === 'VariableDefinition' ||
                item.style === 'EnumVariableDefinition' ||
                item.style === 'FormattedVariableDefinition') {
                variables.push({
                    name: item.text,
                    path: item.path,
                    x,
                    y,
                    options,
                    pageNb,
                    role: item.Participant ? item.Participant.role : 'Customer',
                });
            }
        };

        return PdfTransformerBase.toBase64(input, PdfTransformerBase.pdfMakeToPdfStreamWithCallback(progressCallback)).then((pdfBase64) => {
            const totalPages = 3; // XXX Should be calculated
            const dsTemplate = dsutil.createDocuSignTemplate(name, roles, pdfBase64, totalPages, variables);
            return dsTemplate;
        });
    }
}

module.exports = PdfTransformer;
