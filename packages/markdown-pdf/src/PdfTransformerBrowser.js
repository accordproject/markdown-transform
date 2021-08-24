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

const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PdfTransformerBase = require('./PdfTransformerBase');

const dsutil = require('./dsutil');

/**
 * Converts to PDF
 */
class PdfTransformerBrowser extends PdfTransformerBase {
    /**
     * Converts a pdfmake DOM to a PDF Buffer
     * @param {*} input - pdfmake DOM (JSON)
     * @return {*} a promise to a pdf buffer
     */
    static async pdfMakeToPdfBuffer(input) {
        const pdfDocGenerator = pdfMake.createPdf(input);
        const bufferPromise = () => new Promise(resolve => {
            pdfDocGenerator.getBuffer(buffer => {
                resolve(buffer);
            });
        });
        const result = await bufferPromise();
        return result;
    }

    /**
     * Converts a pdfmake DOM to a base64 string
     * @param {*} input - pdfmake DOM (JSON)
     * @param {*} progressCallback - the pdfmake progressCallback function
     * @param {*} callback - a callback function
     * @return {*} a promise to a pdf buffer
     */
    static async pdfMakeToBase64(input, progressCallback, callback) {
        const pdfDocGenerator = pdfMake.createPdf(input);
        const base64Promise = () => new Promise(resolve => {
            pdfDocGenerator.getBase64((data) => {
                resolve(callback(data));
            }, { progressCallback });
        });
        const result = await base64Promise();
        return result;
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
                    x,
                    y,
                    options,
                    pageNb,
                    role: item.Participant ? item.Participant.role : 'Customer',
                });
            }
        };

        return PdfTransformerBrowser.pdfMakeToBase64(input, progressCallback, (pdfBase64) => {
            const totalPages = 3; // XXX Should be calculated
            const dsTemplate = dsutil.createDocuSignTemplate(name, roles, pdfBase64, totalPages, variables);
            return dsTemplate;
        });
    }
}

module.exports = PdfTransformerBrowser;
