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

// Basic parser constructors
const textParser = require('./coreparsers').textParser;
const computedParser = require('./coreparsers').computedParser;
const enumParser = require('./coreparsers').enumParser;
const seqParser = require('./coreparsers').seqParser;
const condParser = require('./coreparsers').condParser;
const ulistBlockParser = require('./coreparsers').ulistBlockParser;
const olistBlockParser = require('./coreparsers').olistBlockParser;
const withParser = require('./coreparsers').withParser;
const clauseParser = require('./coreparsers').clauseParser;
const wrappedClauseParser = require('./coreparsers').wrappedClauseParser;
const contractParser = require('./coreparsers').contractParser;

const emphParser = require('./coreparsers').emphParser;
const strongParser = require('./coreparsers').strongParser;
const documentParser = require('./coreparsers').documentParser;
const paragraphParser = require('./coreparsers').paragraphParser;
const headingParser = require('./coreparsers').headingParser;
const ulistParser = require('./coreparsers').ulistParser;
const olistParser = require('./coreparsers').olistParser;
const codeBlockParser = require('./coreparsers').codeBlockParser;

/**
 * Creates a parser function from a TemplateMark DOM
 * @param {object} ast - the template AST
 * @returns {object} the parser
 */
function parserFunOfTemplateMark(ast,params) {
    let parser = null;
    switch(ast.$class) {
    case 'org.accordproject.templatemark.EnumVariableDefinition' : {
        parser = enumParser(ast,ast.enumValues);
        break;
    }
    case 'org.accordproject.templatemark.FormattedVariableDefinition' :
    case 'org.accordproject.templatemark.VariableDefinition' : {
        const elementType = ast.identifiedBy ? 'Resource' : ast.elementType;
        const typeFun = params.parsingTable[elementType];
        if (typeFun) {
            parser = typeFun.parse(ast);
        } else {
            throw new Error('Unknown variable type ' + elementType);
        }
        break;
    }
    case 'org.accordproject.templatemark.FormulaDefinition' : {
        parser = computedParser(ast.value);
        break;
    }
    case 'org.accordproject.templatemark.ConditionalDefinition' : {
        const whenTrueParser = seqParser(ast.whenTrue.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        const whenFalseParser = seqParser(ast.whenFalse.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = condParser(ast,whenTrueParser,whenFalseParser);
        break;
    }
    case 'org.accordproject.templatemark.ListBlockDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = ast.type === 'bullet' ? ulistBlockParser(ast,childrenParser) : olistBlockParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.templatemark.ClauseDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        if (params.contract) {
            parser = wrappedClauseParser(ast,childrenParser);
        } else {
            parser = clauseParser(ast,childrenParser);
        }
        break;
    }
    case 'org.accordproject.templatemark.WithDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = withParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.templatemark.ContractDefinition' :
        params.contract = true;
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = contractParser(ast,childrenParser);
        break;
    case 'org.accordproject.commonmark.Text' : {
        parser = textParser(ast.text);
        break;
    }
    case 'org.accordproject.commonmark.Softbreak' : {
        parser = textParser('\n');
        break;
    }
    case 'org.accordproject.commonmark.Document' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = documentParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Paragraph' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = paragraphParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.CodeBlock' : {
        parser = codeBlockParser(ast.text);
        break;
    }
    case 'org.accordproject.commonmark.Emph' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = emphParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Strong' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = strongParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Heading' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = headingParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.List' : {
        const listKind = ast.type;
        // Carefully here, we do not build a sequence parser quite yet. Instead we keep a list or parsers, one for each item in the list
        const itemParsers = ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); });
        parser = ast.type === 'bullet' ? ulistParser(ast,itemParsers) : olistParser(ast,itemParsers);
        break;
    }
    case 'org.accordproject.commonmark.Item' : {
        // Parsing a list item is simply parsing its content
        parser = seqParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        break;
    }
    default:
        throw new Error('Unknown template ast $class ' + ast.$class);
    }
    return parser;
};

/**
 * Create a parser language from the template
 * Creates a parser function from a TemplateMark DOM
 * @param {object} ast - the template AST
 * @returns {object} the parser
 */
function parserOfTemplateMark(ast,params) {
    const templateParser = {};
    params.templateParser = templateParser;
    templateParser.main = () => parserFunOfTemplateMark(ast,params);
    return P.createLanguage(templateParser).main;
}

module.exports.parserFunOfTemplateMark = parserFunOfTemplateMark;
module.exports.parserOfTemplateMark = parserOfTemplateMark;
