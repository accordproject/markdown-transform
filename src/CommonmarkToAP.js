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

const ToAPVisitor = require('./ToAPVisitor');
const { commonmarkModel } = require('./Models');

/**
 * Converts a commonmark document to a markdown string
 * @param {*} concertoObject concerto commonmark object
 * @returns {*} concertoObject concerto commonmark for AP object
 */
function commonMarkToAP(concertoObject) {
    // Setup for validation
    const modelManager = new ModelManager();
    modelManager.addModelFile( commonmarkModel, 'commonmark.cto');
    const factory = new Factory(modelManager);
    const serializer = new Serializer(factory, modelManager);

    // Add AP nodes
    const parameters = {
        modelManager : modelManager ,
        factory : factory,
        serializer : serializer
    };
    const visitor = new ToAPVisitor();
    concertoObject.accept( visitor, parameters );

    // Validate
    const json = serializer.toJSON(concertoObject);
    return serializer.fromJSON(json);
}

module.exports = commonMarkToAP;