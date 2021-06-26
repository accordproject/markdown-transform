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

const {
    TEXT_RULE,
    EMPHASIS_RULE,
    PARAGRAPH_RULE,
    TEXT_STYLES_RULE,
    TEXT_WRAPPER_RULE,
    PARAGRAPH_PROPERTIES_RULE,
} = require('./rules');
const { wrapAroundDefaultDocxTags } = require('./helpers');

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
    strong: 'org.accordproject.commonmark.Strong',
};

/**
 * Transforms the ciceromark to OOXML
 */
class CiceroMarkToOOXMLTransfomer {
    /**
     * Declares the OOXML, counter and tags variable.
     */
    constructor() {
        // OOXML for given CiceroMark JSON
        this.globalOOXML = '';
        // Frequency of different variables in CiceroMark JSON
        this.counter = {};
        // OOXML tags for a given block node(heading, pargraph, etc.)
        this.tags = [];
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
     * Returns the counter holding variable count for a CiceroMark(JSON).
     *
     * @returns {object} Counter for variables in CiceroMark(JSON)
     */
    getCounter() {
        return this.counter;
    }

    /**
     * Traverses CiceroMark nodes in a DFS approach
     *
     * @param {object} node       CiceroMark Node
     * @param {array}  properties Properties to be applied on curent node
     */
    travserseNodes(node, properties = []) {
        if (this.getClass(node) === 'org.accordproject.commonmark.Document') {
            this.travserseNodes(node.nodes, properties);
        } else {
            for (let subNode of node) {
                if (this.getClass(subNode) === definedNodes.text) {
                    let propertyTag = '';
                    for (let property of properties) {
                        if (property === definedNodes.emphasize) {
                            propertyTag += EMPHASIS_RULE();
                        }
                    }
                    if (propertyTag) {
                        propertyTag = TEXT_STYLES_RULE(propertyTag);
                    }

                    let textValueTag = TEXT_RULE(subNode.text);

                    let tag = TEXT_WRAPPER_RULE(propertyTag, textValueTag);
                    this.tags.push(tag);
                } else {
                    if (subNode.nodes) {
                        if (this.getClass(subNode) === definedNodes.paragraph) {
                            this.travserseNodes(subNode.nodes, properties);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                ooxml += xmlTag;
                            }
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            // Clear all the tags as all nodes of paragraph have been traversed.
                            this.tags = [];
                        } else if (this.getClass(subNode) === definedNodes.heading) {
                            this.travserseNodes(subNode.nodes, properties);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                let paragraphPropertiesTag = '';
                                if (xmlTag.includes(EMPHASIS_RULE())) {
                                    paragraphPropertiesTag += EMPHASIS_RULE();
                                }
                                paragraphPropertiesTag = PARAGRAPH_PROPERTIES_RULE(
                                    paragraphPropertiesTag,
                                    subNode.level
                                );
                                ooxml += paragraphPropertiesTag;
                                ooxml += xmlTag;
                            }

                            // in DOCX heading is a paragraph with some styling tags present
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            this.tags = [];
                        } else {
                            let newProperties = [...properties, subNode.$class];
                            this.travserseNodes(subNode.nodes, newProperties);
                        }
                    }
                }
            }
        }
    }

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @returns {string} Converted OOXML string i.e. CicecoMark->OOXML
     */
    toOOXML(ciceromark) {
        this.travserseNodes(ciceromark, []);
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML);

        return this.globalOOXML;
    }
}

module.exports = CiceroMarkToOOXMLTransfomer;
