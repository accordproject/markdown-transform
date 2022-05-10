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

let pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

/**
 * Converts an pdf buffer to a CiceroMark DOM
 * @param {Buffer} input - pdf buffer
 * @param {string} [format] result format, defaults to 'concerto'. Pass
 * 'json' to return the JSON data.
 * @param {object} [options] - the PDF parsing options
 * @param {number} [options.paragraphVerticalOffset] - the vertical offset used to detect
 * pararaphs as a multiple of the line height (defaults to 2)
 * @param {boolean} [options.preservePages] - whether to preserve PDF page breaks (defaults to false)
 * @param {boolean} [options.loadMarkdown] - whether to load embedded CiceroMark (defaults to true)
 * @param {boolean} [options.loadTemplates] - whether to load embedded templates (defaults to false)
 * @returns {promise} a Promise to the CiceroMark DOM
 */
async function ToCiceroMark(input, format = 'concerto', options = { paragraphVerticalOffset: 2, preservePages: false, loadMarkdown: true }) {

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

        if(options.loadMarkdown && metadata.info.Custom.markdown) {
            const result = JSON.parse(metadata.info.Custom.markdown);
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
            disableCombineTextItems: false
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

module.exports = ToCiceroMark;
