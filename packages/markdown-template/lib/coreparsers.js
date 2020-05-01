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

const P = require('parsimmon');
const { ParseException } = require('@accordproject/concerto-core');

/**
 * Utilities
 */

/**
 * Creates a variable output
 * @param {object} variable the variable ast node
 * @param {*} value the variable value
 * @returns {object} the variable
 */
function mkVariable(variable,value) {
    const result = {};
    result.name = variable.name;
    result.type = variable.type;
    result.value = value;
    return result;
}

/**
 * Creates a compound variable output
 * @param {object} variable the variable ast node
 * @param {*} value the variable components
 * @returns {object} the compound variable
 */
function mkCompoundVariable(variable,value) {
    const result = {};
    result.$class = variable.type;
    for(let i = 0; i < value.length; i++) {
        const field = value[i];
        if(result[field.name]) {
            if (result[field.name] !== field.value) {
                const message = `Inconsistent values for variable ${field.name}: ${result[field.name]} and ${field.value}`;
                throw new Error(message);
            }
        } else {
            result[field.name] = field.value;
        }
    }
    return result;
}

/**
 * Creates a conditional output
 * @param {object} condNode the conditional ast node
 * @param {*} value the variable value
 * @returns {object} the conditional
 */
function mkCond(condNode,value) {
    const result = {};
    result.name = condNode.name;
    result.type = 'Boolean';
    result.value = value === condNode.whenTrue ? true : false;
    return result;
}

/**
 * Creates a List output
 * @param {object} list the list ast node
 * @param {*} value the variable value
 * @returns {object} the conditional
 */
function mkList(listNode,value) {
    const result = {};
    result.name = listNode.name;
    result.type = 'List';
    result.value = [];
    for(let i = 0; i < value.length; i++) {
        result.value.push(mkCompoundVariable({'type':listNode.type},value[i]));
    }
    return result;
}

/**
 * Creates a With output
 * @param {object} withNode the with ast node
 * @param {*} value the variable value
 * @returns {object} the with
 */
function mkWith(withNode,value) {
    const result = {};
    result.name = withNode.name;
    result.type = withNode.type;
    result.value = mkCompoundVariable(withNode,value);
    return result;
}

/**
 * Creates a clause output
 * @param {object} clause the clause ast node
 * @param {*} value the clause value
 * @returns {object} the clause
 */
function mkClause(clause,value) {
    return mkCompoundVariable(clause,value.concat({"name":"clauseId","type":"String","value":clause.id}));
}

/**
 * Creates a wrapped clause output
 * @param {object} clause the wrapped clause ast node
 * @param {*} value the wrapped clause value
 * @returns {object} the clause
 */
function mkWrappedClause(clause,value) {
    return {'name':clause.name,'type':clause.type,'value':mkClause(clause,value)};
}

/**
 * Creates a contract output
 * @param {object} contract the contract ast node
 * @param {*} value the contract value
 * @returns {object} the contract
 */
function mkContract(contract,value) {
    return mkCompoundVariable(contract,value.concat({"name":"contractId","type":"String","value":contract.id}));
}

/**
 * Core parsing components
 */

/**
 * Creates a parser for Text chunks
 * @param {string} text the text
 * @returns {object} the parser
 */
function textParser(text) {
    return P.string(text);
}

/**
 * Creates a parser for a String
 * @returns {object} the parser
 */
function stringLiteralParser() {
    return P.regexp(/"[^"]*"/).desc('A String literal "..."');
}

/**
 * Creates a parser for choices
 * @param {object[]} parsers - the individual parsers
 * @returns {object} the parser
 */
function choiceParser(parsers) {
    return P.alt.apply(null, parsers);
}

/**
 * Creates a parser for choices of strings
 * @param {string[]} values - the individual strings
 * @returns {object} the parser
 */
function choiceStringsParser(values) {
    return choiceParser(values.map(function (x) {return P.string(x)}));
}

/**
 * Creates a parser for sequences
 * @param {object[]} parsers - the individual parsers
 * @returns {object} the parser
 */
function seqParser(parsers) {
    return P.seqMap.apply(null, parsers.concat([function () {
        var args = Array.prototype.slice.call(arguments);
        return args.filter(function(x) { return !(typeof x === 'string'); });
    }]));
}

/**
 * Creates a parser for a computed value
 * @returns {object} the parser
 */
function computedParser() {
    return P.regexp(/{{[^}]*}}/).desc('A computed variable {{ ... }}');
}

