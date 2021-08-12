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
    OPTIONAL_RULE,
} = require('./rules');
const { wrapAroundDefaultDocxTags, wrapAroundLockedContentControls } = require('./helpers');
const { TRANSFORMED_NODES, RELATIONSHIP_OFFSET } = require('../constants');

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
        // Contains the tags for optional or conditional nodes.
        // Optional/conditional themselves can act contain multiple inline nodes.
        // However, they are not block elements and are present inside
        // paragraph or clause nodes so an extra array is needed to store their info.
        this.conditionalOrOptionalTags = [];

        // Whether the nodes traversed in conditional or optional are of false condition
        // in optional this means if hasSome is true then whenNone are these nodes
        // if hasSome is false then whenSome nodes are the corresponding required nodes
        // this is done to add vanish property
        this.isTraversingFalseCondition = false;

        // Whether the nodes traversed are present in else condition
        // done to add specific font property
        // font property+ vanish = whenNone, else nodes when converting from
        // ooxml->ciceromark. simple vanish means whenNone, if nodes
        this.isTraversingElseCondition = false;
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
     * @param {string}  value           Text value of the node
     * @param {Array}   nodeProperties  Properties of the node
     * @param {boolean} calledByCode    Is function called by code node or not
     * @returns {string} Generated OOXML
     */
    generateTextOrCodeOOXML(value, nodeProperties, calledByCode = false) {
        let propertyTag = '';
        if (calledByCode) {
            propertyTag = CODE_PROPERTIES_RULE();
        }
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
        if (this.isTraversingFalseCondition) {
            propertyTag += '<w:vanish/>';
        }
        if (this.isTraversingElseCondition) {
            propertyTag += '<w:rFonts w:ascii="Baskerville Old Face" w:hAnsi="Baskerville Old Face"/>';
        }
        if (propertyTag) {
            propertyTag = TEXT_STYLES_RULE(propertyTag);
        }

        let textValueTag = TEXT_RULE(value);

        let tag = TEXT_WRAPPER_RULE(propertyTag, textValueTag);

        if (isLinkPropertyPresent) {
            let relationshipId = 'rId' + (this.relationships.length + RELATIONSHIP_OFFSET).toString();
            tag = LINK_RULE(tag, relationshipId);
        }
        return tag;
    }

    /**
     * Checks if an object contains the property and updates counter for it.
     *
     * @param {string} tag  Tag of the property
     * @param {string} type Type of the property
     */
    createOrUpdateCounter(tag, type) {
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
    }

    /**
     * Traverses CiceroMark nodes in a DFS approach
     *
     * @param {object}  node                           CiceroMark Node
     * @param {array}   properties                     Properties to be applied on current node
     * @param {boolean} isConditionalOrOptionalPresent True if the dfs traversal contains conditional or optional else false
     */
    traverseNodes(node, properties = [], isConditionalOrOptionalPresent = '') {
        if (this.getClass(node) === 'org.accordproject.commonmark.Document') {
            this.traverseNodes(node.nodes, properties, isConditionalOrOptionalPresent);
        } else {
            for (let subNode of node) {
                if (this.getClass(subNode) === TRANSFORMED_NODES.text) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties);
                    if (isConditionalOrOptionalPresent) {
                        this.conditionalOrOptionalTags = [...this.conditionalOrOptionalTags, tag];
                    } else {
                        this.tags = [...this.tags, tag];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.code) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties, true);
                    if (isConditionalOrOptionalPresent) {
                        this.conditionalOrOptionalTags = [...this.conditionalOrOptionalTags, tag];
                    } else {
                        this.tags = [...this.tags, tag];
                    }
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
                    this.createOrUpdateCounter(tag, type);
                    const value = subNode.value;
                    const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;

                    if (isConditionalOrOptionalPresent) {
                        this.conditionalOrOptionalTags = [
                            ...this.conditionalOrOptionalTags,
                            VARIABLE_RULE(title, tag, value, type, this.isTraversingFalseCondition),
                        ];
                    } else {
                        this.tags = [...this.tags, VARIABLE_RULE(title, tag, value, type)];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.softbreak) {
                    if (isConditionalOrOptionalPresent) {
                        this.conditionalOrOptionalTags = [...this.conditionalOrOptionalTags, SOFTBREAK_RULE()];
                    } else {
                        this.tags = [...this.tags, SOFTBREAK_RULE()];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.thematicBreak) {
                    this.globalOOXML += THEMATICBREAK_RULE();
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.clause) {
                    let clauseOOXML = '';
                    if (subNode.nodes) {
                        for (const deepNode of subNode.nodes) {
                            if (this.getClass(deepNode) === TRANSFORMED_NODES.paragraph) {
                                this.traverseNodes(deepNode.nodes, properties, isConditionalOrOptionalPresent);
                                let ooxml = '';
                                for (let xmlTag of this.tags) {
                                    ooxml += xmlTag;
                                }
                                ooxml = PARAGRAPH_RULE(ooxml);
                                clauseOOXML += ooxml;

                                // Clear all the tags as all nodes of paragraph have been traversed.
                                this.tags = [];
                            } else if (this.getClass(deepNode) === TRANSFORMED_NODES.heading) {
                                this.traverseNodes(deepNode.nodes, properties, isConditionalOrOptionalPresent);
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
                                this.traverseNodes(deepNode.nodes, newProperties, isConditionalOrOptionalPresent);
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
                            this.traverseNodes(subNode.nodes, properties, isConditionalOrOptionalPresent);
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                ooxml += xmlTag;
                            }
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            // Clear all the tags as all nodes of paragraph have been traversed.
                            this.tags = [];
                        } else if (this.getClass(subNode) === TRANSFORMED_NODES.heading) {
                            this.traverseNodes(subNode.nodes, properties, isConditionalOrOptionalPresent);
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
                        } else if (this.getClass(subNode) === TRANSFORMED_NODES.optional) {
                            if (!subNode.hasSome) {
                                this.isTraversingFalseCondition = true;
                            }
                            // traverse the whenSome properties now
                            this.traverseNodes(subNode.whenSome, properties, true);

                            if (!subNode.hasSome) {
                                this.isTraversingFalseCondition = false;
                            } else {
                                this.isTraversingFalseCondition = true;
                            }
                            this.isTraversingElseCondition = true;
                            // traverse whenNone properties now
                            this.traverseNodes(subNode.whenNone, properties, true);
                            let ooxml = '';
                            for (let tag of this.conditionalOrOptionalTags) {
                                ooxml += tag;
                            }
                            this.isTraversingFalseCondition = false;
                            this.isTraversingElseCondition = false;
                            this.conditionalOrOptionalTags = [];

                            const tag = subNode.name;
                            const type = subNode.elementType;
                            this.createOrUpdateCounter(tag, type);
                            const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
                            let optionalTag = OPTIONAL_RULE(title, tag, ooxml, type);
                            this.tags = [...this.tags, optionalTag];
                        } else {
                            if (this.getClass(subNode) === TRANSFORMED_NODES.link) {
                                this.relationships = [
                                    ...this.relationships,
                                    {
                                        id: this.relationships.length + RELATIONSHIP_OFFSET + 1,
                                        destination: subNode.destination,
                                    },
                                ];
                            }
                            let newProperties = [...properties, subNode.$class];
                            this.traverseNodes(subNode.nodes, newProperties, isConditionalOrOptionalPresent);
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
