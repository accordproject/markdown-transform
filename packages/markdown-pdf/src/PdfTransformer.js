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
const PdfPrinter = require('pdfmake');
const ToPdfMakeVisitor = require('./ToPdfMakeVisitor');
const fonts = {
    Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
    },
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
    },
    Symbol: {
        normal: 'Symbol'
    },
    ZapfDingbats: {
        normal: 'ZapfDingbats'
    },
    LiberationSerif: {
        normal: `${__dirname}/fonts/LiberationSerif-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationSerif-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationSerif-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationSerif-BoldItalic.ttf`
    },
    Roboto: {
        normal: `${__dirname}/fonts/Roboto-Regular.ttf`,
        bold: `${__dirname}/fonts/Roboto-Medium.ttf`,
        italics: `${__dirname}/fonts/Roboto-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/Roboto-MediumItalic.ttf`
    }
};

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

    /**
     * Converts a CiceroMark DOM to a PDF Buffer
     * @param {*} input - CiceroMark DOM
     * @param {*} outputStream - the output stream
     */
    async toPdf(input, outputStream) {

        const printer = new PdfPrinter(fonts);

        if(!input.getType) {
            input = this.ciceroMarkTransformer.getSerializer().fromJSON(input);
        }

        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToPdfMakeVisitor(this.options);
        input.accept(visitor, parameters);
        console.log(JSON.stringify(parameters.result, null, 2));

        // let docDefinition = {
        //     content: [
        //         'First paragraph',
        //         'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
        //     ]
        // };

        // parameters.result
        const pdfDoc = printer.createPdfKitDocument(parameters.result);
        pdfDoc.pipe(outputStream);
        pdfDoc.end();
    }
}

module.exports = PdfTransformer;