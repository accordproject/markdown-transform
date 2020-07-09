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

const dijkstra = require('dijkstrajs');
const find_path = dijkstra.find_path;

const ModelLoader = require('@accordproject/concerto-core').ModelLoader;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const SlateTransformer = require('@accordproject/markdown-slate').SlateTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;
const PdfTransformer = require('@accordproject/markdown-pdf').PdfTransformer;
const DocxTransformer = require('@accordproject/markdown-docx').DocxTransformer;

/**
 * The graph of transformation supported
 */
const templateToTemplateMark = async (input,parameters,options) => {
    const t = new TemplateMarkTransformer();
    const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
    return t.fromMarkdownTemplate({ fileName:parameters.inputFileName, content:input }, modelManager, parameters.templateKind, options);
};
const transformationGraph = {
    template: {
        docs: 'Markdown template (string)',
        fileFormat: 'utf8',
        template_tokens: (input,parameters,options) => {
            const t = new TemplateMarkTransformer();
            return t.toTokens({ fileName:parameters.inputFileName, content:input }, options);
        },
    },
    template_tokens: {
        docs: 'Markdown template tokens (JSON)',
        fileFormat: 'json',
        templatemark: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer();
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            return t.tokensToMarkdownTemplate(input, modelManager, parameters.templateKind, options);
        },
    },
    templatemark: {
        docs: 'TemplateMark DOM (JSON)',
        fileFormat: 'json'
    },
    markdown: {
        docs: 'Markdown (string)',
        fileFormat: 'utf8',
        markdown_tokens: (input,parameters,options) => {
            const t = new TemplateMarkTransformer();
            return t.toTokens({ fileName:parameters.inputFileName, content:input }, options);
        },
    },
    markdown_tokens: {
        docs: 'Markdown tokens (JSON)',
        fileFormat: 'json',
        commonmark: async (input,parameters,options) => {
            const t = new CommonMarkTransformer(Object.assign(options,{tagInfo: true}));
            return t.fromTokens(input);
        },
    },
    data: {
        docs: 'Contract Data (JSON)',
        fileFormat: 'json',
        commonmark: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer(parameters.plugin);
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.templateFileName;
            const templateMark = await templateToTemplateMark(parameters.template,templateParameters,options);
            return t.instantiateCommonMark(input, templateMark, modelManager, parameters.templateKind, options);
        },
        ciceromark: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer(parameters.plugin);
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.templateFileName;
            const templateMark = await templateToTemplateMark(parameters.template,templateParameters,options);
            return t.instantiateCiceroMark(input, templateMark, modelManager, parameters.templateKind, options);
        },
    },
    commonmark: {
        docs: 'CommonMark DOM (JSON)',
        fileFormat: 'json',
        markdown: (input,parameters,options) => {
            const commonMarkTransformer = new CommonMarkTransformer(Object.assign(options,{tagInfo: true}));
            return commonMarkTransformer.toMarkdown(input);
        },
        ciceromark: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer(options);
            return ciceroMarkTransformer.fromCommonMark(input, options);
        },
        plaintext: (input,parameters,options) => {
            const commonMarkTransformer = new CommonMarkTransformer(options);
            const result = commonMarkTransformer.removeFormatting(input);
            return commonMarkTransformer.toMarkdown(result);
        },
        data: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer(parameters.plugin);
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.templateFileName;
            const templateMark = await templateToTemplateMark(parameters.template,templateParameters,options);
            const result = await t.fromCommonMark({ fileName:parameters.inputFileName, content:input }, templateMark, modelManager, parameters.templateKind, options);
            return result;
        },
    },
    plaintext: {
        docs: 'Plain text (string)',
        fileFormat: 'utf8',
        markdown: (input,parameters,options) => {
            return input;
        },
    },
    ciceromark: {
        docs: 'CiceroMark DOM (JSON)',
        fileFormat: 'json',
        html: (input,parameters,options) => {
            const t = new HtmlTransformer();
            return t.toHtml(input);
        },
        ciceromark_unquoted: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.fromCommonMark(input, Object.assign(options,{quoteVariables: false}));
        },
        ciceromark_untyped: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.untype(input,options);
        },
        commonmark: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.toCommonMark(input, Object.assign(options,{quoteVariables: true}));
        },
        slate: (input,parameters,options) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.fromCiceroMark(input);
        },
        pdf : (input, parameters, options) => {
            const pdfTransformer = new PdfTransformer();
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
            return new Promise( (resolve) => {
                outputStream.on('finish', () => {
                    resolve(memStore);
                });
                pdfTransformer.toPdf(input, options, outputStream );
            });
        },
    },
    ciceromark_untyped: {
        docs: 'Untyped CiceroMark DOM (JSON)',
        fileFormat: 'json',
        commonmark: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.toCommonMark(input, Object.assign(options,{quoteVariables: true}));
        },
    },
    ciceroedit: {
        docs: 'CiceroEdit (string)',
        fileFormat: 'utf8',
        ciceromark_untyped: (input,parameters,options) => {
            const commonMarkTransformer = new CommonMarkTransformer();
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            const commonMark = commonMarkTransformer.fromMarkdown(input,options);
            return ciceroMarkTransformer.fromCommonMark(commonMark, Object.assign(options,{ciceroEdit:true}));
        },
    },
    ciceromark_unquoted: {
        docs: 'CiceroMark DOM (JSON) with quotes around variables removed',
        fileFormat: 'json',
        ciceromark: (input,parameters,options) => {
            return input;
        }
    },
    pdf: {
        docs: 'PDF (buffer)',
        fileFormat: 'binary',
        ciceromark: (input,parameters,options) => {
            const pdfTransformer = new PdfTransformer();
            return pdfTransformer.toCiceroMark(input, options);
        },
    },
    docx: {
        docs: 'DOCX (buffer)',
        fileFormat: 'binary',
        ciceromark: async (input,parameters,options) => {
            const docxTransformer = new DocxTransformer();
            return docxTransformer.toCiceroMark(input, options);
        },
    },
    html: {
        docs: 'HTML (string)',
        fileFormat: 'utf8',
        ciceromark: (input,parameters,options) => {
            const t = new HtmlTransformer();
            return t.toCiceroMark(input, options);
        },
    },
    slate: {
        docs: 'Slate DOM (JSON)',
        fileFormat: 'json',
        ciceromark: (input,parameters,options) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.toCiceroMark(input, options);
        },
    },
};

