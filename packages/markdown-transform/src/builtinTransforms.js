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
 * @param {*} input input document
 * @param {*} parameters parameters object
 * @param {*} options options object
 * @returns {*} object with modelManager and templateMark
 */
const templateToTemplateMark = async (input, parameters, options) => {
    const t = new TemplateMarkTransformer();
    const modelOptions = { offline: false };
    if (options && options.offline) {
        modelOptions.offline = true;
    }
    const modelManager = await ModelLoader.loadModelManager(parameters.model, options);
    return {
        modelManager: modelManager,
        templateMark: t.fromMarkdownTemplate({ fileName:parameters.inputFileName, content:input }, modelManager, parameters.templateKind, options)
    };
};
const transformationGraph = {
    markdown_template: {
        docs: 'Template markdown (string)',
        fileFormat: 'utf8',
        templatemark_tokens: (input, parameters, options) => {
            const t = new TemplateMarkTransformer();
            return t.toTokens({ fileName:parameters.inputFileName, content:input }, options);
        },
    },
    templatemark_tokens: {
        docs: 'TemplateMark tokens (JSON)',
        fileFormat: 'json',
        templatemark: async (input, parameters, options) => {
            const t = new TemplateMarkTransformer();
            const modelManager = await ModelLoader.loadModelManager(parameters.model, options);
            return t.tokensToMarkdownTemplate(input, modelManager, parameters.templateKind, options);
        },
    },
    templatemark: {
        docs: 'TemplateMark DOM (JSON)',
        fileFormat: 'json',
        markdown_template: (input, parameters, options) => {
            const t = new TemplateMarkTransformer();
            return t.toMarkdownTemplate(input);
        },
        pdfmake: (input, parameters, options) => {
            return PdfTransformer.templateMarkToPdfMake(input, options);
        },
        slate: (input,parameters,options) => {
            const t = new SlateTransformer();
            return t.fromTemplateMark(input);
        },
    },
    markdown: {
        docs: 'Markdown (string)',
        fileFormat: 'utf8',
        commonmark_tokens: (input, parameters, options) => {
            const t = new CommonMarkTransformer();
            return t.toTokens(input, options);
        },
    },
    commonmark_tokens: {
        docs: 'Markdown tokens (JSON)',
        fileFormat: 'json',
        commonmark: async (input, parameters, options) => {
            const t = new CommonMarkTransformer();
            return t.fromTokens(input);
        },
    },
    markdown_cicero: {
        docs: 'Cicero markdown (string)',
        fileFormat: 'utf8',
        ciceromark_tokens: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.toTokens(input, options);
        },
    },
    ciceromark_tokens: {
        docs: 'CiceroMark tokens (JSON)',
        fileFormat: 'json',
        ciceromark: async (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.fromTokens(input);
        },
    },
    commonmark: {
        docs: 'CommonMark DOM (JSON)',
        fileFormat: 'json',
        markdown: (input, parameters, options) => {
            const t = new CommonMarkTransformer();
            return t.toMarkdown(input);
        },
        ciceromark: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.fromCommonMark(input, options);
        },
        plaintext: (input, parameters, options) => {
            const t = new CommonMarkTransformer();
            return t.toMarkdown(t.removeFormatting(input));
        },
    },
    ciceromark: {
        docs: 'CiceroMark DOM (JSON)',
        fileFormat: 'json',
        markdown_cicero: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            const inputUnwrapped = t.toCiceroMarkUnwrapped(input,options);
            return t.toMarkdownCicero(inputUnwrapped);
        },
        commonmark: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.toCommonMark(input, options);
        },
        ciceromark_parsed: (input, parameters, options) => {
            return input;
        },
        data: async (input, parameters, options) => {
            const t = new TemplateMarkTransformer(parameters.plugin);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.templateFileName;
            const { templateMark, modelManager } = await templateToTemplateMark(parameters.template,templateParameters,options);
            const result = await t.fromCiceroMark({ fileName:parameters.inputFileName, content:input }, templateMark, modelManager, parameters.templateKind, parameters.currentTime, parameters.utcOffset, options);
            return result;
        },
    },
    ciceromark_parsed: {
        docs: 'Parsed CiceroMark DOM (JSON)',
        fileFormat: 'json',
        html: (input, parameters, options) => {
            const t = new HtmlTransformer();
            return t.toHtml(input);
        },
        ciceromark: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.toCiceroMarkUnwrapped(input, options);
        },
        ciceromark_unquoted: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.unquote(input, options);
        },
        slate: (input, parameters, options) => {
            const t = new SlateTransformer();
            return t.fromCiceroMark(input);
        },
        pdfmake: (input, parameters, options) => {
            return PdfTransformer.ciceroMarkToPdfMake(input, options);
        },
    },
    data: {
        docs: 'Contract Data (JSON)',
        fileFormat: 'json',
        ciceromark_parsed: async (input, parameters, options) => {
            const t = new TemplateMarkTransformer(parameters.plugin);
            const templateParameters = Object.assign({},parameters);
            templateParameters.inputFileName = parameters.templateFileName;
            const { templateMark, modelManager } = await templateToTemplateMark(parameters.template,templateParameters,options);
            return t.instantiateCiceroMark(input, templateMark, modelManager, parameters.templateKind, parameters.currentTime, parameters.utcOffset, options);
        },
    },
    plaintext: {
        docs: 'Plain text (string)',
        fileFormat: 'utf8',
        markdown: (input, parameters, options) => {
            return input;
        },
    },
    ciceroedit: {
        docs: 'CiceroEdit (string)',
        fileFormat: 'utf8',
        ciceromark_parsed: (input, parameters, options) => {
            const t = new CiceroMarkTransformer();
            return t.fromCiceroEdit(input, options);
        },
    },
    ciceromark_unquoted: {
        docs: 'CiceroMark DOM (JSON) with quotes around variables removed',
        fileFormat: 'json',
        ciceromark_parsed: (input, parameters, options) => {
            return input;
        }
    },
    pdfmake: {
        docs: 'pdfmake DOM (JSON)',
        fileFormat: 'json',
        pdf: (input, parameters, options) => {
            return PdfTransformer.pdfMakeToPdfBuffer(input);
        },
    },
    pdf: {
        docs: 'PDF (buffer)',
        fileFormat: 'binary',
        ciceromark_parsed: (input, parameters, options) => {
            return PdfTransformer.toCiceroMark(input, options);
        },
    },
    docx: {
        docs: 'DOCX (buffer)',
        fileFormat: 'binary',
        ciceromark_parsed: async (input, parameters, options) => {
            const t = new DocxTransformer();
            return t.toCiceroMark(input, options);
        },
    },
    html: {
        docs: 'HTML (string)',
        fileFormat: 'utf8',
        ciceromark_parsed: (input, parameters, options) => {
            const t = new HtmlTransformer();
            return t.toCiceroMark(input, options);
        },
    },
    slate: {
        docs: 'Slate DOM (JSON)',
        fileFormat: 'json',
        ciceromark_parsed: (input, parameters, options) => {
            const t = new SlateTransformer();
            return t.toCiceroMark(input, options);
        },
        templatemark: (input,parameters,options) => {
            const t = new SlateTransformer();
            return t.toTemplateMark(input, options);
        },
    },
};

module.exports = transformationGraph;
