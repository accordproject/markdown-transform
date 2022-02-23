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

const Stream = require('stream');

const ToPdfMake = require('./ToPdfMake');

const PdfPrinter = require('pdfmake');
const { defaultFonts } = require('./pdfmakeutil');

/**
 * Converts to PDF
 */
class PdfTransformerBase {
    /**
     * Generates a buffer for a pdf document
     * @param {object} input - the pdfmake DOM
     * @param {*} t - the transform
     * @return {*} a promise to a buffer
     */
    static toBuffer(input, t) {
        const outputStream = new Stream.Writable();

        let arrayBuffer = new ArrayBuffer(8);
        let memStore = Buffer.from(arrayBuffer);
        outputStream._write = (chunk, encoding, next) => {
            let buffer = (Buffer.isBuffer(chunk))
                ? chunk  // already is Buffer use it
                : new Buffer(chunk, encoding);  // string, convert

            // concat to the buffer already there
            memStore = Buffer.concat([memStore, buffer]);
            next();
        };

        return new Promise((resolve) => {
            outputStream.on('finish', () => {
                resolve(memStore);
            });
            // Call the transform, passing the stream
            return t(input, outputStream);
        });
    }

    /**
     * Generates a base64 string for a pdf document
     * @param {object} input - the pdfmake DOM
     * @param {*} t - the transform
     * @return {string} a base64 encoded string for the pdf
     */
    static toBase64(input, t) {
        return PdfTransformerBase.toBuffer(input, t).then((buffer) => {
            const bytes = Buffer.from(buffer);
            return bytes.toString('base64');
        });
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
    static async templateMarkToPdfMake(input, options = { saveTemplateMark: true }) {
        // The JSON document in pdfmake format
        const dd = await ToPdfMake.TemplateMarkToPdfMake(input, options);
        return dd;
    }

    /**
     * Converts a pdfmake DOM to a PDF Buffer
     * @param {*} progressCallback - a callback function used during pdf emit
     * @return {*} a function from input and stream, adding the pdf to the stream
     */
    static pdfMakeToPdfStreamWithCallback(progressCallback) {
        return (input, outputStream) => {

            if (!input.defaultStyle) {
                // Default fonts are better defined at rendering time
                input.defaultStyle = {
                    fontSize: 12,
                    font: 'LiberationSerif',
                    lineHeight: 1.5
                };
            }

            // The Pdf printer
            const printer = new PdfPrinter(defaultFonts);

            // Printing to stream
            const pdfDoc = printer.createPdfKitDocument(input, { progressCallback });
            pdfDoc.pipe(outputStream);
            pdfDoc.end();
        };
    }

    /**
     * Converts a pdfmake DOM to a PDF Buffer
     * @param {*} input - pdfmake DOM (JSON)
     * @param {*} outputStream - the output stream
     */
    static async pdfMakeToPdfStream(input, outputStream) {
        return PdfTransformerBase.pdfMakeToPdfStreamWithCallback()(input, outputStream);
    }
}

module.exports = PdfTransformerBase;
