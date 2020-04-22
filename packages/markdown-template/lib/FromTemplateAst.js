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
const doubleParser = require('./coreparsers').doubleParser;
const textParser = require('./coreparsers').textParser;
const stringParser = require('./coreparsers').stringParser;
const enumParser = require('./coreparsers').enumParser;
const seqParser = require('./coreparsers').seqParser;
const condParser = require('./coreparsers').condParser;
const clauseContentParser = require('./coreparsers').clauseContentParser;
const clauseParser = require('./coreparsers').clauseParser;

const { NS_PREFIX_CiceroMarkTemplateModel, CiceroMarkTemplateModel } = require('./externalModels/CiceroMarkTemplateModel.js');

/**
 * Creates a parser for Double
 * @param {object} ast - the template AST
 * @returns {object} the parser
 */
function parserOfTemplateAst(ast) {
    let parser = null;
    switch(ast.kind) {
    case 'text' :
        parser = textParser(ast.value);
        break;
    case 'clause' :
        parser = clauseParser(ast,parserOfTemplateAst(ast.value));
        break;
    case 'clauseContent' :
        parser = clauseContentParser(ast,parserOfTemplateAst(ast.value));
        break;
    case 'variable' : {
        switch(ast.type) {
        case 'String' :
            parser = stringParser(ast);
            break;
        case 'Double' :
            parser = doubleParser(ast);
            break;
        case 'Enum' :
            parser = enumParser(ast,ast.value);
            break;
        default:
            throw new Error('Unknown variable type ' + ast.type);
        }
        break;
    }
    case 'block' : {
        switch(ast.type) {
        case 'conditional' :
            parser = condParser(ast.whenTrue,ast.whenFalse);
            break;
        default:
            throw new Error('Unknown block type ' + ast.type);
        }
        break;
    }
    case 'sequence' :
        parser = seqParser(ast.value.map(function (x) { return parserOfTemplateAst(x); }));
        break;
    default:
        throw new Error('Unknown template ast kind ' + ast.kind);
    }
    return parser;
};

module.exports.parserOfTemplateAst = parserOfTemplateAst;
