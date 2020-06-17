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

const { Factory, Serializer } = require('@accordproject/concerto-core');

const ParsingTable = require('./parsingtable');
const parserOfTemplateMark = require('./ParserOfTemplate').parserOfTemplateMark;
const parserFunOfTemplateMark = require('./ParserOfTemplate').parserFunOfTemplateMark;
const draftVisitNodes = require('./ToCiceroMarkVisitor').visitNodes;

/**
 * Hooks
 */


/**
 * Generates and manages a template parser/drafter
 * @class
 */
class ParserManager {
    /**
     * Create the ParserManager.
     * @param {object} template - the template instance
     */
    constructor(modelManager,parsingTable) {
        this.modelManager = modelManager;
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.grammar = null
        this.grammarAst = null;
        this.parser = null;

        // Mapping from types to parsers/drafters
        this.parsingTable = new ParsingTable(this.modelManager,parserFunOfTemplateMark,draftVisitNodes);
        this.parsingTable.addParsingTable(parsingTable);
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
            this.parser = parserOfTemplateMark(this.grammarAst,{parsingTable:this.parsingTable,contract:false});
        }
    }

}

module.exports = ParserManager;
