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

const Value = require('slate').Value;
const ToSlateVisitor = require('./ToSlateVisitor');
const slateToCommonMarkAst = require('./slateToCommonMarkAst');

const { ModelManager, Factory, Serializer } = require('@accordproject/markdown-common').ComposerConcerto;
const { commonmarkModel } = require('@accordproject/markdown-common').Models; // This should be switched to CiceroMark

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class SlateMark {
    /**
     * Construct the Slate transformer.
     */
    constructor() {
        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(commonmarkModel, 'commonmark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }

    /**
     * Converts a commonmark ast to a Slate DOM
     * @param {*} concertoObject concerto commonmark object
     * @returns {*} the slate dom
     */
    fromCommonMarkConcerto(concertoObject) {
        const parameters = {};
        parameters.result = {};
        parameters.marks = [];
        const visitor = new ToSlateVisitor();
        concertoObject.accept( visitor, parameters );
        return parameters.result;
    }

    /**
     * Converts a Slate document node to CommonMark AST
     * @param {*} document the Slate document node
     * @returns {*} the common mark AST
     */
    toCommonMarkConcerto(document) {
        const json = this.toCommonMark(document);
        return this.serializer.fromJSON(json);
    }

    /**
     * Converts a commonmark ast to a Slate DOM
     * @param {*} json commonmark object
     * @returns {*} the slate dom
     */
    fromCommonMark(json) {
        const concertoObject = this.serializer.fromJSON(json);
        return this.fromCommonMarkConcerto(concertoObject);
    }

    /**
     * Converts a Slate document node to CommonMark AST
     * @param {*} json - JSON commonmark object
     * @returns {*} the common mark AST
     */
    toCommonMark(json) {
        const value = Value.fromJSON(json);
        return this.serializer.toJSON(slateToCommonMarkAst(value.document));
    }
}

module.exports = SlateMark;