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

const { TEXT_RULE, EMPHASIS_RULE, HEADING_RULE, VARIABLE_RULE, SOFTBREAK_RULE } = require('./rules');
const { wrapAroundDefaultDocxTags, getClass } = require('./helpers');

const definedNodes = {
    computedVariable: 'org.accordproject.ciceromark.ComputedVariable',
    heading: 'org.accordproject.commonmark.Heading',
    item: 'org.accordproject.commonmark.Item',
    list: 'org.accordproject.commonmark.List',
    listBlock: 'org.accordproject.ciceromark.ListBlock',
    paragraph: 'org.accordproject.commonmark.Paragraph',
    softbreak: 'org.accordproject.commonmark.Softbreak',
    text: 'org.accordproject.commonmark.Text',
    variable: 'org.accordproject.ciceromark.Variable',
    emphasize: 'org.accordproject.commonmark.Emph',
};

/**
 * Transforms the ciceromark to OOXML
 */
class CiceroMarkToOOXMLTransfomer {
    /**
     * Declares the OOXML and counter variable.
     */
    constructor() {
        this.globalOOXML = '';
        this.counter = {};
    }

    /**
     * Returns the counter holding variable count for a CiceroMark(JSON).
     *
     * @returns {object} Counter for variables in CiceroMark(JSON)
     */
    getCounter() {
        return this.counter;
    }

    /**
     * Gets the OOXML for the given node.
     *
     * @param {object} node    Description of node type
     * @param {object} parent  Parent object for a node
     * @returns {string} OOXML for the given node
     */
    getNodes(node, parent = null) {
        if (getClass(node) === definedNodes.variable) {
            const tag = node.name;
            const type = node.elementType;
            if (Object.prototype.hasOwnProperty.call(this.counter, tag)) {
                this.counter = {
                    ...this.counter,
                    [tag]: {
                        ...this.counter[tag],
                        count: ++this.counter[tag].count,
                    },
                };
            } else {
                this.counter[tag] = {
                    count: 1,
                    type,
                };
            }
            const value = node.value;
            const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
            return VARIABLE_RULE(title, tag, value, type);
        }

        if (getClass(node) === definedNodes.text) {
            if (parent !== null && parent.class === definedNodes.heading) {
                return HEADING_RULE(node.text, parent.level);
            }
            if (parent !== null && parent.class === definedNodes.emphasize) {
                return EMPHASIS_RULE(node.text, true);
            } else {
                return TEXT_RULE(node.text);
            }
        }

        if (getClass(node) === definedNodes.softbreak) {
            return SOFTBREAK_RULE();
        }

        if (getClass(node) === definedNodes.emphasize) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, { class: node.$class });
            });
            return ooxml;
        }

        if (getClass(node) === definedNodes.heading) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, { class: node.$class, level: node.level });
            });
            this.globalOOXML = `
                ${this.globalOOXML}
                <w:p>
                    ${ooxml}
                </w:p>
            `;
        }

        if (getClass(node) === definedNodes.paragraph) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode);
            });
            this.globalOOXML = `${this.globalOOXML}<w:p>${ooxml}</w:p>`;
        }
        return '';
    }

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @returns {string} Converted OOXML string i.e. CicecoMark->OOXML
     */
    toOOXML(ciceromark) {
        ciceromark.nodes.forEach(node => {
            this.getNodes(node);
        });
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML);
        return this.globalOOXML;
    }
}

module.exports = CiceroMarkToOOXMLTransfomer;