/**
 * Prune the graph for traversal
 * @param {object} graph the input graph
 * @returns {object} the raw graph for dijsktra
 */
function pruneGraph(graph) {
    const result = {};
    for (const sourceKey in graph) {
        result[sourceKey] = {};
        for (const targetKey in graph[sourceKey]) {
            // Don't forget to remove the meta data which really isn't part of the graph
            if (targetKey !== 'docs' && targetKey !== 'fileFormat') {
                result[sourceKey][targetKey] = 1;
            }
        }
    }
    return result;
}
const rawGraph = pruneGraph(transformationGraph);

/**
 * Converts the graph of transformations into a PlantUML text string
 * @returns {string} the PlantUML string
 */
function generateTransformationDiagram() {
    let result = `@startuml
hide empty description

`;

    Object.keys(transformationGraph).forEach(src => {
        result += `${src} : \n`;
        result += `${src} : ${transformationGraph[src].docs}\n`;
        Object.keys(transformationGraph[src]).forEach(dest => {
            if(dest !== 'docs' && dest !== 'fileFormat') {
                result += `${src} --> ${dest}\n`;
            }
        });
        result += '\n';
    });

    result += '@enduml';
    return result;
}

/**
 * Transforms from a source format to a single destination format or
 * throws an exception if the transformation is not possible.
 *
 * @param {*} source the input for the transformation
 * @param {string} sourceFormat the input format
 * @param {string} destinationFormat the destination format
 * @param {object} parameters the transform parameters
 * @param {object} [options] the transform options
 * @param {boolean} [options.verbose] output verbose console logs
 * @returns {*} result of the transformation
 */
async function transformToDestination(source, sourceFormat, destinationFormat, parameters, options) {
    let result = source;

    const path = find_path(rawGraph, sourceFormat, destinationFormat);
    for(let n=0; n < path.length-1; n++) {
        const src = path[n];
        const dest = path[n+1];
        const srcNode = transformationGraph[src];
        const destinationNode = transformationGraph[dest];
        result = await srcNode[dest](result,parameters,options);
        if(options && options.verbose) {
            console.log(`Converted from ${src} to ${dest}. Result:`);
            if(destinationNode.fileFormat !== 'binary') {
                if(typeof result === 'object') {
                    console.log(JSON.stringify(result, null, 2));
                } else {
                    console.log(result);
                }
            }
            else {
                console.log(`<binary ${dest} data>`);
            }
        }
    }

    return result;
}

/**
 * Transforms from a source format to a list of destination formats, or
 * throws an exception if the transformation is not possible.
 *
 * @param {*} source the input for the transformation
 * @param {string} sourceFormat the input format
 * @param {string[]} destinationFormat the destination format as an array,
 * the transformation are applied in order to reach all formats in the array
 * @param {object} parameters the transform parameters
 * @param {object} [options] the transform options
 * @param {boolean} [options.verbose] output verbose console logs
 * @returns {Promise} result of the transformation
 */
async function transform(source, sourceFormat, destinationFormat, parameters, options) {
    let result = source;
    options = options ? options : {};
    parameters = parameters ? parameters : {};
    if (sourceFormat === 'markdown') {
        options.source = source;
    }

    let currentSourceFormat = sourceFormat;

    for(let i=0; i < destinationFormat.length; i++) {
        let destination = destinationFormat[i];
        result = await transformToDestination(result, currentSourceFormat, destination, parameters, options);
        currentSourceFormat = destination;
    }
    return result;
}

/**
 * Return the format descriptor for a given format
 *
 * @param {string} format the format
 * @return {object} the descriptor for that format
 */
function formatDescriptor(format) {
    if (Object.prototype.hasOwnProperty.call(transformationGraph,format)) {
        return transformationGraph[format];
    } else {
        throw new Error('Unknown format ' + format);
    }
}

module.exports.formatDescriptor = formatDescriptor;
module.exports.transform = transform;
module.exports.transformationGraph = transformationGraph;
module.exports.generateTransformationDiagram = generateTransformationDiagram;
