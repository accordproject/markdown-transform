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

const ToPdfMake = require('./ToPdfMake');
const ToCiceroMark = require('./ToCiceroMark');

const PdfPrinter = require('pdfmake');
const { defaultFonts } = require('./pdfmakeutil');

/**
 * Converts a PDF to CiceroMark DOM
 */
class PdfTransformer {
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
     * Converts a CiceroMark DOM to a pdfmake DOM
     * @param {*} input - CiceroMark DOM (JSON)
     * @param {*} options - the PDF generation options
     * @param {boolean} [options.saveCiceroMark] - whether to save source CiceroMark as a custom property (defaults to true)
     * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
     * @return {*} the pdfmake DOM
     */
    static async ciceroMarkToPdfMake(input, options = { saveCiceroMark: true }) {
        // The JSON document in pdfmake format
        const dd = await ToPdfMake.CiceroMarkToPdfMake(input, options);
        return dd;
    }

    /**
     * Converts a TemplateMark DOM to a pdfmake DOM
     * @param {*} input - TemplateMark DOM (JSON)
     * @param {*} options - the PDF generation options
     * @param {boolean} [options.saveCiceroMark] - whether to save source CiceroMark as a custom property (defaults to true)
     * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
     * @return {*} the pdfmake DOM
     */
    static async templateMarktoPdfMake(input, options = { saveTemplateMark: true }) {
        // The JSON document in pdfmake format
        const dd = await ToPdfMake.TemplateMarkToPdfMake(input, options);
        return dd;
    }

    /**
     * Converts a pdfmake DOM to a PDF Buffer
     * @param {*} input - pdfmake DOM (JSON)
     * @param {*} outputStream - the output stream
     */
    static async pdfMakeToPdf(input, outputStream) {
        // Default fonts are better defined at rendering time
        input.defaultStyle = {
            fontSize: 12,
            font: 'LiberationSerif',
            lineHeight: 1.5
        };

        // The Pdf printer
        const printer = new PdfPrinter(defaultFonts);

        // Printing to stream
        const pdfDoc = printer.createPdfKitDocument(input);
        pdfDoc.pipe(outputStream);
        pdfDoc.end();
    }

}

module.exports = PdfTransformer;
