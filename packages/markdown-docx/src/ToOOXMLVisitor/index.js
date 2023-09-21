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
    VANISH_PROPERTY_RULE,
    CONDITIONAL_OR_OPTIONAL_FONT_FAMILY_RULE,
    CONDITIONAL_RULE,
    FORMULA_RULE,
} = require('./rules');
const { wrapAroundDefaultDocxTags, wrapAroundLockedContentControls, sanitizeHtmlChars } = require('./helpers');
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
     * @param {string}  value            Text value of the node
     * @param {Array}   nodeProperties   Properties of the node
     * @param {boolean} calledByCode     Is function called by code node or not
     * @param {object}  parentProperties Properties of parent on which children depend for certain styles(e.g. vanish property for hidden nodes)
     * @returns {string} Generated OOXML
     */
    generateTextOrCodeOOXML(value, nodeProperties, calledByCode = false, parentProperties) {
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
        if (parentProperties.traversingNodeHiddenInConditional) {
            propertyTag += VANISH_PROPERTY_RULE();
        }
        if (parentProperties.traversingNodePresentInWhenFalseOrWhenNoneCondtion) {
            propertyTag += CONDITIONAL_OR_OPTIONAL_FONT_FAMILY_RULE();
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
     * @param {object} node             CiceroMark Node
     * @param {array}  properties       Properties to be applied on current node
     * @param {string} parent           Parent element of the node(paragraph, clause, heading, and optional)
     * @param {object} parentProperties Properties of parent on which children depend for certain styles(vanish property for hidden nodes)
     * @returns {string} OOXML for the inline nodes of the current parent
     */
    traverseNodes(node, properties = [], parent, parentProperties = {}) {
        if (this.getClass(node) === 'org.accordproject.commonmark@0.5.0.Document') {
            this.traverseNodes(node.nodes, properties, parent, parentProperties);
        } else {
            let inlineOOXML = '';
            for (let subNode of node) {
                if (this.getClass(subNode) === TRANSFORMED_NODES.text) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties, false, parentProperties);
                    inlineOOXML += tag;
                    if (!(parent === TRANSFORMED_NODES.optional || parent === TRANSFORMED_NODES.conditional)) {
                        this.tags = [...this.tags, tag];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.code) {
                    const tag = this.generateTextOrCodeOOXML(subNode.text, properties, true, parentProperties);
                    inlineOOXML += tag;
                    if (!(parent === TRANSFORMED_NODES.optional || parent === TRANSFORMED_NODES.conditional)) {
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

                    inlineOOXML += VARIABLE_RULE(
                        title,
                        tag,
                        value,
                        type,
                        parentProperties.traversingNodeHiddenInConditional
                    );
                    if (!(parent === TRANSFORMED_NODES.optional || parent === TRANSFORMED_NODES.conditional)) {
                        this.tags = [...this.tags, VARIABLE_RULE(title, tag, value, type)];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.formula) {
                    // Dependencies are added for the reason to extract them
                    // when converting from ooxml -> ciceromark
                    const tag = subNode.name;
                    const type = sanitizeHtmlChars(subNode.code);
                    this.createOrUpdateCounter(tag, type);
                    const value = subNode.value;
                    const dependencies = subNode.dependencies.join(',');
                    const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
                    inlineOOXML += FORMULA_RULE(
                        title,
                        tag,
                        value,
                        type,
                        dependencies,
                        parentProperties.traversingNodeHiddenInConditional
                    );
                    if (!(parent === TRANSFORMED_NODES.optional || parent === TRANSFORMED_NODES.conditional)) {
                        this.tags = [
                            ...this.tags,
                            FORMULA_RULE(
                                title,
                                tag,
                                value,
                                type,
                                dependencies,
                                parentProperties.traversingNodeHiddenInConditional
                            ),
                        ];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.softbreak) {
                    inlineOOXML += SOFTBREAK_RULE();
                    if (!(parent === TRANSFORMED_NODES.optional || parent === TRANSFORMED_NODES.conditional)) {
                        this.tags = [...this.tags, SOFTBREAK_RULE()];
                    }
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.thematicBreak) {
                    this.globalOOXML += THEMATICBREAK_RULE();
                } else if (this.getClass(subNode) === TRANSFORMED_NODES.clause) {
                    let clauseOOXML = '';
                    if (subNode.nodes) {
                        for (const deepNode of subNode.nodes) {
                            if (this.getClass(deepNode) === TRANSFORMED_NODES.paragraph) {
                                this.traverseNodes(
                                    deepNode.nodes,
                                    properties,
                                    TRANSFORMED_NODES.paragraph,
                                    parentProperties
                                );
                                let ooxml = '';
                                for (let xmlTag of this.tags) {
                                    ooxml += xmlTag;
                                }
                                ooxml = PARAGRAPH_RULE(ooxml);
                                clauseOOXML += ooxml;

                                // Clear all the tags as all nodes of paragraph have been traversed.
                                this.tags = [];
                            } else if (this.getClass(deepNode) === TRANSFORMED_NODES.heading) {
                                this.traverseNodes(
                                    deepNode.nodes,
                                    properties,
                                    TRANSFORMED_NODES.heading,
                                    parentProperties
                                );
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
                                this.traverseNodes(deepNode.nodes, newProperties, parent, parentProperties);
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
                            this.traverseNodes(
                                subNode.nodes,
                                properties,
                                TRANSFORMED_NODES.paragraph,
                                parentProperties
                            );
                            let ooxml = '';
                            for (let xmlTag of this.tags) {
                                ooxml += xmlTag;
                            }
                            ooxml = PARAGRAPH_RULE(ooxml);

                            this.globalOOXML += ooxml;
                            // Clear all the tags as all nodes of paragraph have been traversed.
                            this.tags = [];
                        } else if (this.getClass(subNode) === TRANSFORMED_NODES.heading) {
                            this.traverseNodes(subNode.nodes, properties, TRANSFORMED_NODES.heading, parentProperties);
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
                            parentProperties.traversingNodeHiddenInConditional = !subNode.hasSome;
                            // traverse the whenSome properties now
                            const whenSomeOOXML = this.traverseNodes(
                                subNode.whenSome,
                                properties,
                                TRANSFORMED_NODES.optional,
                                parentProperties
                            );
                            parentProperties.traversingNodePresentInWhenFalseOrWhenNoneCondtion = true;
                            // traverse whenNone properties now
                            const whenNoneOOXML = this.traverseNodes(
                                subNode.whenNone,
                                properties,
                                TRANSFORMED_NODES.optional,
                                parentProperties
                            );

                            const ooxml = `${whenSomeOOXML}  ${whenNoneOOXML}`;
                            const tag = subNode.name;
                            const type = subNode.elementType;
                            this.createOrUpdateCounter(tag, type);
                            const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
                            const optionalTag = OPTIONAL_RULE(title, tag, ooxml, type);
                            this.tags = [...this.tags, optionalTag];
                            // make the parentProperties false as traversal is done
                            parentProperties.traversingNodeHiddenInConditional = false;
                            parentProperties.traversingNodePresentInWhenFalseOrWhenNoneCondtion = false;
                        } else if (this.getClass(subNode) === TRANSFORMED_NODES.conditional) {
                            parentProperties.traversingNodeHiddenInConditional = !subNode.isTrue;
                            // traverse true nodes
                            const whenTrueOOXML = this.traverseNodes(
                                subNode.whenTrue,
                                properties,
                                TRANSFORMED_NODES.conditional,
                                parentProperties
                            );
                            parentProperties.traversingNodePresentInWhenFalseOrWhenNoneCondtion = true;
                            // traverse false nodes
                            const whenFalseOOXML = this.traverseNodes(
                                subNode.whenFalse,
                                properties,
                                TRANSFORMED_NODES.conditional,
                                parentProperties
                            );
                            const ooxml = `${whenTrueOOXML}  ${whenFalseOOXML}`;
                            const tag = subNode.name;
                            this.createOrUpdateCounter(tag);
                            const title = `${tag.toUpperCase()[0]}${tag.substring(1)}${this.counter[tag].count}`;
                            const conditionalTag = CONDITIONAL_RULE(title, tag, ooxml);
                            this.tags = [...this.tags, conditionalTag];
                            parentProperties.traversingNodeHiddenInConditional = false;
                            parentProperties.traversingNodePresentInWhenFalseOrWhenNoneCondtion = false;
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
                            inlineOOXML += this.traverseNodes(subNode.nodes, newProperties, parent, parentProperties);
                        }
                    }
                }
            }
            return inlineOOXML;
        }
    }

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @returns {string} OOXML string
     */
    toOOXML(ciceromark) {
        this.traverseNodes(ciceromark, [], TRANSFORMED_NODES.document);
        this.globalOOXML = wrapAroundLockedContentControls(this.globalOOXML);
        this.globalOOXML = wrapAroundDefaultDocxTags(this.globalOOXML, this.relationships);

        return this.globalOOXML;
    }
}

module.exports = ToOOXMLVisitor;
