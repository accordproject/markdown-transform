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

const _throwParseException = require('./errorutil')._throwParseException;
const {
    templateMarkManager,
    templateToTokens,
    tokensToUntypedTemplateMark,
    templateMarkTyping,
} = require('./templatemarkutil');

const ParserManager = require('./parsermanager');

const normalizeToMarkdownCicero = require('./normalize').normalizeToMarkdownCicero;
const normalizeFromMarkdownCicero = require('./normalize').normalizeFromMarkdownCicero;

const ToCiceroMarkVisitor = require('./ToCiceroMarkVisitor');

/**
 * Support for CiceroMark Templates
 */
class TemplateMarkTransformer {
    /**
     * Constructor
     * @param {object} parsingTable - optional parsing table
     */
    constructor(parsingTable = {}) {
        this.parsingTable = parsingTable;
    }

    /**
     * Converts a template string to a token stream
     * @param {object} templateInput the template template
     * @returns {object} the token stream
     */
    toTokens(templateInput) {
        return templateToTokens(templateInput.content);
    }

    /**
     * Converts a template token strean string to a TemplateMark DOM
     * @param {object} tokenStream the template token stream
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options) {
        const template = tokensToUntypedTemplateMark(tokenStream, templateKind);
        if (options && options.verbose) {
            console.log('===== Untyped TemplateMark ');
            console.log(JSON.stringify(template,null,2));
        }
        const typedTemplate = templateMarkTyping(template, modelManager, templateKind);
        if (options && options.verbose) {
            console.log('===== TemplateMark ');
            console.log(JSON.stringify(typedTemplate,null,2));
        }
        return typedTemplate;
    }

    /**
     * Converts a markdown string to a TemplateMark DOM
     * @param {{fileName:string,content:string}} templateInput the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdownTemplate(templateInput, modelManager, templateKind, options) {
        if (!modelManager) {
            throw new Error('Cannot parse without template model');
        }

        const tokenStream = this.toTokens(templateInput);
        if (options && options.verbose) {
            console.log('===== MarkdownIt Tokens ');
            console.log(JSON.stringify(tokenStream,null,2));
        }
        return this.tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options);
    }

    /**
     * Parse a CiceroMark DOM against a TemplateMark DOM
     * @param {{fileName:string,content:string}} input the ciceromark input
     * @param {object} parserManager - the parser manager for this template
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    dataFromCiceroMark(input, parserManager, options) {
        const serializer = parserManager.getSerializer();
        const parser = parserManager.getParser();

        // Load the markdown input
        const markdown = normalizeToMarkdownCicero(input.content);
        const markdownFileName = input.fileName;

        // Parse the markdown
        let result;
        try {
            result = parser.parse(markdown);
        } catch(err) {
            _throwParseException(markdown,err.message,markdownFileName);
        }
        if (result.status) {
            return serializer.toJSON(serializer.fromJSON(result.value));
        } else {
            _throwParseException(markdown,result,markdownFileName);
        }
    }

    /**
     * Parse a CiceroMark DOM against a TemplateMark DOM
     * @param {object} input the CiceroMark DOM
     * @param {object} templateMark the templatemark template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {string} currentTime - the definition of 'now'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromCiceroMark(input, templateMark, modelManager, templateKind, currentTime, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager,this.parsingTable,templateKind);
        parserManager.setCurrentTime(currentTime);
        parserManager.setTemplateMark(templateMark);
        parserManager.buildParser();

        return this.dataFromCiceroMark(input, parserManager, options);
    }

    /**
     * Parse a markdown cicero file to data
     * @param {{fileName:string,content:string}} markdownInput the markdown input
     * @param {{fileName:string,content:string}} templateInput the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdownCicero(markdownInput, templateInput, modelManager, templateKind, options) {
        // Translate template to TemplateMark
        const typedTemplate = this.fromMarkdownTemplate(templateInput, modelManager, templateKind, options);

        // Load the markdown input
        const ciceroMark = {fileName:markdownInput.fileName,content:normalizeFromMarkdownCicero(markdownInput.content)};

        return this.fromCiceroMark(ciceroMark, typedTemplate, modelManager, templateKind, options);
    }

    /**
     * Draft a CiceroMark DOM from a TemplateMarkDOM
     * @param {*} data the contract/clause data input
     * @param {*} parserManager - the parser manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    draftCiceroMark(data, parserManager, templateKind, options) {
        const parameters = {
            parserManager: parserManager,
            templateMarkModelManager: templateMarkManager.modelManager,
            templateMarkSerializer: templateMarkManager.serializer,
            fullData: data,
            data: data,
            kind: templateKind,
            currentTime: parserManager.getCurrentTime(),
        };

        const input = templateMarkManager.serializer.fromJSON(parserManager.getTemplateMark());

        const visitor = new ToCiceroMarkVisitor();
        input.accept(visitor, parameters);
        const result = Object.assign({}, templateMarkManager.serializer.toJSON(input));

        return result;
    }

    /**
     * Instantiate a CiceroMark DOM from a TemplateMarkDOM
     * @param {*} data the contract/clause data input
     * @param {*} templateMark - the TemplateMark DOM
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {string} currentTime - the definition of 'now'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    instantiateCiceroMark(data, templateMark, modelManager, templateKind, currentTime, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager, this.parsingTable, templateKind);
        parserManager.setCurrentTime(currentTime);
        parserManager.setTemplateMark(templateMark);
        return this.draftCiceroMark(data, parserManager, templateKind, options);
    }

}

module.exports = TemplateMarkTransformer;