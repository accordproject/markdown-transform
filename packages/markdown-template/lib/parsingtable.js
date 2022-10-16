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

var Boolean = require('./plugins/Boolean');
var Integer = require('./plugins/Integer');
var Long = require('./plugins/Long');
var Double = require('./plugins/Double');
var String = require('./plugins/String');
var DateTime = require('./plugins/DateTime');
var Resource = require('./plugins/Resource');
var MonetaryAmount = require('./plugins/MonetaryAmount');
var seqFunParser = require('./combinators').seqFunParser;
var withParser = require('./combinators').withParser;
var Introspector = require('@accordproject/concerto-core').Introspector;
var ModelVisitor = require('./ModelVisitor');
var {
  templateMarkManager,
  templateToTokens,
  tokensToUntypedTemplateMarkFragment,
  templateMarkTypingFromType
} = require('./templatemarkutil');

/**
 * Adds entry to parsing table
 * @param {object} table the parsing table
 * @param {object} entry the entry for a given type
 */
function addEntryToParsingTable(table, entry) {
  Object.assign(table, entry);
}

/**
 * Clone a CiceroMark node
 * @param {*} serializer the Concerto serializer
 * @param {*} nodes the nodes to visit
 * @return {*} the cloned nodes
 */
function concertoNodes(serializer, nodes) {
  var rootNode = {
    '$class': 'org.accordproject.commonmark.Document',
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': nodes
  };
  return serializer.fromJSON(rootNode).nodes;
}

/**
 * Parsing table for variables
 * This maps types to their parser
 * @return {object} the default parsing table
 */
function defaultParsingTable() {
  var table = {};
  addEntryToParsingTable(table, Boolean);
  addEntryToParsingTable(table, Integer);
  addEntryToParsingTable(table, Long);
  addEntryToParsingTable(table, Double);
  addEntryToParsingTable(table, String);
  addEntryToParsingTable(table, DateTime);
  addEntryToParsingTable(table, Resource);
  addEntryToParsingTable(table, MonetaryAmount);
  return table;
}

/**
 * Maintains a parsing table
 * @class
 */
class ParsingTable {
  /**
   * Create the ParsingTable
   * @param {*} modelManager - the model manager
   * @param {*} parserFunOfTemplateMark - how to get a parser from a TemplateMark DOM
   * @param {*} draftVisitNodes - visitor for drafting
   */
  constructor(modelManager, parserFunOfTemplateMark, draftVisitNodes) {
    this.modelManager = modelManager;
    this.introspector = new Introspector(this.modelManager);

    // Mapping from types to parsers/drafters
    this.parsingTable = defaultParsingTable();

    // Hook: How to compile from template mark to parser
    this.parseFromTemplateMark = function (nodes, elementType, params) {
      var childrenParser = seqFunParser(nodes.map(function (x) {
        return parserFunOfTemplateMark(x, params);
      }));
      return r => {
        return withParser(elementType, childrenParser(r));
      };
    };
    // Hook: How to draft from template mark to parser
    this.draftFromTemplateMark = function (nodes, elementType, params) {
      return data => {
        var cNodes = concertoNodes(params.templateMarkSerializer, nodes);
        var childrenParameters = {
          parserManager: params.parserManager,
          templateMarkModelManager: params.templateMarkModelManager,
          templateMarkSerializer: params.templateMarkSerializer,
          data: data,
          kind: 'clause'
        };
        return draftVisitNodes(params.visitor, cNodes, childrenParameters);
      };
    };
    // Hook: How to compile from CTO to ciceromark
    this.templateMarkFromModel = function (name, model, elementType) {
      var modelVisitor = new ModelVisitor();
      var genericParameters = {
        name: name
      };
      var generic = model.accept(modelVisitor, genericParameters);
      var validated = templateMarkManager.serializer.toJSON(templateMarkManager.serializer.fromJSON(generic));
      return validated.nodes;
    };
  }

  /**
   * Gets parsing table for variables
   * @return {object} the parsing table
   */
  getParsingTable() {
    return this.parsingTable;
  }

  /**
   * Sets parsing table for variables
   * @param {object} table the parsing table
   */
  setParsingTable(table) {
    this.parsingTable = table;
  }

