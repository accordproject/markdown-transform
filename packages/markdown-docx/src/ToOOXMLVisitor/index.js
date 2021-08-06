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
    THEMATICBREAK_RULE,
    CODEBLOCK_PROPERTIES_RULE,
    CODEBLOCK_FONTPROPERTIES_RULE,
    CLAUSE_RULE,
    LINK_RULE,
    LINK_PROPERTY_RULE,
} = require('./rules');
const { wrapAroundDefaultDocxTags, wrapAroundLockedContentControls } = require('./helpers');
const { TRANSFORMED_NODES } = require('../constants');

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
        // Relationship tags for links in a document
        this.relationships = [];
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
     * Generates the OOXML for text and code ciceromark nodes.
     *
     * @param {string} value           Text value of the node
     * @param {Array}  nodeProperties  Properties of the node
     * @param {string} defaultProperty Default property of the node
     * @returns {striing} Generated OOXML
     */
    generateTextOrCodeOOXML(value, nodeProperties, defaultProperty = '') {
        let propertyTag = defaultProperty;
        let isLinkPropertyPresent = false;
        for (const property of nodeProperties) {
            if (property === TRANSFORMED_NODES.emphasize) {
                propertyTag += EMPHASIS_RULE();
            } else if (property === TRANSFORMED_NODES.strong) {
                propertyTag += STRONG_RULE();
            } else if (property === TRANSFORMED_NODES.link) {
                isLinkPropertyPresent = true;
                propertyTag += LINK_PROPERTY_RULE();
            }
        }
        if (propertyTag) {
            propertyTag = TEXT_STYLES_RULE(propertyTag);
        }

        let textValueTag = TEXT_RULE(value);

        let tag = TEXT_WRAPPER_RULE(propertyTag, textValueTag);

        if (isLinkPropertyPresent) {
            // Two relationships for numbering and style are already present
            // and since we need to accommodate for link styles as well, we need a unique ID
            // to represent them. Hence, 2 is added to offset the enumeration of `rId`.

            let relationshipId = 'rId' + (this.relationships.length + 2).toString();
            tag = LINK_RULE(tag, relationshipId);
        }
        return tag;
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
                if (this.getClass(subNode) === TRANSFORMED_NODES.text) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties);
                    this.tags = [...this.tags, tag];
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.code) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties, CODE_PROPERTIES_RULE());
                    this.tags = [...this.tags, tag];
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.codeBlock) {
                    let ooxml = CODEBLOCK_PROPERTIES_RULE();
                    let textValues = subNode.text.split('\n');
                    let textValueTag = '';
                    for (let textValueIndex = 0; textValueIndex < textValues.length; textValueIndex++) {
                        textValueTag += TEXT_RULE(textValues[textValueIndex]);
                        if (textValueIndex !== textValues.length - 1) {
                            textValueTag += '<w:br />';
                        }
                    }
                    let textPropertyTag = TEXT_STYLES_RULE(CODEBLOCK_FONTPROPERTIES_RULE());
                    ooxml += TEXT_WRAPPER_RULE(textPropertyTag, textValueTag);

                    this.globalOOXML += PARAGRAPH_RULE(ooxml);
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.variable) {
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
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.softbreak) {
                    this.tags = [...this.tags, SOFTBREAK_RULE()];
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.thematicBreak) {
                    this.globalOOXML += THEMATICBREAK_RULE();
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.clause) {
                    let clauseOOXML = '';
                    if (subNode.nodes) {
                        for (const deepNode of subNode.nodes) {
                            if (this.getClass(deepNode) === TRANSFORMED_NODES.paragraph) {
                                this.traverseNodes(deepNode.nodes, properties);
                                let ooxml = '';
                                for (let xmlTag of this.tags) {
                                    ooxml += xmlTag;
                                }
                                ooxml = PARAGRAPH_RULE(ooxml);
                                clauseOOXML += ooxml;

                                // Clear all the tags as all nodes of paragraph have been traversed.
                                this.tags = [];
                            } else if (this.getClass(deepNode) === TRANSFORMED_NODES.heading) {
                                this.traverseNodes(deepNode.nodes, properties);
                                let ooxml = '';
                                for (let xmlTag of this.tags) {
                                    let headingPropertiesTag = '';
                                    headingPropertiesTag = HEADING_PROPERTIES_RULE(deepNode.level);
                                    ooxml += headingPropertiesTag;
                                    ooxml += xmlTag;
                                }

                                // in DOCX heading is a paragraph with some styling tags present
                                ooxml = PARAGRAPH_RULE(ooxml);
                                clauseOOXML += ooxml;

                                this.tags = [];
                            } else {
                                let newProperties = [...properties, deepNode.$class];
                                this.traverseNodes(deepNode.nodes, newProperties);
                            }
                        }
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
                        const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
                        this.globalOOXML += CLAUSE_RULE(title, tag, type, clauseOOXML);
                    }
                } else {
                    if (subNode.nodes) {
                        if (this.getClass(subNode) === TRANSFORMED_NODES.paragraph) {
                            this.traverseNodes(subNode.nodes, properties);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                ooxml += xmlTag;
                            }
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            // Clear all the tags as all nodes of paragraph have been traversed.
                            this.tags = [];
                        } else if (this.getClass(subNode) === TRANSFORMED_NODES.heading) {
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
                            if (this.getClass(subNode) === TRANSFORMED_NODES.link) {
                                const relationshipTag = `<Relationship Id="rId${
                                    this.relationships.length + 3
                                }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${
                                    subNode.destination
                                }" TargetMode="External"/>`;
                                this.relationships = [...this.relationships, relationshipTag];
                            }
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
     * @returns {string} OOXML string
     */
    toOOXML(ciceromark) {
        this.traverseNodes(ciceromark, []);
        this.globalOOXML = wrapAroundLockedContentControls(this.globalOOXML);
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML, this.relationships);

        return this.globalOOXML;
    }
}

module.exports = ToOOXMLVisitor;
