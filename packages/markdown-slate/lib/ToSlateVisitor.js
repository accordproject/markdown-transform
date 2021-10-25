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

const { cleanup, applyStyle } = require('./toslateutil');
const commonmarktoslaterules = require('./commonmarktoslaterules');

/**
 * Converts a Markdown DOM to a Slate DOM
 */
class ToSlateVisitor {
    /**
     * Constructor for a new visitor to slate
     * @param {*} rules - additional rules
     */
    constructor(rules) {
        this.rules = commonmarktoslaterules;
        if (rules) {
            this.rules = Object.assign(this.rules,rules);
        }
    }

    /**
     * Returns the processed children
     * @param {*} thing a concerto ast node
     * @param {string} fieldName name of the field containing the children
     * @param {*} parameters the parameters
     * @returns {*} an array of slate nodes
     */
    processChildren(thing,fieldName,parameters) {
        const result = [];
        const nodes = thing[fieldName] ? thing[fieldName] : [];

        nodes.forEach(node => {
            //console.log(`Processing ${thing.getType()} > ${node.getType()}`);
            const newParameters = {
                serializer: parameters.serializer,
                strong: parameters.strong,
                emph: parameters.emph,
                strikethrough: parameters.strikethrough,
                underline: parameters.underline,
            };
            node.accept(this, newParameters);
            if (Array.isArray(newParameters.result)) {
                Array.prototype.push.apply(result,newParameters.result);
            } else {
                result.push(newParameters.result);
            }
        });

        return result;
    }

    /**
     * Visit a concerto ast node and return the corresponding slate node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        let result = null;

        const processChildren = (thing,fieldName,parameters) => {
            return this.processChildren(thing,fieldName,parameters);
        };

        const rule = this.rules[thing.getType()];
        if (!rule) {
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        result = rule(thing,processChildren,parameters);
        // Add style information
        applyStyle(thing, result);

        const cleanResult = cleanup(result);
        parameters.result = cleanResult;
    }
}

module.exports = ToSlateVisitor;