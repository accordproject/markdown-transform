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

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const { ModelManager, Factory, Serializer, Introspector } = require('@accordproject/concerto-core');
const { CommonMarkModel, CiceroMarkModel, ConcertoMetaModel, TemplateMarkModel } = require('@accordproject/markdown-common');

const normalizeNLs = require('./normalize').normalizeNLs;
const TypeVisitor = require('./TypeVisitor');
const FormulaVisitor = require('./FormulaVisitor');
const MarkdownIt = require('markdown-it');
const MarkdownItTemplate = require('@accordproject/markdown-it-template');
const FromMarkdownIt = require('@accordproject/markdown-common').FromMarkdownIt;
const templaterules = require('./templaterules');

/**
 * Model manager for TemplateMark
 * @param {object} options - optional parameters
 * @param {number} [options.utcOffset] - UTC Offset for this execution
 * @returns {object} model manager and utilities for TemplateMark
 */
function mkTemplateMarkManager(options) {
    const result = {};
    const newOpts = {
        ...options,
        strict: true
    };
    result.modelManager = new ModelManager(newOpts);
    result.modelManager.addCTOModel(CommonMarkModel.MODEL, 'commonmark.cto');
    result.modelManager.addCTOModel(ConcertoMetaModel.MODEL, 'metamodel.cto');
    result.modelManager.addCTOModel(CiceroMarkModel.MODEL, 'ciceromark.cto');
    result.modelManager.addCTOModel(TemplateMarkModel.MODEL, 'templatemark.cto');
    result.factory = new Factory(result.modelManager);
    result.serializer = new Serializer(result.factory, result.modelManager, { utcOffset: 0 });
    return result;
}

const templateMarkManager = mkTemplateMarkManager();

/**
 * Returns the concept for the template
 * @param {object} introspector - the model introspector for this template
 * @param {string} templateKind - either 'clause' or 'contract'
 * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
 * @throws {Error} if no template model is found, or multiple template models are found
 * @returns {ClassDeclaration} the concept for the template
 */
function findTemplateConcept(introspector, templateKind, conceptFullyQualifiedName) {
    if(conceptFullyQualifiedName) {
        return introspector.getClassDeclaration();
    }
    else {
        const templateModels = introspector.getClassDeclarations().filter((item) => {
            return !item.isAbstract() && item.getDecorator('template');
        });
        if (templateModels.length > 1) {
            throw new Error('Found multiple concepts with @template decorator. The model for the template must contain a single concept with the @template decorator.');
        } else if (templateModels.length === 0) {
            throw new Error('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr.');
        } else {
            return templateModels[0];
        }
    }
}

/**
 * Returns the template model for a type
 * @param {object} introspector - the model introspector for this template
 * @param {string} elementType - the element type
 * @throws {Error} if no template model is found, or multiple template models are found
 * @returns {ClassDeclaration} the template model for the template
 */
function findElementModel(introspector, elementType) {
    return introspector.getClassDeclaration(elementType);
}

/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} introspector - the introspector for this template
 * @param {string} model - the model
 * @param {string} templateKind - either 'clause' or 'contract'
 * @param {object} options - optional parameters
 * @param {number} [options.utcOffset] - UTC Offset for this execution
 * @returns {object} the typed TemplateMark DOM
 */
function templateMarkTypingGen(template,introspector,model,templateKind,options) {
    const input = templateMarkManager.serializer.fromJSON(template,options);

    const parameters = {
        templateMarkModelManager: templateMarkManager.modelManager,
        introspector: introspector,
        model: model,
        kind: templateKind,
    };
    const visitor = new TypeVisitor();
    input.accept(visitor, parameters);
    let result = Object.assign({}, templateMarkManager.serializer.toJSON(input,options));

    // Calculates formula dependencies
    const fvisitor = new FormulaVisitor();
    result = fvisitor.calculateDependencies(templateMarkManager.modelManager.serializer,result,options);
    return result;
}

/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} templateKind - either 'clause' or 'contract'
 * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
 * @returns {object} the typed TemplateMark DOM
 */
function templateMarkTyping(template,modelManager,templateKind,conceptFullyQualifiedName) {
    const introspector = new Introspector(modelManager);
    const model = findTemplateConcept(introspector, templateKind,conceptFullyQualifiedName);
    return templateMarkTypingGen(template,introspector,model,templateKind);
}

/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} elementType - the element type
 * @returns {object} the typed TemplateMark DOM
 */
function templateMarkTypingFromType(template,modelManager,elementType) {
    const introspector = new Introspector(modelManager);
    const model = findElementModel(introspector, elementType);

    const rootNode = {
        '$class': `${CommonMarkModel.NAMESPACE}.Document`,
        'xmlns' : 'http://commonmark.org/xml/1.0',
        'nodes': [{
            '$class': `${TemplateMarkModel.NAMESPACE}.ContractDefinition`,
            'name': 'top',
            'nodes': template
        }]
    };
    const rootNodeTyped = templateMarkTypingGen(rootNode,introspector,model,'clause');
    return rootNodeTyped.nodes[0].nodes;
}

/**
 * Converts a templatemark string to a token stream
 * @param {object} input the templatemark string
 * @returns {object} the token stream
 */
function templateToTokens(input) {
    const norm = normalizeNLs(input);
    const parser = new MarkdownIt({html:true}).use(MarkdownItTemplate);
    return parser.parse(norm,{});
}

/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @returns {object} the TemplateMark DOM
 */
function tokensToUntypedTemplateMarkGen(tokenStream) {
    const fromMarkdownIt = new FromMarkdownIt(templaterules);
    const partialTemplate = fromMarkdownIt.toCommonMark(tokenStream);
    const result = templateMarkManager.serializer.toJSON(templateMarkManager.serializer.fromJSON(partialTemplate));
    return result.nodes;
}

/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the TemplateMark DOM
 */
function tokensToUntypedTemplateMark(tokenStream, templateKind) {
    const partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);

    if (templateKind === 'contract') {
        return {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            'xmlns' : 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': `${TemplateMarkModel.NAMESPACE}.ContractDefinition`,
                'name': 'top',
                'nodes': partialTemplate
            }]
        };
    } else {
        return {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            'xmlns' : 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
                'name': 'top',
                'nodes': partialTemplate
            }]
        };
    }
}

/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the TemplateMark DOM
 */
function tokensToUntypedTemplateMarkFragment(tokenStream) {
    const partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);
    return {
        '$class': `${CommonMarkModel.NAMESPACE}.Document`,
        'xmlns' : 'http://commonmark.org/xml/1.0',
        'nodes': [{
            '$class': `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
            'name': 'top',
            'nodes': partialTemplate
        }]
    };
}

module.exports.findTemplateConcept = findTemplateConcept;
module.exports.templateMarkManager = templateMarkManager;

module.exports.templateToTokens = templateToTokens;
module.exports.tokensToUntypedTemplateMarkFragment = tokensToUntypedTemplateMarkFragment;
module.exports.tokensToUntypedTemplateMark = tokensToUntypedTemplateMark;
module.exports.templateMarkTyping = templateMarkTyping;
module.exports.templateMarkTypingFromType = templateMarkTypingFromType;
