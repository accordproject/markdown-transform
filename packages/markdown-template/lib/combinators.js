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
const uuid = require('uuid');

const flatten = require('./templatemarkutil').flatten;
const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;

/**
 * Creates a variable output
 * @param {object} variable the variable ast node
 * @param {*} value the variable value
 * @returns {object} the variable
 */
function mkVariable(variable,value) {
    let result = {};
    result.name = variable.name;
    result.elementType = variable.elementType;
    result.value = value;
    return result;
}

/**
 * Are two variable values equal
 * @param {object} value1 the first value
 * @param {object} value2 the second value
 * @returns {object} the compound variable
 */
function variableEqual(value1,value2) {
    const type1 = typeof value1;
    const type2 = typeof value2;
    if(type1 === 'object' && type2 === 'object') {
        for(let key1 in value1) {
            if(!value2[key1]) {
                return false;
            }
            if(!variableEqual(value1[key1],value2[key1])) {
                return false;
            }
        }
        for(let key2 in value2) {
            if(!value1[key2]) {
                return false;
            }
        }
    } else if(value1 !== value2) {
        return false;
    }
    return true;
}

/**
 * Creates a compound variable output
 * @param {object} elementType the type of the variable
 * @param {*} value the variable components
 * @returns {object} the compound variable
 */