/**
 * Creates a parser for Double
 * @param {object} variable the variable ast node
 * @returns {object} the parser
 */
function doubleParser(variable) {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/).map(function(x) {
        return mkVariable(variable,Number(x));
    }).desc('A Double literal');
}

/**
 * Creates a parser for Integer
 * @param {object} variable the variable ast node
 * @returns {object} the parser
 */
function integerParser(variable) {
    return P.regexp(/[0-9]+/).map(function(x) {
        return mkVariable(variable,Number(x));
    }).desc('An Integer literal');
}

/**
 * Creates a parser for a String variable
 * @param {object} variable the variable ast node
 * @returns {object} the parser
 */
function stringParser(variable) {
    return stringLiteralParser().map(function(x) {
        return mkVariable(variable,x.substring(1, x.length-1));
    });
}

/**
 * Creates a parser for Enums
 * @param {object} variable the variable ast node
 * @param {string[]} enums - the enum values
 * @returns {object} the parser
 */
function enumParser(variable, enums) {
    return choiceStringsParser(enums).map(function(x) {
        return mkVariable(variable,x);
    });
}

/**
 * Creates a parser for a conditional block
 * @param {object} condNode the conditional ast node
 * @returns {object} the parser
 */
function condParser(condNode) {
    return P.alt(P.string(condNode.whenTrue),P.string(condNode.whenFalse)).map(function(x) {
        return mkCond(condNode,x);
    });;
}

/**
 * Creates a parser for bulletted lists
 * @param {object} listNode the list ast node
 * @param {object} bullet the parser for the bullet
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function listParser(listNode,bullet,content) {
    return P.seq(bullet,content).map(function(x) {
        return x[1]; // XXX First element is bullet
    }).many().map(function(x) {
        return mkList(listNode,x);
    });
}

/**
 * Creates a parser for an unordered list block
 * @param {object} listNode the list ast node
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function ulistParser(listNode,content) {
    return listParser(listNode,textParser('\n- '),content);
}

/**
 * Creates a parser for an ordered list block
 * @param {object} listNode the list ast node
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function olistParser(listNode,content) {
    return listParser(listNode,P.seq(P.string('\n'),P.regexp(/[0-9]+/),P.string('. ')),content);
}

/**
 * Creates a parser for a with block
 * @param {object} withNode the with ast node
 * @param {object} content the parser for the content of the with
 * @returns {object} the parser
 */
function withParser(withNode,content) {
    return content.map(function(x) {
        return mkWith(withNode,x);
    });
}

/**
 * Creates a parser for clause content
 * @param {object} clause the clause ast node
 * @param {object} content the parser for the content of the clause
 * @returns {object} the parser
 */
function clauseParser(clause,content) {
    return content.map(function(x) {
        return mkClause(clause,x);
    });
}

/**
 * Creates a parser for contract content
 * @param {object} contract the contract ast node
 * @param {object} content the parser for the content of the contract
 * @returns {object} the parser
 */
function contractParser(contract,content) {
    return content.map(function(x) {
        return mkContract(contract,x);
    });
}

/**
 * Creates a parser for a clause
 * @param {object} clause the clause ast node
 * @param {object} content the parser for the content of the clause
 * @returns {object} the parser
 */
function wrappedClauseParser(clause,content) {
    const clauseBefore = (() => P.seq(textParser('\n``` <clause src='),stringLiteralParser(),textParser(' clauseid='),stringLiteralParser(),textParser('>\n')));
    const clauseAfter = (() => textParser('\n```\n'));
    return content.wrap(clauseBefore(),clauseAfter()).map(function(x) {
        return mkWrappedClause(clause,x);
    });
}

module.exports.mkVariable = mkVariable;
module.exports.mkCompoundVariable = mkCompoundVariable;
module.exports.stringLiteralParser = stringLiteralParser;

module.exports.textParser = textParser;
module.exports.seqParser = seqParser;
module.exports.choiceStringsParser = choiceStringsParser;

module.exports.computedParser = computedParser;
module.exports.doubleParser = doubleParser;
module.exports.integerParser = integerParser;
module.exports.stringParser = stringParser;
module.exports.enumParser = enumParser;
module.exports.condParser = condParser;
module.exports.ulistParser = ulistParser;
module.exports.olistParser = olistParser;
module.exports.withParser = withParser;
module.exports.clauseParser = clauseParser;
module.exports.wrappedClauseParser = wrappedClauseParser;
module.exports.contractParser = contractParser;
