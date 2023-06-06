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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
var {
  ModelManager,
  Factory,
  Serializer,
  Introspector
} = require('@accordproject/concerto-core');
var {
  CommonMarkModel,
  CiceroMarkModel,
  ConcertoMetaModel,
  TemplateMarkModel
} = require('@accordproject/markdown-common');
var normalizeNLs = require('./normalize').normalizeNLs;
var TypeVisitor = require('./TypeVisitor');
var FormulaVisitor = require('./FormulaVisitor');
var MarkdownIt = require('markdown-it');
var MarkdownItTemplate = require('@accordproject/markdown-it-template');
var FromMarkdownIt = require('@accordproject/markdown-common').FromMarkdownIt;
var templaterules = require('./templaterules');

/**
 * Model manager for TemplateMark
 * @param {object} options - optional parameters
 * @param {number} [options.utcOffset] - UTC Offset for this execution
 * @returns {object} model manager and utilities for TemplateMark
 */
function mkTemplateMarkManager(options) {
  var result = {};
  var newOpts = _objectSpread(_objectSpread({}, options), {}, {
    strict: true
  });
  result.modelManager = new ModelManager(newOpts);
  result.modelManager.addCTOModel(CommonMarkModel.MODEL, 'commonmark.cto');
  result.modelManager.addCTOModel(ConcertoMetaModel.MODEL, 'metamodel.cto');
  result.modelManager.addCTOModel(CiceroMarkModel.MODEL, 'ciceromark.cto');
  result.modelManager.addCTOModel(TemplateMarkModel.MODEL, 'templatemark.cto');
  result.factory = new Factory(result.modelManager);
  result.serializer = new Serializer(result.factory, result.modelManager, {
    utcOffset: 0
  });
  return result;
}
var templateMarkManager = mkTemplateMarkManager();

/**
 * Returns the concept for the template
 * @param {object} introspector - the model introspector for this template
 * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
 * @throws {Error} if no template model is found, or multiple template models are found
 * @returns {ClassDeclaration} the concept for the template
 */
function findTemplateConcept(introspector, conceptFullyQualifiedName) {
  if (conceptFullyQualifiedName) {
    return introspector.getClassDeclaration();
  } else {
    var templateModels = introspector.getClassDeclarations().filter(item => {
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
function templateMarkTypingGen(template, introspector, model, templateKind, options) {
  var input = templateMarkManager.serializer.fromJSON(template, options);
  var parameters = {
    templateMarkModelManager: templateMarkManager.modelManager,
    introspector: introspector,
    model: model,
    kind: templateKind
  };
  var visitor = new TypeVisitor();
  input.accept(visitor, parameters);
  var result = Object.assign({}, templateMarkManager.serializer.toJSON(input, options));

  // Calculates formula dependencies
  var fvisitor = new FormulaVisitor();
  result = fvisitor.calculateDependencies(templateMarkManager.modelManager.serializer, result, options);
  return result;
}

/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the typed TemplateMark DOM
 */
function templateMarkTyping(template, modelManager, templateKind) {
  var introspector = new Introspector(modelManager);
  var model = findTemplateConcept(introspector, templateKind);
  return templateMarkTypingGen(template, introspector, model, templateKind);
}

/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} elementType - the element type
 * @returns {object} the typed TemplateMark DOM
 */
function templateMarkTypingFromType(template, modelManager, elementType) {
  var introspector = new Introspector(modelManager);
  var model = findElementModel(introspector, elementType);
  var rootNode = {
    '$class': "".concat(CommonMarkModel.NAMESPACE, ".Document"),
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': [{
      '$class': "".concat(TemplateMarkModel.NAMESPACE, ".ContractDefinition"),
      'name': 'top',
      'nodes': template
    }]
  };
  var rootNodeTyped = templateMarkTypingGen(rootNode, introspector, model, 'clause');
  return rootNodeTyped.nodes[0].nodes;
}

/**
 * Converts a templatemark string to a token stream
 * @param {object} input the templatemark string
 * @returns {object} the token stream
 */
function templateToTokens(input) {
  var norm = normalizeNLs(input);
  var parser = new MarkdownIt({
    html: true
  }).use(MarkdownItTemplate);
  return parser.parse(norm, {});
}

/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @returns {object} the TemplateMark DOM
 */
function tokensToUntypedTemplateMarkGen(tokenStream) {
  var fromMarkdownIt = new FromMarkdownIt(templaterules);
  var partialTemplate = fromMarkdownIt.toCommonMark(tokenStream);
  var result = templateMarkManager.serializer.toJSON(templateMarkManager.serializer.fromJSON(partialTemplate));
  return result.nodes;
}

/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the TemplateMark DOM
 */
function tokensToUntypedTemplateMark(tokenStream, templateKind) {
  var partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);
  if (templateKind === 'contract') {
    return {
      '$class': "".concat(CommonMarkModel.NAMESPACE, ".Document"),
      'xmlns': 'http://commonmark.org/xml/1.0',
      'nodes': [{
        '$class': "".concat(TemplateMarkModel.NAMESPACE, ".ContractDefinition"),
        'name': 'top',
        'nodes': partialTemplate
      }]
    };
  } else {
    return {
      '$class': "".concat(CommonMarkModel.NAMESPACE, ".Document"),
      'xmlns': 'http://commonmark.org/xml/1.0',
      'nodes': [{
        '$class': "".concat(TemplateMarkModel.NAMESPACE, ".ClauseDefinition"),
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
  var partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);
  return {
    '$class': "".concat(CommonMarkModel.NAMESPACE, ".Document"),
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': [{
      '$class': "".concat(TemplateMarkModel.NAMESPACE, ".ClauseDefinition"),
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