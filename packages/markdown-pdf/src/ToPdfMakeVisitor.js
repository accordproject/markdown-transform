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

const { Decorators } = require('@accordproject/markdown-cicero');
const commonmarkrules = require('./commonmarkrules');

/**
 * Converts a CommonMark DOM to a PDF Make JSON.
 * http://pdfmake.org/playground.html
 */
class ToPdfMakeVisitor {
    /**
     * Construct the visitor
     * @param {object} rules how to process each node type
     */
    constructor() {
        this.rules = commonmarkrules;
    }

    /**
     * Returns the processed children
     * @param {*} visitor the visitor to use
     * @param {*} thing a concerto ast node
     * @param {*} parameters the parameters
     * @param {string} fieldName name of the field containing the children
     * @returns {*} an array of slate nodes
     */
    visitChildren(visitor, thing, parameters, fieldName = 'nodes') {
        const result = [];
        const nodes = thing[fieldName] ? thing[fieldName] : [];

        nodes.forEach(node => {
            // console.log(`Processing ${thing.getType()} > ${node.getType()}`);
            const newParameters = {
                strong: parameters.strong,
                emph: parameters.emph,
                strikethrough: parameters.strikethrough,
                code: parameters.code
            };
            node.accept(visitor, newParameters);
            if (Array.isArray(newParameters.result)) {
                Array.prototype.push.apply(result, newParameters.result);
            } else {
                result.push(newParameters.result);
            }
        });

        return result;
    }

    /**
     * Returns the processed child nodes
     * @param {*} thing a concerto ast node
     * @param {*} parameters the parameters
     * @returns {*} an array of slate nodes
     */
    visitChildNodes(thing, parameters) {
        return this.visitChildren(this, thing, parameters, 'nodes');
    }

    /**
     * Visit a concerto ast node and return the corresponding slate node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        // the style defaults to the name of the type
        let decoratorStyle = null;

        // if the type has an explicit Pdf style decorator, then we use it
        try {
            const decorators = new Decorators(thing);
            decoratorStyle = decorators.getDecoratorValue('Pdf', 'style');
        }
        catch(error) {
            console.log(error);
        }
        parameters.result = {
            style : decoratorStyle ? decoratorStyle : thing.getType()
        };

        // XXX recurse first
        const children = this.visitChildNodes(thing,parameters);
        const rule = this.rules[thing.getType()];
        if (rule) {
            rule(this, thing, children, parameters);
        } else {
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
    }
}

module.exports = ToPdfMakeVisitor;