function mkCompoundVariable(elementType,value) {
    let result = {};
    result.$class = elementType;
    for(let i = 0; i < value.length; i++) {
        const field = value[i];
        if(result[field.name]) {
            if (!variableEqual(result[field.name],field.value)) {
                const message = `Inconsistent values for variable ${field.name}: ${result[field.name]} and ${field.value}`;
                throw new Error(message);
            }
        } else {
            result[field.name] = field.value;
        }
    }
    if (result.this) {
        result = result.this;
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
    result.elementType = 'Boolean';
    result.value = value;
    return result;
}

/**
 * Creates an optional output
 * @param {object} optNode the optional ast node
 * @param {*} value the variable value
 * @returns {object} the optional
 */
function mkOpt(optNode,value) {
    const result = {};
    result.name = optNode.name;
    result.elementType = optNode.elementType;
    result.value = value;
    return result;
}

/**
 * Creates a List output
 * @param {object} listNode the list ast node
 * @param {*} value the variable value
 * @returns {object} the conditional
 */
function mkList(listNode,value) {
    const result = {};
    result.name = listNode.name;
    result.elementType = 'List';
    result.value = [];
    for(let i = 0; i < value.length; i++) {
        let item = mkCompoundVariable(listNode.elementType,value[i]);
        result.value.push(item);
    }
    return result;
}

/**
 * Creates a Join output
 * @param {object} joinNode the join ast node
 * @param {*} value the variable value
 * @returns {object} the conditional
 */
function mkJoin(joinNode,value) {
    const result = {};
    result.name = joinNode.name;
    result.elementType = 'List';
    result.value = [];
    for(let i = 0; i < value.length; i++) {
        result.value.push(mkCompoundVariable(joinNode.elementType,value[i]));
    }
    return result;
}

/**
 * Creates a clause output
 * @param {object} clause the clause ast node
 * @param {*} value the clause value
 * @returns {object} the clause
 */
function mkClause(clause,value) {
    return mkCompoundVariable(clause.elementType,
        value.concat({'name':'clauseId','elementType':'String','value':uuid.v4()}));
}

/**
 * Creates a wrapped clause output
 * @param {object} clause the wrapped clause ast node
 * @param {string} src the clause source url
 * @param {*} value the wrapped clause value
 * @returns {object} the clause
 */
function mkWrappedClause(clause,src,value) {
    const result = {'name':clause.name,'elementType':clause.elementType,'value':mkClause(clause,value)};
    if(src) {
        result.src = src;
    }
    return [result];
}

/**
 * Creates a contract output
 * @param {object} contract the contract ast node
 * @param {*} value the contract value
 * @returns {object} the contract
 */
function mkContract(contract,value) {
    return mkCompoundVariable(contract.elementType,
        value.concat({'name':'contractId','elementType':'String','value':uuid.v4()}));
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
    return P.string(CommonMarkUtils.escapeText(text));
}

/**
 * Creates a parser for a String
 * @returns {object} the parser
 */
function stringLiteralParser() {
    return P.regexp(/"[^"]*"/).desc('A String literal "..."');
}

/**
 * Creates a parser for a name
 * @returns {object} the parser
 */
function nameParser() {
    return P.regexp(/[A-Za-z0-9_-]+/).desc('A name');
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
    return choiceParser(values.map(function (x) { return P.string(x); }));
}

/**
 * Creates a parser for sequences
 * @param {object[]} parsers - the individual parsers
 * @returns {object} the parser
 */
function seqParser(parsers) {
    return P.seqMap.apply(null, parsers.concat([function () {
        const args = Array.prototype.slice.call(arguments);
        return args.filter(function(x) { return !(typeof x === 'string'); });
    }]));
}

/**
 * Creates a parser for sequences of function parsers
 * @param {object[]} parsers - the individual parsers
 * @returns {object} the parser
 */
function seqFunParser(parsers) {
    return (r) => P.seqMap.apply(null, parsers.map(x => x(r)).concat([function () {
        const args = Array.prototype.slice.call(arguments);
        return args.filter(function(x) { return !(typeof x === 'string'); });
    }]));
}

/**
 * Creates a parser for a computed value
 * @returns {object} the parser
 */
function computedParser() {
    return P.regexp(/{{%[^%]*%}}/).desc('A computed variable {{ ... }}');
}

/**
 * Creates a parser for Enums
 * @param {string[]} enums - the enum values
 * @returns {object} the parser
 */
function enumParser(enums) {
    return choiceStringsParser(enums).map(function(x) {
        return x;
    });
}

/**
 * Creates a parser for a conditional block
 * @param {object} condNode the conditional ast node
 * @param {object} whenTrue the parser when the condition is true
 * @param {object} whenFalse the parser when the condition is false
 * @returns {object} the parser
 */
function conditionalParser(condNode, whenTrue, whenFalse) {
    return P.alt(whenTrue.map(x => true),whenFalse.map(x => false)).map(function(x) {
        return mkCond(condNode,x);
    });
}


/**
 * Creates a parser for an optional block
 * @param {object} optNode the optional ast node
 * @param {object} whenSome the parser when the option is present
 * @param {object} whenNone the parser when the option is absent
 * @returns {object} the parser
 */
function optionalParser(optNode, whenSome, whenNone) {
    return P.alt(
        whenSome.map(function(x) {
            return mkCompoundVariable(optNode.elementType,flatten(x));
        }),
        whenNone.map(x => null)).map(function(x) { return mkOpt(optNode,x); });
}

/**
 * Creates a parser for list blocks
 * @param {object} listNode the list ast node
 * @param {object} bullet the parser for the bullet
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function listBlockParser(listNode,bullet,content) {
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
function ulistBlockParser(listNode,content) {
    return listBlockParser(listNode,P.string('\n-  '),content);
}

/**
 * Creates a parser for an ordered list block
 * @param {object} listNode the list ast node
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function olistBlockParser(listNode,content) {
    return listBlockParser(listNode,P.seq(P.string('\n'),P.regexp(/[0-9]+/),P.string('. ')),content);
}

/**
 * Creates a parser for joine blocks
 * @param {object} joinNode the join ast node
 * @param {object} content the parser for the content of the list
 * @returns {object} the parser
 */
function joinBlockParser(joinNode,content) {
    const separator = joinNode.separator;
    return P.seq(content,P.seq(P.string(separator),content).map(x => x[1]).many()).map(function(x) {
        return [x[0]].concat(x[1]);
    }).map(function(x) {
        return mkJoin(joinNode,x);
    });
}

/**
 * Creates a parser for a with block
 * @param {object} elementType the type for the with clause
 * @param {object} content the parser for the content of the with
 * @returns {object} the parser
 */
function withParser(elementType,content) {
    return content.map(function(x) {
        return mkCompoundVariable(elementType,flatten(x));
    });
}

/**
 * Creates a parser for clause content
 * @param {object} clause the clause ast node
 * @param {object} content the parser for the content of the clause
 * @returns {object} the parser
 */
function clauseParser(clause,content) {
    return content.skip(P.optWhitespace).map(function(x) {
        return mkClause(clause,flatten(x));
    });
}

/**
 * Creates a parser for contract content
 * @param {object} contract the contract ast node
 * @param {object} content the parser for the content of the contract
 * @returns {object} the parser
 */
function contractParser(contract,content) {
    return content.skip(P.optWhitespace).map(function(x) {
        return mkContract(contract,flatten(x));
    });
}

/**
 * Creates a parser for a clause
 * @param {object} clause the clause ast node
 * @param {object} content the parser for the content of the clause
 * @returns {object} the parser
 */
function wrappedClauseParser(clause,content) {
    const clauseEnd = P.string('}}\n');
    const clauseBefore = P.seq(P.string('\n\n{{#clause '),nameParser(),P.alt(P.seq(P.string(' src='),stringLiteralParser(),clauseEnd),clauseEnd));
    const clauseAfter = P.string('\n{{/clause}}');
    return P.seq(clauseBefore,content,clauseAfter).map(function(x) {
        const srcAttr = x[0][2];
        const src = srcAttr ? srcAttr[1].substring(1,srcAttr[1].length-1) : null;
        return mkWrappedClause(clause,src,flatten(x[1]));
    });
}

/**
 * Creates a parser for emph
 * @param {object} ast the ast node
 * @param {object} content the parser for the content of the paragraph
 * @returns {object} the parser
 */
function emphParser(ast,content) {
    return content.wrap(P.string('*'), P.string('*'));
}

/**
 * Creates a parser for strong
 * @param {object} ast the ast node
 * @param {object} content the parser for the content of the paragraph
 * @returns {object} the parser
 */
function strongParser(ast,content) {
    return content.wrap(P.string('**'), P.string('**'));
}

/**
 * Creates a parser for a document
 * @param {object} ast the ast node
 * @param {object} content the parser for the content of the document
 * @returns {object} the parser
 */
function documentParser(ast,content) {
    return content.map(function(x) {
        return x[0];
    });
}

/**
 * Creates a parser for a paragraph
 * @param {object} ast the ast node
 * @param {object} content the parser for the content of the paragraph
 * @returns {object} the parser
 */
function paragraphParser(ast,content) {
    return P.seq(P.optWhitespace,content).map(function (x) { return flatten(x[1]); });
}

/**
 * Creates a parser for a heading
 * @param {object} ast the ast node
 * @param {object} content the parser for the content of the paragraph
 * @returns {object} the parser
 */
function headingParser(ast,content) {
    const level = parseInt(ast.level);
    if (level === 1) {
        return P.seq(P.optWhitespace,content.skip(P.string('\n====')));
    } else if (level === 2) {
        return P.seq(P.optWhitespace,content.skip(P.string('\n----')));
    } else {
        return P.seq(P.optWhitespace,P.string('#'.repeat(level)+' '),content).map(function(x) {return x[2];});
    }
}

/**
 * Creates a parser for a list
 * @param {object} listNode the list ast node
 * @param {object} bullet the parser for the bullet
 * @param {object} items the list of parsers for each item
 * @returns {object} the parser
 */
function listParser(listNode,bullet,items) {
    let first = true;
    const bulletedItems = items.map(function(item) {
        const bulletParser = first ? P.seq(P.optWhitespace,bullet) : P.seq(P.optWhitespace,P.string('\n'),bullet);
        return (r) => P.seq(bulletParser,item(r)).map(function(x) {
            return flatten(x[1]);
        });
    });
    return (r) => P.seq(P.optWhitespace,seqFunParser(bulletedItems)(r)).map(function(x) {
        return flatten(x[1]);
    });
}

/**
 * Creates a parser for an unordered list
 * @param {object} listNode the list ast node
 * @param {object} items the list of parsers for each item
 * @returns {object} the parser
 */
function ulistParser(listNode,items) {
    return listParser(listNode,P.string('\n-  '),items);
}

/**
 * Creates a parser for an ordered list
 * @param {object} listNode the list ast node
 * @param {object} items the list of parsers for each item
 * @returns {object} the parser
 */
function olistParser(listNode,items) {
    return listParser(listNode,P.seq(P.regexp(/[0-9]+/),P.string('. ')),items);
}

/**
 * Creates a parser for code Block content
 * @param {object} text the code text
 * @returns {object} the parser
 */
function codeBlockParser(text) {
    const blockBefore = (() => P.seq(P.optWhitespace,P.string('```\n')));
    const blockAfter = (() => P.string('\n```'));
    return P.string(CommonMarkUtils.escapeCodeBlock(text).trim()).wrap(blockBefore(),blockAfter());
}

module.exports.mkVariable = mkVariable;
module.exports.mkCompoundVariable = mkCompoundVariable;
module.exports.stringLiteralParser = stringLiteralParser;

module.exports.textParser = textParser;
module.exports.seqParser = seqParser;
module.exports.seqFunParser = seqFunParser;
module.exports.choiceStringsParser = choiceStringsParser;

module.exports.computedParser = computedParser;
module.exports.enumParser = enumParser;
module.exports.conditionalParser = conditionalParser;
module.exports.optionalParser = optionalParser;
module.exports.ulistBlockParser = ulistBlockParser;
module.exports.olistBlockParser = olistBlockParser;
module.exports.joinBlockParser = joinBlockParser;
module.exports.withParser = withParser;
module.exports.clauseParser = clauseParser;
module.exports.wrappedClauseParser = wrappedClauseParser;
module.exports.contractParser = contractParser;

module.exports.emphParser = emphParser;
module.exports.strongParser = strongParser;
module.exports.documentParser = documentParser;
module.exports.paragraphParser = paragraphParser;
module.exports.headingParser = headingParser;
module.exports.ulistParser = ulistParser;
module.exports.olistParser = olistParser;
module.exports.codeBlockParser = codeBlockParser;
