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

const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;
const FromCommonMarkVisitor = require('@accordproject/markdown-common').FromCommonMarkVisitor;
const fromcommonmarkrules = require('@accordproject/markdown-common').fromcommonmarkrules;
const fromciceromarkrules = require('./fromciceromarkrules');

/**
 * Converts a CiceroMark DOM to a cicero markdown string.
 */
class ToMarkdownCiceroVisitor extends FromCommonMarkVisitor {
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     */
    constructor(options) {
        const resultString = (result) => {
            return result;
        };
        const resultSeq = (parameters,result) => {
            result.forEach((next) => {
                parameters.result += next;
            });
        };
        const setFirst = (thingType) => {
            return thingType === 'Item' || thingType === 'Clause' ? true : false;
        };
        const rules = fromcommonmarkrules;
        Object.assign(rules,fromciceromarkrules);
        super(options,resultString,resultSeq,rules,setFirst);
    }

    /**
     * Converts a CiceroMark DOM to a cicero markdown string.
     * @param {*} input - CiceroMark DOM (JSON)
     * @returns {string} the cicero markdown string
     */
    toMarkdownCicero(input) {
        const parameters = {};
        parameters.result = this.resultString('');
        parameters.stack = CommonMarkUtils.blocksInit();
        input.accept(this, parameters);
        return parameters.result.trim();
    }
}

module.exports = ToMarkdownCiceroVisitor;