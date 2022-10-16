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

var CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;

// Basic parser constructors
var computedParser = require('./combinators').computedParser;
var enumParser = require('./combinators').enumParser;
var conditionalParser = require('./combinators').conditionalParser;
var optionalParser = require('./combinators').optionalParser;
var ulistBlockParser = require('./combinators').ulistBlockParser;
var olistBlockParser = require('./combinators').olistBlockParser;
var joinBlockParser = require('./combinators').joinBlockParser;
var withParser = require('./combinators').withParser;
var clauseParser = require('./combinators').clauseParser;
var wrappedClauseParser = require('./combinators').wrappedClauseParser;
var contractParser = require('./combinators').contractParser;
var mkVariable = require('./combinators').mkVariable;

/**
 * inContract
 * @param {string[]} stack - the stack of ancestor nodes
 * @return {boolean} are we inside a contract definition
 */
function inContract(stack) {
  return stack.blocks.includes('ContractDefinition');
}

/* Those are additional rules to for the templatemark parser generation, complementing those for commonmark */

//const CommonMarkUtils = require('./CommonMarkUtils');

var rules = {};

// Inline blocks
rules.EnumVariableDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = r => enumParser(thing.enumValues).map(value => mkVariable(thing, value));
  resultSeq(parameters, result);
};
rules.VariableDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var elementType = thing.identifiedBy ? 'Resource' : thing.elementType;
  var format = thing.format ? thing.format : null;
  var parserName = format ? elementType + '_' + format : elementType;
  var result;
  if (parameters.templateParser[parserName]) {
    result = r => {
      return r[parserName].map(value => mkVariable(thing, value));
    };
  } else {
    var fragmentParameters = {};
    fragmentParameters.parserManager = parameters.parserManager;
    fragmentParameters.parsingTable = parameters.parsingTable;
    fragmentParameters.templateParser = parameters.templateParser;
    fragmentParameters.result = resultString('');
    fragmentParameters.first = parameters.first;
    fragmentParameters.stack = parameters.stack;
    var parsingFun = parameters.parsingTable.getParser(thing.name, elementType, format, fragmentParameters);
    parameters.templateParser[parserName] = parsingFun;
    result = r => {
      try {
        return r[parserName].map(value => mkVariable(thing, value));
      } catch (err) {
        console.log('ERROR HANDLING VARIABLE ' + elementType);
        throw err;
      }
    };
  }
  resultSeq(parameters, result);
};
rules.FormattedVariableDefinition = rules.VariableDefinition;
rules.ConditionalDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var whenTrueParser = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
  var whenFalseParser = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
  var result = r => conditionalParser(thing, whenTrueParser(r), whenFalseParser(r));
  resultSeq(parameters, result);
};
rules.OptionalDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var whenSomeParser = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
  var whenNoneParser = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
  var result = r => optionalParser(thing, whenSomeParser(r), whenNoneParser(r));
  resultSeq(parameters, result);
};
rules.JoinDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = r => joinBlockParser(thing, children(r));
  resultSeq(parameters, result);
};
rules.WithDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = r => withParser(thing.elementType, children(r)).map(value => mkVariable(thing, value));
  resultSeq(parameters, result);
};
rules.FormulaDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = r => computedParser(thing.value);
  resultSeq(parameters, result);
};

// Container blocks
rules.ListBlockDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  // const level = parameters.tight && parameters.tight === 'false' && parameters.index !== parameters.indexInit ? 2 : 1;
  var level = 1;
  var prefix = CommonMarkUtils.mkPrefix(parameters, level);
  var result = thing.type === 'bullet' ? r => ulistBlockParser(thing, children(r), prefix) : r => olistBlockParser(thing, children(r), prefix);
  resultSeq(parameters, result);
};
rules.ClauseDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result;
  if (inContract(parameters.stack)) {
    result = r => wrappedClauseParser(thing, children(r));
  } else {
    result = r => clauseParser(thing, children(r));
  }
  resultSeq(parameters, result);
};
rules.ContractDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = r => contractParser(thing, children(r));
  resultSeq(parameters, result);
};
module.exports = rules;