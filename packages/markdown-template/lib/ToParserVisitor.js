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

var P = require('parsimmon');
var flatten = require('./util').flatten;
var CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;
var FromCommonMarkVisitor = require('@accordproject/markdown-common').FromCommonMarkVisitor;
var fromcommonmarkrules = require('@accordproject/markdown-common').fromcommonmarkrules;
var toparserrules = require('./toparserrules');
var templateMarkManager = require('./templatemarkutil').templateMarkManager;
var seqFunParser = require('./combinators').seqFunParser;
var resultString = result => {
  return r => P.string(result);
};
var resultSeq = (parameters, result) => {
  var resultParsers;
  if (parameters.result) {
    resultParsers = seqFunParser([parameters.result].concat(result));
  } else {
    resultParsers = seqFunParser(result);
  }
  parameters.result = function (x) {
    return resultParsers(x).map(flatten);
  };
};

/**
 * Converts a TemplateMark DOM to a parser.
 */
class ToParserVisitor extends FromCommonMarkVisitor {
  /**
   * Construct the visitor.
   * @param {object} [options] configuration options
   * @param {*} resultSeq how to sequentially combine results
   * @param {object} rules how to process each node type
   */
  constructor(options) {
    var setFirst = thingType => {
      return thingType === 'Item' || thingType === 'ClauseDefinition' || thingType === 'ListBlockDefinition' ? true : false;
    };
    var rules = fromcommonmarkrules;
    Object.assign(rules, toparserrules);
    super(options, resultString, resultSeq, rules, setFirst);
  }

  /**
   * Converts a TemplateMark DOM to a parser for that node, given parameters
   * @param {object} visitor - the visitor
   * @param {object} ast - the template AST
   * @param {object} parameters - current parameters
   * @returns {object} the parser
   */
  static toParserWithParameters(visitor, ast, parameters) {
    var localParameters = Object.assign({}, parameters);
    localParameters.parserManager = parameters.parserManager;
    localParameters.parsingTable = parameters.parsingTable, localParameters.templateParser = parameters.templateParser;
    localParameters.result = resultString('');
    localParameters.stack = parameters.stack;
    localParameters.first = parameters.first;
    var dom = templateMarkManager.serializer.fromJSON(ast);
    dom.accept(visitor, localParameters);
    return localParameters.result;
  }

  /**
   * Converts a TemplateMark DOM to a full parser
   * @param {*} parserManager - the parser manager
   * @param {object} ast - the template AST
   * @param {object} parsingTable - the parsing table
   * @returns {object} the parser
   */
  toParser(parserManager, ast, parsingTable) {
    // Start with an empty parser
    var templateParser = {};
    var parameters = {};
    parameters.parserManager = parserManager;
    parameters.parsingTable = parsingTable, parameters.templateParser = templateParser;
    parameters.result = resultString('');
    parameters.stack = CommonMarkUtils.blocksInit();
    parameters.first = false;
    var parser = ToParserVisitor.toParserWithParameters(this, ast, parameters);
    templateParser.main = r => parser(r).map(function (x) {
      return x[0];
    });
    return P.createLanguage(templateParser).main;
  }
}
module.exports = ToParserVisitor;