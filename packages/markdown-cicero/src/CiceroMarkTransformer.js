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

const { ModelManager, Factory, Serializer } = require('@accordproject/markdown-common').ComposerConcerto;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { commonmarkModel } = require('@accordproject/markdown-common').Models;

const ToCiceroVisitor = require('./ToCiceroVisitor');
const FromCiceroVisitor = require('./FromCiceroVisitor');
const { ciceromarkModel } = require('./Models');

/**
 * Converts a CiceroMark DOM to and from a
 * CommonMark DOM. Converts a CiceroMark DOM
 * to a markdown string.
 */
class CiceroMarkTransformer {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options;

        // Setup for Nested Parsing
        this.commonMark = new CommonMarkTransformer({ tagInfo: true });

        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(commonmarkModel, 'commonmark.cto');
        this.modelManager.addModelFile(ciceromarkModel, 'ciceromark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }

    /**
     * Converts a commonmark document to a ciceromark document
     * @param {*} concertoObject concerto commonmark object
     * @returns {*} concertoObject concerto ciceromark object
     */
    fromCommonMarkConcerto(concertoObject) {
        // Add Cicero nodes
        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer,
        };
        const visitor = new ToCiceroVisitor();
        concertoObject.accept( visitor, parameters );

        // Validate
        const json = this.serializer.toJSON(concertoObject);
        return this.serializer.fromJSON(json);
    }

    /**
     * Converts a ciceromark document back to a regular commmark document
     * @param {*} concertoObject concerto ciceromark object
     * @param {object} [options] configuration options
     * @returns {*} concerto commonmark object
     */
    toCommonMarkConcerto(concertoObject, options) {
        // Add Cicero nodes
        const parameters = {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        };
        const visitor = new FromCiceroVisitor(options);
        concertoObject.accept( visitor, parameters );

        // Validate
        const json = this.serializer.toJSON(concertoObject);
        return this.serializer.fromJSON(json);
    }

    /**
     * Converts a ciceromark document back to markdown string
     * @param {*} concertoObject concerto cicero object
     * @param {object} [options] configuration options
     * @returns {*} concertoObject concerto commonmark
     */
    toMarkdownStringConcerto(concertoObject, options) {
        return this.commonMark.toMarkdownStringConcerto(this.toCommonMarkConcerto(concertoObject, options));
    }

    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer() {
        return this.serializer;
    }

    /**
     * Converts a commonmark DOM to a ciceromark DOM
     * @param {*} json commonmark object
     * @returns {*} json ciceromark object
     */
    fromCommonMark(json) {
        // Add Cicero nodes
        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer,
        };
        const visitor = new ToCiceroVisitor();
        const concertoObject = this.serializer.fromJSON(json);
        concertoObject.accept( visitor, parameters );

        // Validate
        return this.serializer.toJSON(concertoObject);
    }

    /**
     * Converts a ciceromark DOM back to a commmark DOM
     * @param {*} json ciceromark object
     * @param {object} [options] configuration options
     * @returns {*} json commonmark object
     */
    toCommonMark(json, options) {
        // Add Cicero nodes
        const parameters = {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        };
        const visitor = new FromCiceroVisitor(options);
        const concertoObject = this.serializer.fromJSON(json);
        concertoObject.accept( visitor, parameters );

        // Validate
        return this.serializer.toJSON(concertoObject);
    }

    /**
     * Converts a CiceroMark document to a markdown string
     * @param {*} json - JSON commonmark object
     * @param {*} options - options (e.g., wrapVariables)
     * @returns {string} the markdown string
     */
    toMarkdownString(json, options) {
        return this.toMarkdownStringConcerto(this.serializer.fromJSON(json), options);
    }

}

module.exports = CiceroMarkTransformer;