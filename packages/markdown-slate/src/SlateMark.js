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

const ToSlateVisitor = require('./ToSlateVisitor');
const slateToCommonMarkAst = require('./slateToCommonMarkAst');

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class SlateMark {
    /**
     * Converts a commonmark ast to a Slate DOM
     * @param {*} concertoObject concerto commonmark object
     * @returns {*} the slate dom
     */
    fromCommonMark(concertoObject) {
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
    toCommonMark(document) {
        return slateToCommonMarkAst(document);
    }
}

module.exports = SlateMark;