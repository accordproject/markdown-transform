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
const {
    defaultFonts,
    defaultStyles,
    findReplaceImageUrls,
} = require('./util');

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
     * @param {boolean} [options.preservePages] - whether to preserve PDF page breaks (defaults to false)
     * @param {boolean} [options.loadCiceroMark] - whether to load embedded CiceroMark (defaults to true)
     * @param {boolean} [options.loadTemplates] - whether to load embedded templates (defaults to false)
     * @returns {promise} a Promise to the CiceroMark DOM
     */
    async toCiceroMark(input, format = 'concerto', options = { paragraphVerticalOffset: 2, preservePages: false, loadCiceroMark: true }) {

        let loadingTask = pdfjsLib.getDocument(input.buffer);

        const doc = await loadingTask.promise;
        let numPages = doc.numPages;
        const metadata = await doc.getMetadata();
        const templates = [];

        if(metadata.info && metadata.info.Custom) {
            if(options.loadTemplates) {
                Object.keys(metadata.info.Custom).forEach( key => {
                    if(key.startsWith('template-')) {
                        templates.push(metadata.info.Custom[key]);
                    }
                });
            }

            if(options.loadCiceroMark && metadata.info.Custom.ciceromark) {
                const result = JSON.parse(metadata.info.Custom.ciceromark);
                if(templates.length > 0) {
                    result.templates = templates; // add optional attribute `templates` to org.accordproject.commonmark.Document?
                }
                return result;
            }
        }

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

        if(templates.length > 0) {
            document.templates = templates; // add optional attribute `templates` to org.accordproject.commonmark.Document?
        }

        return document;
    }

    /**
     * Converts a CiceroMark DOM to a PDF Buffer
     * @param {*} input - CiceroMark DOM
     * @param {*} options - the PDF generation options
     * @param {boolean} [options.saveCiceroMark] - whether to save source CiceroMark as a custom property (defaults to true)
     * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
     * @param {*} outputStream - the output stream
     */
    async toPdf(input, options = { saveCiceroMark: true }, outputStream) {
        if(!input.getType) {
            input = this.ciceroMarkTransformer.getSerializer().fromJSON(input);
        }

        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToPdfMakeVisitor(this.options);
        input.accept(visitor, parameters);

        let dd = parameters.result;
        // console.log(JSON.stringify(dd, null, 2));
        await findReplaceImageUrls(dd);

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
        dd = Object.assign(dd, options);

        // save source CiceroMark
        if(options.saveCiceroMark) {
            dd = Object.assign(dd, {
                info : {
                    ciceromark : JSON.stringify(this.ciceroMarkTransformer.getSerializer().toJSON(input))
                }
            });
        }

        // save templates
        if(options.templates) {
            const templates = {};
            options.templates.forEach( (template, index) => {
                templates['template-' + index] = template.toString('base64');
            });
            dd.info = Object.assign(dd.info, templates);
        }

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

        // allow the caller to override default styles
        dd.styles = defaultStyles;
        if(options.styles) {
            Object.assign(dd.styles, options.styles);
        }

        const printer = new PdfPrinter(defaultFonts);

        const pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(outputStream);
        pdfDoc.end();
    }
}

module.exports = PdfTransformer;
