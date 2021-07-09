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
    HEADING_PROPERTIES_RULE,
    VARIABLE_RULE,
    SOFTBREAK_RULE,
    STRONG_RULE,
    CODE_PROPERTIES_RULE,
} = require('./rules');
const { wrapAroundDefaultDocxTags } = require('./helpers');
const { DEFINED_NODES } = require('../constants');

/**
 * Transforms the ciceromark to OOXML
 */
class ToOOXMLVisitor {
    /**
     * Declares the OOXML, counter, and tags variable.
     */
    constructor() {
        // OOXML for given CiceroMark JSON
        this.globalOOXML = '';
        // Frequency of different variables in CiceroMark JSON
        this.counter = {};
        // OOXML tags for a given block node(heading, paragraph, etc.)
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
     * Traverses CiceroMark nodes in a DFS approach
     *
     * @param {object} node       CiceroMark Node
     * @param {array}  properties Properties to be applied on current node
     */
    traverseNodes(node, properties = []) {
        if (this.getClass(node) === 'org.accordproject.commonmark.Document') {
            this.traverseNodes(node.nodes, properties);
        } else {
            for (let subNode of node) {
                if (this.getClass(subNode) === DEFINED_NODES.text) {
                    let propertyTag = '';
                    for (let property of properties) {
                        if (property === DEFINED_NODES.emphasize) {
                            propertyTag += EMPHASIS_RULE();
                        } else if (property === DEFINED_NODES.strong) {
                            propertyTag += STRONG_RULE();
                        }
                    }
                    if (propertyTag) {
                        propertyTag = TEXT_STYLES_RULE(propertyTag);
                    }

                    let textValueTag = TEXT_RULE(subNode.text);

                    let tag = TEXT_WRAPPER_RULE(propertyTag, textValueTag);
                    this.tags = [...this.tags, tag];
                } else if (this.getClass(subNode) === DEFINED_NODES.code) {
                    let propertyTag = CODE_PROPERTIES_RULE();
                    for (let property of properties) {
                        if (property === DEFINED_NODES.emphasize) {
                            propertyTag += EMPHASIS_RULE();
                        } else if (property === DEFINED_NODES.strong) {
                            propertyTag += STRONG_RULE();
                        }
                    }
                    propertyTag = TEXT_STYLES_RULE(propertyTag);

                    let textValueTag = TEXT_RULE(subNode.text);

                    let tag = TEXT_WRAPPER_RULE(propertyTag, textValueTag);
                    this.tags = [...this.tags, tag];
                } else if (this.getClass(subNode) === DEFINED_NODES.variable) {
                    const tag = subNode.name;
                    const type = subNode.elementType;
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
                    const value = subNode.value;
                    const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;

                    this.tags = [...this.tags, VARIABLE_RULE(title, tag, value, type)];
                } else if (this.getClass(subNode) === DEFINED_NODES.softbreak) {
                    this.tags = [...this.tags, SOFTBREAK_RULE()];
                } else {
                    if (subNode.nodes) {
                        if (this.getClass(subNode) === DEFINED_NODES.paragraph) {
                            this.traverseNodes(subNode.nodes, properties);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                ooxml += xmlTag;
                            }
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            // Clear all the tags as all nodes of paragraph have been traversed.
                            this.tags = [];
                        } else if (this.getClass(subNode) === DEFINED_NODES.heading) {
                            this.traverseNodes(subNode.nodes, properties);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                let headingPropertiesTag = '';
                                headingPropertiesTag = HEADING_PROPERTIES_RULE(subNode.level);
                                ooxml += headingPropertiesTag;
                                ooxml += xmlTag;
                            }

                            // in DOCX heading is a paragraph with some styling tags present
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            this.tags = [];
                        } else {
                            let newProperties = [...properties, subNode.$class];
                            this.traverseNodes(subNode.nodes, newProperties);
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
     * @returns {object} { Converted OOXML string i.e. CiceroMark->OOXML, Frequency of variables }
     */
    toOOXML(ciceromark) {
        this.traverseNodes(ciceromark, []);
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML);

        return { ooxml: this.globalOOXML, counter: this.counter };
    }
}

module.exports = ToOOXMLVisitor;
