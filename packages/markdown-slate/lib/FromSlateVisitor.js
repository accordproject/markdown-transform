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

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

const { removeEmptyParagraphs, handleText, applyStyle }  = require('./fromslateutil');
const commonmarkfromslaterules = require('./commonmarkfromslaterules');

/**
 * Converts a Slate DOM to a Markdown DOM
 */
class FromSlateVisitor {
    /**
     * Constructor for a new visitor from slate
     * @param {*} rules - additional rules
     */
    constructor(rules) {
        this.rules = commonmarkfromslaterules;
        if (rules) {
            this.rules = Object.assign(this.rules,rules);
        }
    }

    /**
     * Converts a set of Slate child node to Markdown DOM (as JSON)
     * @param {*} value the Slate value
     * @returns {*} the Markdown DOM
     */
    fromSlate(value) {
        const result = {
            $class : `${NS_PREFIX_CommonMarkModel}Document`,
            xmlns : 'http://commonmark.org/xml/1.0',
            nodes : []
        };
        // convert the value to a plain object
        this.processChildren(result, value.document.children);
        return removeEmptyParagraphs(result);
    }

    /**
     * Converts an array of Slate nodes, pushing them into the parent
     * @param {*} parent the parent CiceroMark DOM node
     * @param {*} nodes an array of Slate nodes
     */
    processChildren(parent, nodes) {
        if(!parent.nodes) {
            throw new Error(`Parent node doesn't have children ${JSON.stringify(parent)}`);
        }
        this.processNodes(parent.nodes, nodes);
    }

    /**
     * Converts an array of Slate nodes, pushing them into the parent
     * @param {*} target the target nodes
     * @param {*} nodes an array of Slate nodes
     */
    processNodes(target, nodes) {
        nodes.forEach((node, index) => {
            let result = null;
            let handleChildren = !(node.type === 'variable'); // XXX Can't remember why

            if('text' in node && !node.type) {
                result = handleText(node);
            } else {
                const rule = this.rules[node.type];
                if (rule) {
                    result = rule(node,this.processNodes);
                }
                // Add style information
                applyStyle(node, result);
            }

            // process any children, attaching to first child if it exists (for list items)
            if(node.children && result && result.nodes && handleChildren) {
                this.processChildren(result.nodes[0] ? result.nodes[0] : result, node.children);
                if (result.nodes.length === 0) {
                    result.nodes.push({$class : `${NS_PREFIX_CommonMarkModel}Text`, text : ''});
                }
            }

            if(result) {
                target.push(result);
            }
        });
    }
}

module.exports = FromSlateVisitor;