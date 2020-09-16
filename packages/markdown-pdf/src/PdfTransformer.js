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

// HACK few hacks to let PDF.js be loaded not as a module in global space.
require('./domstubs.js').setStubs(global);

let pdfjsLib = require('pdfjs-dist/es5/build/pdf.js');

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
    LiberationSans: {
        normal: `${__dirname}/fonts/LiberationSans-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationSans-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationSans-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationSans-BoldItalic.ttf`
    },
    LiberationMono: {
        normal: `${__dirname}/fonts/LiberationMono-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationMono-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationMono-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationMono-BoldItalic.ttf`
    },
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
     * @param {object} [options] - the PDF parsing options
     * @param {number} [options.paragraphVerticalOffset] - the vertical offset used to detect
     * pararaphs as a multiple of the line height (defaults to 2)
     * @param {boolean} [options.preservePages] - whether to preserve PDF page breaks (defaults to true)
     * @returns {promise} a Promise to the CiceroMark DOM
     */
    async toCiceroMark(input, format = 'concerto', options = { paragraphVerticalOffset: 2, preservePages: false }) {

        let loadingTask = pdfjsLib.getDocument(input.buffer);

        const doc = await loadingTask.promise;
        let numPages = doc.numPages;
        const metadata = await doc.getMetadata();

        const pages = [];
        for( let n=1; n <= numPages; n++) {
            const page = await doc.getPage(n);
            const content = await page.getTextContent({
                normalizeWhitespace: true,
                disableCombineTextItems: true,
            });

            let currentPara = null;
            let lastY = 0;
            const result = {
                nodes: []
            };

            content.items.forEach( text => {
                const tx = text.transform;
                const textY = tx[5];
                const height = text.height;
                const newPara = Math.abs(lastY - textY) > (height * options.paragraphVerticalOffset);

                if(!currentPara || newPara) {
                    currentPara = {
                        $class : 'org.accordproject.commonmark.Paragraph',
                        nodes : []
                    };
                    result.nodes.push(currentPara);
                }

                const textNode = {
                    $class : 'org.accordproject.commonmark.Text',
                    text : text.str.replace(/(?:\r\n|\r|\n)/g, ' ')
                };

                currentPara.nodes.push(textNode);

                if(text.str.trim().length > 0) {
                    lastY = textY;
                }
            });

            if(options.preservePages) {
                result.nodes.push( {
                    $class : 'org.accordproject.commonmark.ThematicBreak'
                });
            }

            pages.push(result);
        }

        let merged = [];

        pages.forEach( page => {
            merged = merged.concat(page.nodes);
        });

        const document = {
            $class : 'org.accordproject.commonmark.Document',
            xmlns : metadata.Title ? metadata.Title : 'Unknown',
            nodes : merged
        };

        return document;
    }

    /**
     * Converts a CiceroMark DOM to a PDF Buffer
     * @param {*} input - CiceroMark DOM
     * @param {*} options - the PDF generation options
     * @param {*} outputStream - the output stream
     */
    async toPdf(input, options, outputStream) {

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

        const dd = parameters.result;
        // console.log(JSON.stringify(dd, null, 2));

        dd.defaultStyle = {
            fontSize: 12,
            font: 'LiberationSerif',
            lineHeight: 1.5
        };

        dd.pageSize = 'LETTER';
        dd.pageOrientation = 'portrait',
        // left, top, right, bottom
        dd.pageMargins = [ 81, 72, 81, 72 ]; // units are points (72 per inch)

        // allow overrding top-level options
        Object.assign(dd, options);

        if(options.tocHeading) {
            dd.content = [{
                toc: {
                    title: {text: options.tocHeading, style: 'toc'}
                }
            }].concat( [{text: '', pageBreak: 'after'}].concat(dd.content ));
        }
        if(options.headerText) {
            dd.header = {
                text : options.headerText,
                style : 'Header'
            };
        }
        if(options.footerText || options.footerPageNumber) {
            dd.footer = function(currentPage, pageCount) {
                const footer = [{
                    text : options.footerText ? options.footerText : '',
                    style : 'Footer',
                }];
                if(options.footerPageNumber) {
                    footer.push(
                        {
                            text: currentPage.toString() + ' / ' + pageCount,
                            style: 'PageNumber'
                        });
                }
                return footer;
            };
        }
        const defaultStyles = {
            Footer: {
                alignment: 'left',
                fontSize: 10,
                // left, top, right, bottom
                margin : [81, 36, 0, 0]
            },
            PageNumber: {
                alignment: 'center',
                fontSize: 10,
                // left, top, right, bottom
                margin : [0, -11, 0, 0]
            },
            Header: {
                alignment: 'right',
                fontSize: 10,
                // left, top, right, bottom
                margin : [0, 36, 81, 0]
            },
            heading_one: {
                fontSize: 25,
                bold: true,
                alignment: 'center'
            },
            heading_two: {
                fontSize: 20,
                bold: true
            },
            heading_three: {
                fontSize: 16,
                bold: true
            },
            heading_four: {
                fontSize: 15,
                bold: true
            },
            heading_five: {
                fontSize: 14,
                bold: true
            },
            heading_six: {
                fontSize: 13,
                bold: true
            },
            Code: {
                font: 'LiberationMono'
            },
            CodeBlock: {
                font: 'LiberationMono',
            },
            HtmlInline: {
                font: 'LiberationMono'
            },
            HtmlBlock: {
                font: 'LiberationMono',
            },
            Paragraph: {
                alignment: 'justify'
            },
            toc: {
                fontSize: 25,
                bold: true,
                alignment: 'center'
            },
            Link: {
                color: 'blue'
            },
            BlockQuote: {
                margin: [20, 0]
            },
            background: {
                color: 'white'
            }
        };

        // allow the caller to override default styles
        dd.styles = defaultStyles;
        if(options.styles) {
            Object.assign(dd.styles, options.styles);
        }

        const pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(outputStream);
        pdfDoc.end();
    }
}

module.exports = PdfTransformer;