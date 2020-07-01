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

/**
 * Converts a CommonMark DOM to something else
 */
class FromCommonMarkVisitor {
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     * @param {*} resultString how to create a result from a string
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     */
    constructor(options,resultString,resultSeq,rules) {
        this.options = options;
        this.resultString = resultString;
        this.resultSeq = resultSeq;
        this.rules = rules;
    }

    /**
     * Visits a sub-tree and return the markdown
     * @param {*} visitor - the visitor to use
     * @param {*} thing - the node to visit
     * @param {*} parameters - the current parameters
     * @returns {string} the markdown for the sub tree
     */
    static visitChildren(visitor, thing, parameters) {
        const parametersIn = CommonMarkUtils.mkParameters(thing, parameters);
        if(thing.nodes) {
            thing.nodes.forEach(node => {
                node.accept(visitor, parametersIn);
                CommonMarkUtils.nextNode(parametersIn);
            });
        }
        return parametersIn.result;
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        const children = FromCommonMarkVisitor.visitChildren(this, thing, parameters);
        if (this.rules[thing.getType()]) {
            this.rules[thing.getType()](thing,children,parameters,this.resultString,this.resultSeq);
        } else {
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
    }
}

module.exports = FromCommonMarkVisitor;