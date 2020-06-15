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
const seqFunParser = require('./coreparsers').seqFunParser;
const condParser = require('./coreparsers').condParser;
const ulistBlockParser = require('./coreparsers').ulistBlockParser;
const olistBlockParser = require('./coreparsers').olistBlockParser;
const withParser = require('./coreparsers').withParser;
const clauseParser = require('./coreparsers').clauseParser;
const wrappedClauseParser = require('./coreparsers').wrappedClauseParser;
const contractParser = require('./coreparsers').contractParser;
const mkVariable = require('./coreparsers').mkVariable;

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
        parser = (r) => enumParser(ast.enumValues).map((value) => mkVariable(ast,value));;
        break;
    }
    case 'org.accordproject.templatemark.FormattedVariableDefinition' :
    case 'org.accordproject.templatemark.VariableDefinition' : {
        const elementType = ast.identifiedBy ? 'Resource' : ast.elementType;
        const format = ast.format ? ast.format : null;
        const parserName = format ? elementType + '_' + format : elementType;
        if (params.templateParser[parserName]) {
            parser = (r) => {
                return r[parserName].map((value) => mkVariable(ast,value));
            };
        } else {
            const parsingFun = params.parsingTable.getParser(elementType);
            params.templateParser[parserName] = (r) => parsingFun(format);
            parser = (r) => {
                return r[parserName].map((value) => mkVariable(ast,value));
            };
        }
        break;
    }
    case 'org.accordproject.templatemark.FormulaDefinition' : {
        parser = (r) => computedParser(ast.value);
        break;
    }
    case 'org.accordproject.templatemark.ConditionalDefinition' : {
        const whenTrueParser = seqFunParser(ast.whenTrue.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        const whenFalseParser = seqFunParser(ast.whenFalse.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => condParser(ast,whenTrueParser(r),whenFalseParser(r));
        break;
    }
    case 'org.accordproject.templatemark.ListBlockDefinition' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = ast.type === 'bullet' ? (r) => ulistBlockParser(ast,childrenParser(r)) : (r) => olistBlockParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.templatemark.ClauseDefinition' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        if (params.contract) {
            parser = (r) => wrappedClauseParser(ast,childrenParser(r));
        } else {
            parser = (r) => clauseParser(ast,childrenParser(r));
        }
        break;
    }
    case 'org.accordproject.templatemark.WithDefinition' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => withParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.templatemark.ContractDefinition' :
        params.contract = true;
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => contractParser(ast,childrenParser(r));
        break;
    case 'org.accordproject.commonmark.Text' : {
        parser = (r) => textParser(ast.text);
        break;
    }
    case 'org.accordproject.commonmark.Softbreak' : {
        parser = (r) => textParser('\n');
        break;
    }
    case 'org.accordproject.commonmark.Document' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => documentParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.commonmark.Paragraph' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => paragraphParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.commonmark.CodeBlock' : {
        parser = (r) => codeBlockParser(ast.text);
        break;
    }
    case 'org.accordproject.commonmark.Emph' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => emphParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.commonmark.Strong' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => strongParser(ast,childrenParser(r));
        break;
    }
    case 'org.accordproject.commonmark.Heading' : {
        const childrenParser = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => headingParser(ast,childrenParser(r));
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
        const itemParsers = seqFunParser(ast.nodes.map(function (x) { return parserFunOfTemplateMark(x,params); }));
        parser = (r) => itemParsers(r);
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
    // Start with an empty parser
    const templateParser = {};

    // Build the language structure for the template
    params.templateParser = templateParser;
    templateParser.main = parserFunOfTemplateMark(ast,params);

    // Create the template parser from the language structure
    return P.createLanguage(templateParser).main;
}

module.exports = parserOfTemplateMark;
