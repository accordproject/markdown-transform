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

const { ModelManager, Factory, Serializer, Introspector, ParseException } = require('@accordproject/concerto-core');
const { CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const { CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;
const TemplateMarkModel = require('./externalModels/TemplateMarkModel').TemplateMarkModel;
const TemplateMarkRawModel = require('./externalModels/TemplateMarkRaw').TemplateMarkRawModel;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const ParserManager = require('./parsermanager').ParserManager;

const normalizeNLs = require('./normalize').normalizeNLs;
const normalizeToMarkdown = require('./normalize').normalizeToMarkdown;
const normalizeFromMarkdown = require('./normalize').normalizeFromMarkdown;

const TypingVisitor = require('./TypingVisitor');
const TemplateMarkVisitor = require('./TemplateMarkVisitor');
const ToCiceroMarkVisitor = require('./ToCiceroMarkVisitor');
const ToCommonMarkVisitor = require('./ToCommonMarkVisitor');

const TemplateParser = require('./TemplateParser');

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
    return expected.map((x) => new RegExp(/'[^']*'/).test(x) ? x.substr(1,x.length -2) : x)
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
    const end = {...start};
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
     * Construct the parser.
     */
    constructor() {
        // Setup for Nested Parsing
        this.commonMark = new CommonMarkTransformer();

        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(CommonMarkModel, 'commonmark.cto');
        this.modelManager.addModelFile(CiceroMarkModel, 'ciceromark.cto');
        this.modelManager.addModelFile(TemplateMarkRawModel, 'templatemarkraw.cto');
        this.modelManager.addModelFile(TemplateMarkModel, 'templatemark.cto');
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
    }

    /**
     * Converts a template grammar string to a TemplateMark DOM
     * @param {object} grammar the template grammar
     * @param {string} templateKind - either 'clause' or 'contract'
     * @returns {object} the result of parsing
     */
    parseGrammar(grammar, templateKind) {
        let topTemplate;

        if (templateKind === 'contract') {
            topTemplate = {
                '$class': 'org.accordproject.commonmark.Document',
                'xmlns' : 'http://commonmark.org/xml/1.0',
                'nodes': [{
                    '$class': 'org.accordproject.templatemark.ContractDefinition',
                    'name': 'top',
                    'nodes': TemplateParser.contractTemplate.tryParse(grammar)
                }]
            };
        } else {
            topTemplate = {
                '$class': 'org.accordproject.commonmark.Document',
                'xmlns' : 'http://commonmark.org/xml/1.0',
                'nodes': [{
                    '$class': 'org.accordproject.templatemark.ClauseDefinition',
                    'name': 'top',
                    'nodes': TemplateParser.clauseTemplate.tryParse(grammar)
                }]
            };
        }
        return this.serializer.toJSON(this.serializer.fromJSON(topTemplate));
    }

    /**
     * Decorate template with its types
     * @param {object} introspector - the model introspector for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {ClassDeclaration} templateModel - the contract class
     * @param {object} template the template AST
     * @returns {object} the typed template AST
     */
    typeTemplate(introspector,templateKind,templateModel,template) {
        const input = this.serializer.fromJSON(template);

        const parameters = {
            templateMarkModelManager: this.modelManager,
            templateMarkFactory: this.factory,
            introspector: introspector,
            model: templateModel,
            kind: templateKind,
        };
        const visitor = new TypingVisitor();
        input.accept(visitor, parameters);
        const result = Object.assign({}, this.serializer.toJSON(input));

        return result;
    }

    /**
     * Unfold text chunks in template
     * @param {object} template the template AST
     * @returns {object} the typed template AST
     */
    unfoldTemplate(template) {
        const input = this.serializer.fromJSON(template);

        const parameters = {
            commonMark: this.commonMark,
            templateMarkModelManager: this.modelManager,
            templateMarkFactory: this.factory,
        };
        const visitor = new TemplateMarkVisitor();
        input.accept(visitor, parameters);
        const result = Object.assign({}, this.serializer.toJSON(input));

        return result;
    }

    /**
     * Converts a markdown string to a raw TemplateMark DOM
     * @param {{fileName:string,content:string}} grammar the template grammar
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdownTemplateRaw(grammarInput, modelManager, templateKind, options) {
        if (!modelManager) {
            throw new Error('Cannot parse without template model');
        }

        const grammar = normalizeNLs(grammarInput.content);
        const grammarFileName = grammarInput.fileName;

        // Parse / validate / type the template
        const template = this.parseGrammar(grammar, templateKind);
        if (options && options.verbose) {
            console.log('===== Raw TemplateMark ');
            console.log(JSON.stringify(template,null,2));
        }
        const introspector = new Introspector(modelManager);
        const templateModel = this.getTemplateModel(introspector, templateKind);
        const typedTemplate = this.typeTemplate(introspector, templateKind, templateModel, template);
        if (options && options.verbose) {
            console.log('===== Raw Typed TemplateMark ');
            console.log(JSON.stringify(typedTemplate,null,2));
        }
        return typedTemplate;
    }

    /**
     * Converts a markdown string to a TemplateMark DOM
     * @param {{fileName:string,content:string}} grammar the template grammar
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdownTemplate(grammarInput, modelManager, templateKind, options) {
        const typedTemplate = this.fromMarkdownTemplateRaw(grammarInput, modelManager, templateKind, options);
        const unfoldedTemplate = this.unfoldTemplate(typedTemplate);
        if (options && options.verbose) {
            console.log('===== Typed TemplateMark ');
            console.log(JSON.stringify(unfoldedTemplate,null,2));
        }
        return unfoldedTemplate;
    }

    /**
     * Parse a CommonMarkMark DOM against a TemplateMark DOM
     * @param {{fileName:string,content:string}} commonMarkInput the commonmark input
     * @param {object} parserManager - the parser manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    dataFromCommonMark(commonMarkInput, parserManager, templateKind, options) {
        const serializer = parserManager.getSerializer();
        const parser = parserManager.getParser();

        // Load the markdown input
        const markdown = normalizeToMarkdown(commonMarkInput.content);
        const markdownFileName = commonMarkInput.fileName;

        // Parse the markdown
        let result = parser.parse(markdown);
        if (result.status) {
            return serializer.toJSON(serializer.fromJSON(result.value));
        } else {
            _throwParseError(markdown,result,markdownFileName);
        }
    }

    /**
     * Parse a CommonMarkMark DOM against a TemplateMark DOM
     * @param {object} commonMark the CommonMark DOM
     * @param {object} templateMark the templatemark grammar
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromCommonMark(commonMarkInput, templateMark, modelManager, templateKind, options) {
        // Construct the template parser
        const parserManager = new ParserManager(modelManager);
        parserManager.setGrammarAst(templateMark);
        parserManager.buildParser();

        return this.dataFromCommonMark(commonMarkInput, parserManager, templateKind, options);
    }

    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {{fileName:string,content:string}} markdown the markdown input
     * @param {{fileName:string,content:string}} grammar the template grammar
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdown(markdownInput, grammarInput, modelManager, templateKind, options) {
        // Translate grammar to TemplateMark
        const typedTemplate = this.fromMarkdownTemplate(grammarInput, modelManager, templateKind, options);

        // Load the markdown input
        const commonMark = {fileName:markdownInput.fileName,content:normalizeFromMarkdown(markdownInput.content)};

        return this.fromCommonMark(commonMark, typedTemplate, modelManager, templateKind, options);
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
        const parserManager = new ParserManager(modelManager);
        parserManager.setGrammarAst(templateMark);

        const parameters = {
            parserManager: parserManager,
            templateMarkModelManager: this.modelManager,
            templateMarkSerializer: this.serializer,
            data: data,
            kind: templateKind,
        };

        const input = this.serializer.fromJSON(templateMark);

        const visitor = new ToCiceroMarkVisitor();
        input.accept(visitor, parameters);
        const result = Object.assign({}, this.serializer.toJSON(input));

        return result;
    }

    /**
     * Instantiate a CommonMark DOM from a TemplateMarkDOM
     * @param {*} data the contract/clause data input
     * @param {*} typedTemplate the TemplateMark DOM
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result
     */
    instantiateCommonMark(data, typedTemplate, modelManager, templateKind, options) {
        const ciceroMark = this.instantiateCiceroMark(data, typedTemplate, modelManager, templateKind, options);

        // convert to common mark
        const visitor = new ToCommonMarkVisitor();
        const dom = this.serializer.fromJSON(ciceroMark);
        dom.accept( visitor, {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        });

        return this.serializer.toJSON(dom);
    }

    /**
     * Check to see if a ClassDeclaration is an instance of the specified fully qualified
     * type name.
     * @internal
     * @param {ClassDeclaration} classDeclaration The class to test
     * @param {String} fqt The fully qualified type name.
     * @returns {boolean} True if classDeclaration an instance of the specified fully
     * qualified type name, false otherwise.
     */
    instanceOf(classDeclaration, fqt) {
        // Check to see if this is an exact instance of the specified type.
        if (classDeclaration.getFullyQualifiedName() === fqt) {
            return true;
        }
        // Now walk the class hierachy looking to see if it's an instance of the specified type.
        let superTypeDeclaration = classDeclaration.getSuperTypeDeclaration();
        while (superTypeDeclaration) {
            if (superTypeDeclaration.getFullyQualifiedName() === fqt) {
                return true;
            }
            superTypeDeclaration = superTypeDeclaration.getSuperTypeDeclaration();
        }
        return false;
    }

    /**
     * Returns the template model for the template
     * @param {object} introspector - the model introspector for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel(introspector, templateKind) {
        let modelType = 'org.accordproject.cicero.contract.AccordContract';

        if (templateKind !== 'contract') {
            modelType = 'org.accordproject.cicero.contract.AccordClause';
        }

        const templateModels = introspector.getClassDeclarations().filter((item) => {
            return !item.isAbstract() && this.instanceOf(item,modelType);
        });

        if (templateModels.length > 1) {
            throw new Error(`Found multiple instances of ${modelType}. The model for the template must contain a single asset that extends ${modelType}.`);
        } else if (templateModels.length === 0) {
            throw new Error(`Failed to find an asset that extends ${modelType}. The model for the template must contain a single asset that extends ${modelType}.`);
        } else {
            return templateModels[0];
        }
    }

}

module.exports = TemplateMarkTransformer;