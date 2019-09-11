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

const ModelManager = require('composer-concerto').ModelManager;
const Factory = require('composer-concerto').Factory;
const Serializer = require('composer-concerto').Serializer;

const CommonMark = require('./CommonMark');
const ToCiceroVisitor = require('./ToCiceroVisitor');
const FromCiceroVisitor = require('./FromCiceroVisitor');
const { commonmarkModel, ciceromarkModel } = require('./Models');

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CiceroMark {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options;

        // Setup for Nested Parsing
        this.commonMark = new CommonMark();

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
    fromCommonMark(concertoObject) {
        // Add Cicero nodes
        const parameters = {
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
     * @param {*} concertoObject concerto cicero object
     * @returns {*} concertoObject concerto commonmark
     */
    toCommonMark(concertoObject) {
        // Add Cicero nodes
        const parameters = {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        };
        const visitor = new FromCiceroVisitor();
        concertoObject.accept( visitor, parameters );

        // Validate
        const json = this.serializer.toJSON(concertoObject);
        return this.serializer.fromJSON(json);
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

}

module.exports = CiceroMark;