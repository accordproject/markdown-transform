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
const markdownTemplateToTemplateMark = async (input,parameters,options) => {
    const t = new TemplateMarkTransformer();
    const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
    return t.fromMarkdownTemplate({ fileName:parameters.inputFileName, content:input }, modelManager, parameters.templateKind, options);
};
const transformationGraph = {
    markdown_template : {
        docs: 'Markdown template string',
        fileFormat: 'utf8',
        templatemark: markdownTemplateToTemplateMark,
    },
    templatemark : {
        docs: 'TemplateMark DOM (JSON)',
        fileFormat: 'json'
    },
    markdown : {
        docs: 'Markdown text string',
        fileFormat: 'utf8',
        commonmark : (input,parameters,options) => {
            const t = new CommonMarkTransformer(Object.assign(options,{tagInfo: true}));
            return t.fromMarkdown(input, 'json');
        },
    },
    data : {
        docs: 'Contract Data (JSON)',
        fileFormat: 'json',
        ciceromark: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer();
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.grammarFileName;
            const templateMark = await markdownTemplateToTemplateMark(parameters.grammar,templateParameters,options);
            return t.draftCiceroMark(input, templateMark, parameters.templateKind, options);
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
            return ciceroMarkTransformer.fromCommonMark(input, 'json');
        },
        plaintext: (input,parameters,options) => {
            const commonMarkTransformer = new CommonMarkTransformer(options);
            const result = commonMarkTransformer.removeFormatting(input);
            return commonMarkTransformer.toMarkdown(result);
        },
    },
    plaintext: {
        docs: 'Plain text string',
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
        ciceromark_noquotes: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.fromCommonMark(input, 'json', Object.assign(options,{quoteVariables: false}));
        },
        commonmark: (input,parameters,options) => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            return ciceroMarkTransformer.toCommonMark(input, 'json', Object.assign(options,{wrapVariables: true, quoteVariables: true}));
        },
        slate: (input,parameters,options) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.fromCiceroMark(input);
        },
        data: async (input,parameters,options) => {
            const t = new TemplateMarkTransformer();
            const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.grammarFileName;
            const templateMark = await markdownTemplateToTemplateMark(parameters.grammar,templateParameters,options);
            return t.parseCiceroMark({ fileName:parameters.inputFileName, content:input }, templateMark, modelManager, parameters.templateKind, options);
        },
    },
    ciceromark_noquotes: {
        docs: 'CiceroMark DOM (JSON) with quotes around variables removed',
        fileFormat: 'json',
        ciceromark: (input,parameters,options) => {
            return input;
        }
    },
    pdf: {
        docs: 'PDF buffer',
        fileFormat: 'binary',
        ciceromark: (input,parameters,options) => {
            const pdfTransformer = new PdfTransformer();
            return pdfTransformer.toCiceroMark(input, 'json');
        },
    },
    docx: {
        docs: 'DOCX buffer',
        fileFormat: 'binary',
        ciceromark: async (input,parameters,options) => {
            const docxTransformer = new DocxTransformer();
            return docxTransformer.toCiceroMark(input, 'json');
        },
    },
    html: {
        docs: 'HTML string',
        fileFormat: 'utf8',
        ciceromark: (input,parameters,options) => {
            const t = new HtmlTransformer();
            return t.toCiceroMark(input, 'json');
        },
    },
    slate: {
        docs: 'Slate DOM (JSON)',
        fileFormat: 'json',
        ciceromark: (input,parameters,options) => {
            const slateTransformer = new SlateTransformer();
            return slateTransformer.toCiceroMark(input, 'json');
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
        result = await srcNode[dest](result,parameters,options);
        if(options && options.verbose) {
            console.log(`Converted from ${src} to ${dest}. Result:`);
            if(typeof result === 'object') {
                console.log(JSON.stringify(result, null, 2));
            } else {
                console.log(result);
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
        result = transformToDestination(result, currentSourceFormat, destination, parameters, options);
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
