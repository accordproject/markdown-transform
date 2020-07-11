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
     * @param {*} setFirst whether entering this block should set first
     */
    constructor(options,resultString,resultSeq,rules,setFirst) {
        this.options = options;
        this.resultString = resultString;
        this.resultSeq = resultSeq;
        this.rules = rules;
        this.setFirst = setFirst;
    }

    /**
     * Visits a sub-tree
     * @param {*} visitor - the visitor to use
     * @param {*} thing - the node to visit
     * @param {*} parameters - the current parameters
     * @param {string} field - where to find the children nodes
     * @returns {*} the result for the sub tree
     */
    visitChildren(visitor, thing, parameters, field = 'nodes') {
        const parametersIn = CommonMarkUtils.mkParameters(thing, parameters, this.resultString(''), this.setFirst);
        if(thing[field]) {
            thing[field].forEach(node => {
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
        const children = this.visitChildren(this, thing, parameters);
        const rule = this.rules[thing.getType()];
        if (rule) {
            // Passing 'this' so that rules can call the visitor if need be (not used for commonmark)
            rule(this,thing,children,parameters,this.resultString,this.resultSeq);
        } else {
            throw new Error(`No rule to handle type ${thing.getType()}`);
        }
    }
}

module.exports = FromCommonMarkVisitor;