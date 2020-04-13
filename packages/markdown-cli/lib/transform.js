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

const dijkstra = require('dijkstrajs');
const find_path = dijkstra.find_path;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const SlateTransformer = require('@accordproject/markdown-slate').SlateTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;
const PdfTransformer = require('@accordproject/markdown-pdf').PdfTransformer;
const DocxTransformer = require('@accordproject/markdown-docx').DocxTransformer;

const transforms = {
    markdown : {
        docs: 'Markdown format text string',
        commonmark : (input) => {
            const t = new CommonMarkTransformer({tagInfo: true});
            return t.fromMarkdown(input, 'json');
        },
    },
    commonmark: {
        docs: 'CommonMark DOM (JSON)',
        markdown: (input) => {
            const commonMarkTransformer = new CommonMarkTransformer();
            return commonMarkTransformer.toMarkdown(input);
        },
        ciceromark: (input) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.fromCommonMark(input, 'json');
        },
        plaintext: (input) => {
            const commonMarkTransformer = new CommonMarkTransformer();
            const result = commonMarkTransformer.removeFormatting(input);
            return commonMarkTransformer.toMarkdown(result);
        },
    },
    plaintext: {
        docs: 'Plain text string',
        markdown: (input, options) => {
            return input;
        },
    },
    ciceromark: {
        docs: 'CiceroMark DOM (JSON)',
        html: (input) => {
            const t = new HtmlTransformer();
            return t.toHtml(input);
        },
        ciceromark_noquotes: (input) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.fromCommonMark(input, 'json', {quoteVariables: false});
        },
        ciceroedit: (input) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.toCommonMark(input, {quoteVariables: true}, 'json');
        },
        commonmark: (input) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.toCommonMark(input, {quoteVariables: true}, 'json');
        },
        slate: (input) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.fromCiceroMark(input);
        }
    },
    ciceromark_noquotes: {
        docs: 'CiceroMark DOM (JSON) with quotes around variables removed',
        ciceromark: (input) => {
            return input;
        }
    },
    ciceroedit: {
        docs: 'Markdown string with embedded variable metadata',
        markdown: (input) => {
            return input;
        }
    },
    pdf: {
        docs: 'PDF file',
        ciceromark: (input) => {
            const pdfTransformer = new PdfTransformer();
            return pdfTransformer.toCiceroMark(input);
        },
    },
    docx: {
        docs: 'DOCX file',
        ciceromark: (input) => {
            const docxTransformer = new DocxTransformer();
            return docxTransformer.toCiceroMark(input);
        },
    },
    html: {
        docs: 'HTML string',
        ciceromark: (input) => {
            const t = new HtmlTransformer();
            return t.toCiceroMark(input);
        },
    },
    slate: {
        docs: 'Slate DOM (JSON)',
        ciceromark: (input) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.toCiceroMark(input, 'json');
        },
    },
};

/**
 * Converts the graph of transformations into a PlantUML text string
 * @returns {string} the PlantUML string
 */
function generateTransformationDiagram() {
    let result = ` // Automatically generated. Do not edit!
@startuml
hide empty description

`;

    Object.keys(transforms).forEach(src => {
        result += `${src} : \n`;
        result += `${src} : ${transforms[src].docs}\n`;
        Object.keys(transforms[src]).forEach(dest => {
            if(dest !== 'docs') {
                result += `${src} --> ${dest}\n`;
            }
        });
        result += '\n';
    });

    result += '@enduml';
    return result;
}

/**
 * Transforms from a source format to a destination format or
 * throws an exception if the transformation is not possible.
 *
 * @param {*} source the input for the transformation
 * @param {*} sourceFormat the input format
 * @param {*} destinationFormat the destination format
 * @returns {*} result of the transformation
 */
function transform(source, sourceFormat, destinationFormat) {
    let result = source;

    let currentSourceFormat = sourceFormat;

    for(let i=0; i < destinationFormat.length; i++) {
        let destination = destinationFormat[i];
        const path = find_path(transforms, currentSourceFormat, destination);
        for(let n=0; n < path.length-1; n++) {
            const src = path[n];
            const dest = path[n+1];
            // console.log(`Converting from ${src} to ${dest}....`);
            const srcNode = transforms[src];
            result = srcNode[dest](result);
        }

        currentSourceFormat = destination;
    }
    return result;
}

module.exports.transform = transform;
module.exports.generateTransformationDiagram = generateTransformationDiagram;
