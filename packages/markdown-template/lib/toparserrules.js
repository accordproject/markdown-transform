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

const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;

// Basic parser constructors
const computedParser = require('./combinators').computedParser;
const enumParser = require('./combinators').enumParser;
const conditionalParser = require('./combinators').conditionalParser;
const optionalParser = require('./combinators').optionalParser;
const ulistBlockParser = require('./combinators').ulistBlockParser;
const olistBlockParser = require('./combinators').olistBlockParser;
const joinBlockParser = require('./combinators').joinBlockParser;
const withParser = require('./combinators').withParser;
const clauseParser = require('./combinators').clauseParser;
const wrappedClauseParser = require('./combinators').wrappedClauseParser;
const contractParser = require('./combinators').contractParser;
const mkVariable = require('./combinators').mkVariable;

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

const rules = {};

// Inline blocks
rules.EnumVariableDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = (r) => enumParser(thing.enumValues).map((value) => mkVariable(thing,value));
    resultSeq(parameters,result);
};
rules.VariableDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const elementType = thing.identifiedBy ? 'Resource' : thing.elementType;
    const format = thing.format ? thing.format : null;
    const parserName = format ? elementType + '_' + format : elementType;
    let result;
    if (parameters.templateParser[parserName]) {
        result = (r) => {
            return r[parserName].map((value) => mkVariable(thing,value));
        };
    } else {
        const fragmentParameters = {};
        fragmentParameters.parserManager = parameters.parserManager;
        fragmentParameters.parsingTable = parameters.parsingTable;
        fragmentParameters.templateParser = parameters.templateParser;
        fragmentParameters.result = resultString('');
        fragmentParameters.first = parameters.first;
        fragmentParameters.stack = parameters.stack;

        const parsingFun = parameters.parsingTable.getParser(thing.name,elementType,format,fragmentParameters);
        parameters.templateParser[parserName] = parsingFun;
        result = (r) => {
            try {
                return r[parserName].map((value) => mkVariable(thing,value));
            } catch(err) {
                console.log('ERROR HANDLING VARIABLE ' + elementType);
                throw err;
            }
        };
    }
    resultSeq(parameters,result);
};
rules.FormattedVariableDefinition = rules.VariableDefinition;
rules.ConditionalDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const whenTrueParser = visitor.visitChildren(visitor,thing,parameters,'whenTrue');
    const whenFalseParser = visitor.visitChildren(visitor,thing,parameters,'whenFalse');
    const result = (r) => conditionalParser(thing,whenTrueParser(r),whenFalseParser(r));
    resultSeq(parameters,result);
};
rules.OptionalDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const whenSomeParser = visitor.visitChildren(visitor,thing,parameters,'whenSome');
    const whenNoneParser = visitor.visitChildren(visitor,thing,parameters,'whenNone');
    const result = (r) => optionalParser(thing,whenSomeParser(r),whenNoneParser(r));
    resultSeq(parameters,result);
};
rules.JoinDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = (r) => joinBlockParser(thing,children(r));
    resultSeq(parameters,result);
};
rules.WithDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = (r) => withParser(thing.elementType,children(r)).map((value) => mkVariable(thing,value));
    resultSeq(parameters,result);
};
rules.FormulaDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = (r) => computedParser(thing.value);
    resultSeq(parameters,result);
};

// Container blocks
rules.ListBlockDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    // const level = parameters.tight && parameters.tight === 'false' && parameters.index !== parameters.indexInit ? 2 : 1;
    const level = 1;
    const prefix = CommonMarkUtils.mkPrefix(parameters,level);
    const result = thing.type === 'bullet' ? (r) => ulistBlockParser(thing,children(r),prefix) : (r) => olistBlockParser(thing,children(r),prefix);
    resultSeq(parameters,result);
};
rules.ClauseDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    let result;
    if (inContract(parameters.stack)) {
        result = (r) => wrappedClauseParser(thing,children(r));
    } else {
        result = (r) => clauseParser(thing,children(r));
    }
    resultSeq(parameters,result);
};
rules.ContractDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = (r) => contractParser(thing,children(r));
    resultSeq(parameters,result);
};

module.exports = rules;