  /**
   * Adds parsing table for variables
   * @param {object} table the parsing table
   */
  addParsingTable(table) {
    this.parsingTable = Object.assign(this.parsingTable, table);
  }

  /**
   * Adds entry to parsing table
   * @param {object} entry the entry for a given type
   */
  addParsingTableEntry(entry) {
    addEntryToParsingTable(this.parsingTable, entry);
  }

  /**
   * Compile a CTO model into its TemplateMark equivalent
   * @param {string} name the property name
   * @param {object} parsingTable the parsing table
   * @param {string} elementType the type
   */
  compileModel(name, parsingTable, elementType) {
    var model = this.introspector.getClassDeclaration(elementType);
    var templateMark = this.templateMarkFromModel(name, model, elementType);
    parsingTable[elementType] = {};
    parsingTable[elementType].templatemark = {};
    parsingTable[elementType].templatemark.nodes = templateMark;
  }

  /**
   * Compile an entry into its JavaScript equivalent
   * @param {object} entry the parsing table entry for this type
   * @param {string} elementType the type
   * @param {object} parseParams parameters for the nested parse generation
   * @param {object} draftParams parameters for the nested draft generation
   */
  compileEntry(entry, elementType, parseParams, draftParams) {
    if (Object.prototype.hasOwnProperty.call(entry, 'inline')) {
      var tokenStream = templateToTokens(entry.inline);
      var template = tokensToUntypedTemplateMarkFragment(tokenStream);
      entry.templatemark = {};
      entry.templatemark.nodes = template.nodes[0].nodes[0].nodes; // XXX not robust beyond a paragraph
    }

    if (Object.prototype.hasOwnProperty.call(entry, 'templatemark')) {
      var _template = entry.templatemark.nodes;
      var typedTemplate = templateMarkTypingFromType(_template, this.modelManager, elementType);
      if (parseParams) {
        var parse = this.parseFromTemplateMark(typedTemplate, elementType, parseParams);
        if (!Object.prototype.hasOwnProperty.call(entry, 'javascript')) {
          entry.javascript = {};
        }
        entry.javascript.parse = format => parse;
      }
      if (draftParams) {
        var draft = this.draftFromTemplateMark(typedTemplate, elementType, draftParams);
        if (!Object.prototype.hasOwnProperty.call(entry, 'javascript')) {
          entry.javascript = {};
        }
        entry.javascript.draft = draft;
      }
    }
  }

  /**
   * Gets parser for a given type
   * @param {string} name - the property
   * @param {string} elementType - the type of this node
   * @param {string} format - the format
   * @param {object} parseParams - parameters for the nested parse generation
   * @return {*} the parser
   */
  getParser(name, elementType, format, parseParams) {
    var parsingTable = this.getParsingTable();
    if (!parsingTable[elementType]) {
      this.compileModel(name, parsingTable, elementType);
    }
    var entry = parsingTable[elementType];
    if (!Object.prototype.hasOwnProperty.call(entry, 'javascript' || !entry.javascript.parse)) {
      this.compileEntry(entry, elementType, parseParams, null);
    }
    if (Object.prototype.hasOwnProperty.call(entry, 'javascript') && entry.javascript.parse) {
      return entry.javascript.parse(format, parseParams.parserManager);
    } else {
      throw new Error('No known parser for type ' + elementType);
    }
  }

  /**
   * Gets drafter for a given type
   * @param {string} name the property
   * @param {string} elementType the type
   * @param {string} format the format
   * @param {object} draftParams parameters for the nested draft generation
   * @return {*} the drafter
   */
  getDrafter(name, elementType, format, draftParams) {
    var parsingTable = this.getParsingTable();
    if (!parsingTable[elementType]) {
      this.compileModel(name, parsingTable, elementType);
    }
    var entry = parsingTable[elementType];
    if (!Object.prototype.hasOwnProperty.call(entry, 'javascript') || !entry.javascript.draft) {
      this.compileEntry(entry, elementType, null, draftParams);
    }
    if (Object.prototype.hasOwnProperty.call(entry, 'javascript') && entry.javascript.draft) {
      return entry.javascript.draft;
    } else {
      throw new Error('No known parser for type ' + elementType);
    }
  }
}
module.exports = ParsingTable;