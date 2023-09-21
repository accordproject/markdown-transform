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
}

module.exports = PdfTransformerBrowser;
