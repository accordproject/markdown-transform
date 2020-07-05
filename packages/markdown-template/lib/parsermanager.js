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
const draftVisitNodes = require('./ToCiceroMarkVisitor').visitNodes;
const ToParserVisitor = require('./ToParserVisitor');

/**
 * Hooks
 */

const defaultFormulaEval = (code) => {
    return (data) => {
        const variables = Object.keys(data).filter((x) => !((x === '$class' || x === 'clauseId' || x === 'contractId')));
        return ` eval(${code})(${variables}) `
    };
};

/**
 * Generates and manages a template parser/drafter
 * @class
 */
class ParserManager {
    /**
     * Create the ParserManager.
     * @param {object} template - the template instance
     * @param {object} parsingTable - parsing table extension
     * @param {*} formulaEval - function from formula code to JavaScript evaluation function
     */
    constructor(modelManager,parsingTable,formulaEval) {
        this.modelManager = modelManager;
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.template = null
        this.templateMark = null;
        this.parser = null;

        // Mapping from types to parsers/drafters
        this.parserVisitor = new ToParserVisitor();
        const parserHook = function(ast,parameters) {
            return ToParserVisitor.toParserWithParameters(new ToParserVisitor(),ast,parameters);
        };
        this.parsingTable = new ParsingTable(this.modelManager,parserHook,draftVisitNodes);
        this.parsingTable.addParsingTable(parsingTable);
        this.formulaEval = formulaEval ? formulaEval : defaultFormulaEval;
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
     * Gets the template text
     * @return {string} the template
     */
    getTemplate() {
        return this.template;
    }

    /**
     * Sets the template
     * @param {string} the template text
     */
    setTemplate(template) {
        this.template = template;
    }

    /**
     * Gets the TemplateMark AST
     * @return {object} the TemplateMark AST
     */
    getTemplateMark() {
        if (!this.templateMark) {
            throw new Error('Must call buildParser before calling getTemplateMark');
        }
        return this.templateMark;
    }

    /**
     * Sets the TemplateMark AST
     * @param {object} the TemplateMark AST
     */
    setTemplateMark(templateMark) {
        this.templateMark = templateMark;
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
            this.parser = this.parserVisitor.toParser(this.templateMark,this.parsingTable);
        }
    }

    /**
     * Get the execute function for a given formula
     * @param {string} code - the code for that formula
     * @return {string} a function taking the contract data and returning the corresponding formula result
     */
    getFormulaEval(code) {
        return this.formulaEval(code);
    }
}

module.exports = ParserManager;
