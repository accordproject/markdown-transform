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

const { TEXT_RULE, EMPHASIS_RULE } = require('./CiceroMarkToOOXMLRules');
const { wrapAroundDefaultDocxTags } = require('./CiceroMarkToOOXMLHelpers');

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
     * Declares the OOXML variable
     */
    constructor() {
        this.globalOOXML = '';
    }

    /**
     * Gets the class of a given CiceroMark node.
     *
     * @param {object} node CiceroMark node entity
     * @returns {string} Class of given node
     */
    getClass(node) {
        return node.$class;
    }

    /**
     * Gets the OOXML for the given node.
     *
     * @param {object} node    Description of node type
     * @param {object} counter Counter for different variables based on node name
     * @param {object} parent  Parent object for a node
     * @returns {string} OOXML for the given node
     */
    getNodes(node, counter, parent = null) {
        if (this.getClass(node) === definedNodes.text) {
            if (parent !== null && parent.class === definedNodes.emphasize) {
                return EMPHASIS_RULE(node.text, true);
            } else {
                return TEXT_RULE(node.text);
            }
        }

        if (this.getClass(node) === definedNodes.emphasize) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, counter, { class: node.$class });
            });
            return ooxml;
        }

        if (this.getClass(node) === definedNodes.paragraph) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, counter,);
            });
            this.globalOOXML = `${this.globalOOXML}<w:p>${ooxml}</w:p>`;
        }
        return '';
    }

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @param {Object} counter    Counter for different variables based on node name
     * @param {string} ooxml      Initial OOXML string
     * @returns {string} Converted OOXML string i.e. CicecoMark->OOXML
     */
    toOOXML(ciceromark, counter, ooxml = '') {
        this.globalOOXML = ooxml;
        ciceromark.nodes.forEach(node => {
            this.getNodes(node, counter);
        });
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML);
        return this.globalOOXML;
    }
}

module.exports = CiceroMarkToOOXMLTransfomer;