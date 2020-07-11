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

const CommonMarkUtils = require('./CommonMarkUtils');
const FromCommonMarkVisitor = require('./FromCommonMarkVisitor');
const fromcommonmarkrules = require('./fromcommonmarkrules');

/**
 * Converts a CommonMark DOM to a markdown string.
 *
 * Note that there are multiple ways of representing the same CommonMark DOM as text,
 * so this transformation is not guaranteed to equivalent if you roundtrip
 * markdown content. For example an H1 can be specified using either '#' or '='
 * notation.
 *
 * The resulting AST *should* be equivalent however.
 */
class ToMarkdownVisitor extends FromCommonMarkVisitor {
    /**
     * Construct the visitor.
     */
    constructor() {
        const resultString = (result) => {
            return result;
        };
        const resultSeq = (parameters,result) => {
            result.forEach((next) => {
                parameters.result += next;
            });
        };
        const setFirst = (thingType) => {
            return thingType === 'Item' ? true : false;
        };
        const rules = fromcommonmarkrules;
        super({},resultString,resultSeq,rules,setFirst);
    }

    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (as a Concerto object)
     * @returns {string} the markdown string
     */
    toMarkdown(input) {
        const parameters = {};
        parameters.result = this.resultString('');
        parameters.stack = CommonMarkUtils.blocksInit();
        input.accept(this, parameters);
        return parameters.result.trim();
    }
}

module.exports = ToMarkdownVisitor;