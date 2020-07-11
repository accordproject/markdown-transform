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

const { ParseException } = require('@accordproject/concerto-core');
const {
    templateMarkManager,
    templateToTokens,
    tokensToUntypedTemplateMark,
    templateMarkTyping,
} = require('./templatemarkutil');

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const ToCommonMarkVisitor = require('@accordproject/markdown-cicero').ToCommonMarkVisitor;
const ParserManager = require('./parsermanager');

const normalizeToMarkdownCicero = require('./normalize').normalizeToMarkdownCicero;
const normalizeFromMarkdownCicero = require('./normalize').normalizeFromMarkdownCicero;

const ToCiceroMarkVisitor = require('./ToCiceroMarkVisitor');

/**
 * Minimum length of expected token
 * @param {object} expected the expected token
 * @return {number} the minimum length
 */
function maxOfExpected(expected) {
    return Math.max.apply(null,expected.map((x) => x.length));
}

/**
 * Clean up expected tokens
 * @param {object} expected the expected token
 * @return {object} nicer looking expected tokens
 */
function cleanExpected(expected) {
    return expected.map((x) => new RegExp(/'[^']*'/).test(x) ? x.substr(1,x.length -2) : x);
}

/**
 * Throw a parse exception
 * @param {string} markdown a markdown string
 * @param {object} result the parsing failure
 * @param {string} [fileName] - the fileName for the markdown (optional)
 */
function _throwParseError(markdown,result,fileName) {
    // File location
    const fileLocation = {};
    const start = result.index;
    const end = Object.assign({},start);
    end.offset = end.offset+1;
    end.column = end.column+1;
    fileLocation.start = start;
    fileLocation.end = end;

    // Short message
    const shortMessage = `Parse error at line ${result.index.line} column ${result.index.column}`;

    // Long message
    const lines = markdown.split('\n');
    const expected = result.expected;
    const underline = ((line) => {
        const maxLength = line.length - (start.column-1);
        const maxExpected = maxOfExpected(cleanExpected(expected));
        return '^'.repeat(maxLength < maxExpected ? maxLength : maxExpected);
    });
    const line = lines[start.line - 1];
    const snippet = line + '\n' + ' '.repeat(start.column-1) + underline(line);
    const isEOF = (x) => {
        if (x[0] && x[0] === 'EOF') {
            return true;
        } else {
            return false;
        }
    };
    const expectedMessage = 'Expected: ' + (isEOF(expected) ? 'End of text' : expected.join(' or '));
    const longMessage = shortMessage + '\n' + snippet + '\n' + expectedMessage;
    throw new ParseException(shortMessage, fileLocation, fileName, longMessage, 'markdown-template');
}

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
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    dataFromCiceroMark(input, parserManager, templateKind, options) {
        const serializer = parserManager.getSerializer();
        const parser = parserManager.getParser();

        // Load the markdown input
        const markdown = normalizeToMarkdownCicero(input.content);
        const markdownFileName = input.fileName;

        // Parse the markdown
        let result = parser.parse(markdown);
        if (result.status) {
            return serializer.toJSON(serializer.fromJSON(result.value));
        } else {
            _throwParseError(markdown,result,markdownFileName);
        }
    }

    /**
     * Parse a CiceroMark DOM against a TemplateMark DOM
     * @param {object} input the CiceroMark DOM
     * @param {object} templateMark the templatemark template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromCiceroMark(input, templateMark, modelManager, templateKind, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager,this.parsingTable);
        parserManager.setTemplateMark(templateMark);
        parserManager.buildParser();

        return this.dataFromCiceroMark(input, parserManager, templateKind, options);
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
     * Parse a markdown string to data
     * @param {string} markdown the markdown input
     * @param {string} template the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @returns {object} the result of parsing
     */
    dataFromMarkdown(markdown, template, modelManager, templateKind) {
        const markdownInput = { fileName: '[buffer]', content: markdown };
        const templateInput = { fileName: '[buffer]', content: template };
        return this.fromMarkdown(markdownInput, templateInput, modelManager, templateKind, null);
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
        };

        const input = templateMarkManager.serializer.fromJSON(parserManager.getTemplateMark());

        const visitor = new ToCiceroMarkVisitor();
        input.accept(visitor, parameters);
        const result = Object.assign({}, templateMarkManager.serializer.toJSON(input));

        //console.log('DRAFT ' + JSON.stringify(result));
        return result;
    }

    /**
     * Instantiate a CiceroMark DOM from a TemplateMarkDOM
     * @param {*} data the contract/clause data input
     * @param {*} templateMark - the TemplateMark DOM
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    instantiateCiceroMark(data, templateMark, modelManager, templateKind, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager, this.parsingTable);
        parserManager.setTemplateMark(templateMark);
        return this.draftCiceroMark(data, parserManager, templateKind, options);
    }

    /**
     * Instantiate a CiceroMark DOM from data
     * @param {*} data the contract/clause data input
     * @param {*} template - the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @returns {object} the result
     */
    dataToCiceroMark(data, template, modelManager, templateKind) {
        const templateInput = { fileName: '[buffer]', content: template };
        const templateMark = this.fromMarkdownTemplate(templateInput, modelManager, templateKind, null);
        return this.instantiateCiceroMark(data, templateMark, modelManager, templateKind, null);
    }

    /**
     * Draft a CommonMark DOM from a CiceroMark DOM
     * @param {object} ciceroMark the CiceroMark DOM
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    draftCiceroMarkToCommonMark(ciceroMark, options) {
        // convert to common mark
        const visitor = new ToCommonMarkVisitor();
        const dom = templateMarkManager.serializer.fromJSON(ciceroMark);
        dom.accept( visitor, {
            commonMark: new CommonMarkTransformer(),
            modelManager : templateMarkManager.modelManager,
            serializer : templateMarkManager.serializer
        });

        return templateMarkManager.serializer.toJSON(dom);
    }

    /**
     * Draft a CommonMark DOM from a TemplateMark DOM
     * @param {*} data the contract/clause data input
     * @param {*} parserManager - the parser manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    draftCommonMark(data, parserManager, templateKind, options) {
        const ciceroMark = this.draftCiceroMark(data, parserManager, templateKind, options);
        return this.draftCiceroMarkToCommonMark(ciceroMark, options);
    }

    /**
     * Instantiate a CommonMark DOM from a TemplateMarkDOM
     * @param {*} data the contract/clause data input
     * @param {*} templateMark the TemplateMark DOM
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    instantiateCommonMark(data, templateMark, modelManager, templateKind, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager, this.parsingTable);
        parserManager.setTemplateMark(templateMark);
        return this.draftCommonMark(data, parserManager, templateKind, options);
    }

}

module.exports = TemplateMarkTransformer;