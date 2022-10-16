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
  CommonMarkModel
} = require('@accordproject/markdown-common').CommonMarkModel;
var {
  CiceroMarkModel
} = require('@accordproject/markdown-cicero').CiceroMarkModel;
var {
  ConcertoMetaModel
} = require('@accordproject/markdown-cicero').ConcertoMetaModel;
var TemplateMarkModel = require('./externalModels/TemplateMarkModel').TemplateMarkModel;
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
  result.modelManager = new ModelManager(options);
  result.modelManager.addCTOModel(CommonMarkModel, 'commonmark.cto');
  result.modelManager.addCTOModel(ConcertoMetaModel, 'metamodel.cto');
  result.modelManager.addCTOModel(CiceroMarkModel, 'ciceromark.cto');
  result.modelManager.addCTOModel(TemplateMarkModel, 'templatemark.cto');
  result.factory = new Factory(result.modelManager);
  result.serializer = new Serializer(result.factory, result.modelManager, {
    utcOffset: 0
  });
  return result;
}
var templateMarkManager = mkTemplateMarkManager();

/**
 * Check to see if a ClassDeclaration is an instance of the specified fully qualified
 * type name.
 * @internal
 * @param {ClassDeclaration} classDeclaration The class to test
 * @param {String} fqt The fully qualified type name.
 * @returns {boolean} True if classDeclaration an instance of the specified fully
 * qualified type name, false otherwise.
 */
function instanceOf(classDeclaration, fqt) {
  // Check to see if this is an exact instance of the specified type.
  if (classDeclaration.getFullyQualifiedName() === fqt) {
    return true;
  }
  // Now walk the class hierachy looking to see if it's an instance of the specified type.
  var superTypeDeclaration = classDeclaration.getSuperTypeDeclaration();
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
function findTemplateModel(introspector, templateKind) {
  var modelType = 'org.accordproject.contract.Contract';
  if (templateKind !== 'contract') {
    modelType = 'org.accordproject.contract.Clause';
  }
  var templateModels = introspector.getClassDeclarations().filter(item => {
    return !item.isAbstract() && instanceOf(item, modelType);
  });
  if (templateModels.length > 1) {
    throw new Error("Found multiple instances of ".concat(modelType, ". The model for the template must contain a single asset that extends ").concat(modelType, "."));
  } else if (templateModels.length === 0) {
    throw new Error("Failed to find an asset that extends ".concat(modelType, ". The model for the template must contain a single asset that extends ").concat(modelType, "."));
  } else {
    return templateModels[0];
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
  var model = findTemplateModel(introspector, templateKind);
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
    '$class': 'org.accordproject.commonmark.Document',
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': [{
      '$class': 'org.accordproject.templatemark.ContractDefinition',
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
      '$class': 'org.accordproject.commonmark.Document',
      'xmlns': 'http://commonmark.org/xml/1.0',
      'nodes': [{
        '$class': 'org.accordproject.templatemark.ContractDefinition',
        'name': 'top',
        'nodes': partialTemplate
      }]
    };
  } else {
    return {
      '$class': 'org.accordproject.commonmark.Document',
      'xmlns': 'http://commonmark.org/xml/1.0',
      'nodes': [{
        '$class': 'org.accordproject.templatemark.ClauseDefinition',
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
    '$class': 'org.accordproject.commonmark.Document',
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': [{
      '$class': 'org.accordproject.templatemark.ClauseDefinition',
      'name': 'top',
      'nodes': partialTemplate
    }]
  };
}

/**
 * @param {object} modelManager - the model manager
 * @param {object} type - The type from the model source to generate a JSON for
 * @return {object} the generated JSON instance
 */
function generateJSON(modelManager, type) {
  var factory = new Factory(modelManager);
  var serializer = new Serializer(factory, modelManager);
  switch (type) {
    case 'DateTime':
      return dayjs.utc();
    case 'Integer':
      return 0;
    case 'Long':
      return 0;
    case 'Double':
      return 0.0;
    case 'Boolean':
      return false;
    case 'String':
      return '';
    default:
      {
        var classDeclaration = modelManager.getType(type);
        if (classDeclaration.isEnum()) {
          throw new Error('Cannot generate JSON for an enumerated type directly, the type should be contained in Concept, Asset, Transaction or Event declaration');
        }
        var ns = classDeclaration.getNamespace();
        var name = classDeclaration.getName();
        var factoryOptions = {
          includeOptionalFields: true,
          generate: true
        };
        if (classDeclaration.isConcept()) {
          var concept = factory.newConcept(ns, name, null, factoryOptions);
          return serializer.toJSON(concept);
        }
        var resource = factory.newResource(ns, name, 'resource1', null, factoryOptions);
        return serializer.toJSON(resource);
      }
  }
}
module.exports.findTemplateModel = findTemplateModel;
module.exports.templateMarkManager = templateMarkManager;
module.exports.templateToTokens = templateToTokens;
module.exports.tokensToUntypedTemplateMarkFragment = tokensToUntypedTemplateMarkFragment;
module.exports.tokensToUntypedTemplateMark = tokensToUntypedTemplateMark;
module.exports.templateMarkTyping = templateMarkTyping;
module.exports.templateMarkTypingFromType = templateMarkTypingFromType;
module.exports.generateJSON = generateJSON;