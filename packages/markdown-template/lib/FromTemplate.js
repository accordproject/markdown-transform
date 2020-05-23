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

// Basic parser constructors
const textParser = require('./coreparsers').textParser;
const computedParser = require('./coreparsers').computedParser;
const doubleParser = require('./coreparsers').doubleParser;
const integerParser = require('./coreparsers').integerParser;
const stringParser = require('./coreparsers').stringParser;
const dateTimeParser = require('./dateTimeParser').dateTimeParser;
const enumParser = require('./coreparsers').enumParser;
const seqParser = require('./coreparsers').seqParser;
const condParser = require('./coreparsers').condParser;
const ulistParser = require('./coreparsers').ulistParser;
const olistParser = require('./coreparsers').olistParser;
const withParser = require('./coreparsers').withParser;
const clauseParser = require('./coreparsers').clauseParser;
const wrappedClauseParser = require('./coreparsers').wrappedClauseParser;
const contractParser = require('./coreparsers').contractParser;

const emphParser = require('./coreparsers').emphParser;
const strongParser = require('./coreparsers').strongParser;
const documentParser = require('./coreparsers').documentParser;
const paragraphParser = require('./coreparsers').paragraphParser;
const headingParser = require('./coreparsers').headingParser;
const codeBlockParser = require('./coreparsers').codeBlockParser;

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const parsingTable = {
    'Integer' : integerParser,
    'Double' : doubleParser,
    'String' : stringParser,
    'DateTime' : dateTimeParser,
};

/**
 * Creates a parser for Double
 * @param {object} ast - the template AST
 * @returns {object} the parser
 */
function parserOfTemplate(ast,params) {
    let parser = null;
    switch(ast.$class) {
    case 'org.accordproject.templatemark.raw.TextChunk' : {
        parser = textParser(ast.value);
        break;
    }
    case 'org.accordproject.templatemark.EnumVariableDefinition' : {
        parser = enumParser(ast,ast.enumValues);
        break;
    }
    case 'org.accordproject.templatemark.FormattedVariableDefinition' :
    case 'org.accordproject.templatemark.VariableDefinition' : {
        const parserFun = parsingTable[ast.elementType];
        if (parserFun) {
            parser = parserFun(ast);
        } else {
            throw new Error('Unknown variable type ' + ast.elementType);
        }
        break;
    }
    case 'org.accordproject.templatemark.FormulaDefinition' : {
        parser = computedParser(ast.value);
        break;
    }
    case 'org.accordproject.templatemark.ConditionalDefinition' : {
        parser = condParser(ast);
        break;
    }
    case 'org.accordproject.templatemark.ListBlockDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = ast.type === 'bullet' ? ulistParser(ast,childrenParser) : olistParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.templatemark.ClauseDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        if (params.contract) {
            parser = wrappedClauseParser(ast,childrenParser);
        } else {
            parser = clauseParser(ast,childrenParser);
        }
        break;
    }
    case 'org.accordproject.templatemark.WithDefinition' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = withParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.templatemark.ContractDefinition' :
        params.contract = true;
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
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
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = documentParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Paragraph' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = paragraphParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.CodeBlock' : {
        parser = codeBlockParser(ast.text);
        break;
    }
    case 'org.accordproject.commonmark.Emph' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = emphParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Strong' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = strongParser(ast,childrenParser);
        break;
    }
    case 'org.accordproject.commonmark.Heading' : {
        const childrenParser = seqParser(ast.nodes.map(function (x) { return parserOfTemplate(x,params); }));
        parser = headingParser(ast,childrenParser);
        break;
    }
    default:
        throw new Error('Unknown template ast $class ' + ast.$class);
    }
    return parser;
};

module.exports.parserOfTemplate = parserOfTemplate;
