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

const PDFParser = require('pdf2json');
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
     * @param {number} [options.paragraphVerticalOffset] - the vertical offset used to detect pararaphs (defaults to 1)
     * @param {boolean} [options.preservePages] - whether to preserve page breaks (defaults to true)
     * @returns {promise} a Promise to the CiceroMark DOM
     */
    async toCiceroMark(input, format = 'concerto', options = { paragraphVerticalOffset: 1, preservePages: true }) {
        return new Promise( (resolve, reject) => {
            const pdfParser = new PDFParser(null, false);
            const errorCallback = (errData) => reject(`PDF parsing failed with error ${errData.parserError}`);
            const conversionCallback = (pdfData) => {

                const document = {
                    $class : 'org.accordproject.commonmark.Document',
                    xmlns : pdfData.formImage.Id.Name,
                    nodes : []
                };

                // pdfData = pdfParser.getMergedTextBlocksIfNeeded();

                let currentPara = null;
                pdfData.formImage.Pages.forEach(page => {
                    let lastY = 0;
                    page.Texts.forEach( text => {
                        if(!currentPara || Math.abs(lastY - text.y) > options.paragraphVerticalOffset) {
                            currentPara = {
                                $class : 'org.accordproject.commonmark.Paragraph',
                                nodes : []
                            };
                            document.nodes.push(currentPara);
                        }

                        text.R.forEach( run => {
                            let [/*fontFaceId*/, /*fontSize*/, bold, italic] = run.TS;
                            const textNode = {
                                $class : 'org.accordproject.commonmark.Text',
                                text : run.T ? decodeURIComponent(run.T) : ''
                            };
                            if(bold && !italic) {
                                const bold = {
                                    $class : 'org.accordproject.commonmark.Strong',
                                    nodes : [textNode]
                                };
                                PdfTransformer.pushNode(currentPara, bold, lastY, text.y);
                            }
                            else if(italic && !bold) {
                                const italic = {
                                    $class : 'org.accordproject.commonmark.Emph',
                                    nodes : [textNode]
                                };
                                PdfTransformer.pushNode(currentPara, italic, lastY, text.y);
                            }
                            else if(italic && bold) {
                                const boldItalic = {
                                    $class : 'org.accordproject.commonmark.Strong',
                                    nodes : [{
                                        $class : 'org.accordproject.commonmark.Emph',
                                        nodes : [textNode]
                                    }]
                                };
                                PdfTransformer.pushNode(currentPara, boldItalic, lastY, text.y);
                            }
                            else {
                                PdfTransformer.pushNode(currentPara, textNode, lastY, text.y);
                            }
                        });
                        lastY = text.y;
                    });

                    if(options.preservePages) {
                        document.nodes.push( {
                            $class : 'org.accordproject.commonmark.ThematicBreak'
                        });
                    }
                });
                resolve(document);
            };

            // trigger parsing
            pdfParser.on('pdfParser_dataError', errorCallback);
            pdfParser.on('pdfParser_dataReady', conversionCallback);
            pdfParser.parseBuffer(input);
        });
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
        dd.pageMargins = [ 80, 80, 80, 80 ];

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
                margin : [10, 10, 0, 0]
            },
            PageNumber: {
                alignment: 'center',
                margin : [0, 0, 0, 0]
            },
            Header: {
                alignment: 'right',
                margin : [0, 10, 10, 0]
            },
            heading_one: {
                fontSize: 30,
                bold: true,
                alignment: 'center'
            },
            heading_two: {
                fontSize: 28,
                bold: true
            },
            heading_three: {
                fontSize: 26,
                bold: true
            },
            heading_four: {
                fontSize: 24,
                bold: true
            },
            heading_five: {
                fontSize: 22,
                bold: true
            },
            heading_six: {
                fontSize: 20,
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
                fontSize: 30,
                bold: true,
                alignment: 'center'
            },
            Link: {
                color: 'blue'
            },
            BlockQuote: {
                margin: [20, 0]
            },
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

    /**
     * Utility to get the last child of a node.
     * @param {object} node a commonmark node
     * @returns {object} the last child node, or null
     */
    static getLastChildNode(node) {
        return node.nodes.length > 0 ? node.nodes[node.nodes.length-1] : null;
    }

    /**
     * Utility to merge text nodes. It recurses so that is can deal with
     * bold, italic, bold+italic text.
     * @param {object} srcNode a commonmark node
     * @param {object} destNode a commonmark node
     * @returns {object} the modified destination node, or null
     */
    static mergeTextNode(srcNode, destNode) {
        if(srcNode && destNode ) {
            if( srcNode.$class === destNode.$class ) {
                if(srcNode.$class === 'org.accordproject.commonmark.Text') {
                    destNode.text = destNode.text + srcNode.text;
                    return destNode;
                }
                else {
                    const srcChild = PdfTransformer.getLastChildNode(srcNode);
                    const destChild = PdfTransformer.getLastChildNode(destNode);
                    return PdfTransformer.mergeTextNode(srcChild, destChild);
                }
            }
        }

        return null;
    }

    /**
     * Utility to merge adjacent text runs from a PDF
     * @param {*} currentPara CommonMark paragraph node
     * @param {*} node the current node
     * @param {*} lastY the last Y offset position from PDF
     * @param {*} textY the current Y offset position from PDF
     */
    static pushNode(currentPara, node, lastY, textY) {
        if(lastY !== textY) {
            currentPara.nodes.push( {
                $class : 'org.accordproject.commonmark.Softbreak'
            });
            currentPara.nodes.push(node);
        }
        else {
            const lastNode = PdfTransformer.getLastChildNode(currentPara);
            const merged = PdfTransformer.mergeTextNode(node, lastNode);

            if(!merged) {
                currentPara.nodes.push(node);
            }
        }
    }
}

module.exports = PdfTransformer;