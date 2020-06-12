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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const parserOfTemplate = require('./FromTemplate').parserOfTemplate;

const doubleParser = require('./doubleParser').doubleParser;
const integerParser = require('./coreparsers').integerParser;
const stringParser = require('./coreparsers').stringParser;
const dateTimeParser = require('./dateTimeParser').dateTimeParser;

const doubleDrafter = require('./doubleDrafter').doubleDrafter;
const integerDrafter = require('./coredrafters').integerDrafter;
const stringDrafter = require('./coredrafters').stringDrafter;
const dateTimeDrafter = require('./dateTimeDrafter').dateTimeDrafter;

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const parsingTable = {
    'Integer' : { parse: integerParser, draft: integerDrafter },
    'Long' : { parse: integerParser, draft: integerDrafter },
    'Double' : { parse: doubleParser, draft: doubleDrafter },
    'String' : { parse: stringParser, draft: stringDrafter },
    'DateTime' : { parse: dateTimeParser, draft: dateTimeDrafter },
};

/**
 * Generates and manages a template parser/drafter
 * @class
 */
class ParserManager {
    /**
     * Create the ParserManager.
     * @param {object} template - the template instance
     */
    constructor(modelManager) {
        this.modelManager = modelManager;
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.grammar = null
        this.grammarAst = null;
        this.parser = null;

        // Mapping from types to parsers/drafters
        this.parsingTable = parsingTable;
    }

    /**
     * Gets the model manager for this parser
     * @return {object} the model manager
     */
    getModelManager() {
        return this.modelManager;
    }

    /**
     * Gets the factory for this parser
     * @return {object} the factory
     */
    getFactory() {
        return this.factory;
    }

    /**
     * Gets the serializer for this parser
     * @return {object} the serializer
     */
    getSerializer() {
        return this.serializer;
    }

    /**
     * Gets the template grammar
     * @return {string} the template grammar
     */
    getGrammar() {
        return this.grammar;
    }

    /**
     * Sets the template grammar
     * @param {string} the template grammar
     */
    setGrammar(grammar) {
        this.grammar = grammar;
    }

    /**
     * Gets the TemplateMark AST for the template grammar
     * @return {object} the AST for the template grammar
     */
    getGrammarAst() {
        if (!this.grammarAst) {
            throw new Error('Must call buildParser before calling getGrammarAst');
        }
        return this.grammarAst;
    }

    /**
     * Sets the TemplateMark AST for the template grammar
     * @param {object} the AST for the template grammar
     */
    setGrammarAst(grammarAst) {
        this.grammarAst = grammarAst;
    }

    /**
     * Gets a parser object for this template
     * @return {object} the parser for this template
     */
    getParser() {
        if (!this.parser) {
            throw new Error('Must call buildParser before calling getParser');
        }
        return this.parser;
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
     * Build the parser
     */
    buildParser() {
        if (!this.parser) {
            this.parser = parserOfTemplate(this.grammarAst,{parsingTable:this.parsingTable,contract:false});
        }
    }

}

module.exports.parsingTable = parsingTable;
module.exports.ParserManager = ParserManager;
