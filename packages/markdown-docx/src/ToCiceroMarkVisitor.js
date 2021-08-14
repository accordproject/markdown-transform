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

const xmljs = require('xml-js');

const { TRANSFORMED_NODES, SEPARATOR } = require('./constants');

/**
 * Transforms OOXML to CiceroMark
 */
class ToCiceroMarkVisitor {
    /**
     * Defines the JSON XML array for blocks
     */
    constructor() {
        // Stores the properties of each node which lies within a block node ( heading, paragraph, etc. )
        this.JSONXML = [];

        // All the nodes generated from given OOXML
        this.nodes = [];

        // contains the relationship part of a given OOXML
        this.relationshipXML = [];
    }

    /**
     * @param {object} headingElement the element to be checked
     * @returns {object} object of `isHeading` and its level
     */
    getHeading(headingElement) {
        if (headingElement && headingElement.attributes !== undefined) {
            const headingLevel = headingElement.attributes['w:val'];
            if (headingElement.name === 'w:pStyle' && headingLevel.includes('Heading')) {
                return {
                    isHeading: true,
                    level: headingLevel[headingLevel.length - 1],
                };
            }
        }
        return {
            isHeading: false,
        };
    }

    /**
     * Gets the id of the variable.
     *
     * @param {Array} variableProperties the variable elements
     * @returns {string} the name of the variable
     */
    getName(variableProperties) {
        for (const property of variableProperties) {
            if (property.name === 'w:tag') {
                return property.attributes['w:val'].split(SEPARATOR)[1];
            }
        }
    }

    /**
     * Get the type of the element.
     *
     * @param {Array} variableProperties the variable elements
     * @returns {string} the type of the element
     */
    getElementType(variableProperties) {
        for (const property of variableProperties) {
            if (property.name === 'w:alias') {
                // eg. "Shipper1 | org.accordproject.organization.Organization"
                const combinedTitle = property.attributes['w:val'];
                // Index 1 will return the type
                return combinedTitle.split(SEPARATOR)[1];
            }
        }
    }

    /**
     * Gets the node type based on the tag value.
     *
     * @param {Array} properties the variable elements
     * @returns {string} the type of the node
     */
    getNodeType(properties) {
        let nodeType = TRANSFORMED_NODES.variable;
        for (const property of properties) {
            if (property.name === 'w:tag') {
                return property.attributes['w:val'].split(SEPARATOR)[0];
            }
        }
        return nodeType;
    }

    /**
     * Checks if the node is a thematic break or not
     *
     * @param {Array} paragraphProperties paragraph styling properties
     * @returns {boolean} true if the node is of type thematic break or else, false
     */
    checkThematicBreakProperties(paragraphProperties) {
        if (!paragraphProperties) {
            return false;
        }

        let isBorderPresent = false;

        for (const property of paragraphProperties) {
            if (property.name === 'w:pBdr') {
                for (const subProperty of property.elements) {
                    if (subProperty.name === 'w:bottom') {
                        const attributes = subProperty.attributes;
                        if (attributes['w:val'] === 'single' && attributes['w:sz'] === '6') {
                            isBorderPresent = true;
                        }
                    }
                }
            }
        }

        return isBorderPresent;
    }

    /**
     * Checks if the node is a codeblock or not
     *
     * @param {Array} paragraphProperties paragraph styling properties
     * @returns {boolean} true if the node is of type codeblock or else, false
     */
    checkCodeBlockProperties(paragraphProperties) {
        let isDesiredTopBorderPresent = false;
        let isDesiredBottomBorderPresent = false;
        let isDesiredLeftBorderPresent = false;
        let isDesiredRightBorderPresent = false;
        let isDesiredShadePresent = false;

        for (const property of paragraphProperties) {
            if (property.name === 'w:pBdr') {
                // do something
                for (const borderProperty of property.elements) {
                    if (borderProperty.attributes['w:color'] === 'CCCCCC') {
                        if (borderProperty.name === 'w:top') {
                            isDesiredTopBorderPresent = true;
                        } else if (borderProperty.name === 'w:bottom') {
                            isDesiredBottomBorderPresent = true;
                        } else if (borderProperty.name === 'w:left') {
                            isDesiredLeftBorderPresent = true;
                        } else if (borderProperty.name === 'w:right') {
                            isDesiredRightBorderPresent = true;
                        }
                    }
                }
            } else if (property.name === 'w:shd') {
                if (property.attributes['w:fill'] === 'F8F8F8') {
                    isDesiredShadePresent = true;
                }
            }
        }
        return (
            isDesiredTopBorderPresent &&
            isDesiredBottomBorderPresent &&
            isDesiredLeftBorderPresent &&
            isDesiredRightBorderPresent &&
            isDesiredShadePresent
        );
    }

    /**
     * Constructs a ciceroMark Node for inline element from the information.
     *
     * @param {object} nodeInformation Contains properties and value of a node
     * @return {object} CiceroMark Node
     */
    constructCiceroMarkNodeJSON(nodeInformation) {
        let ciceroMarkNode = {};
        if (nodeInformation.nodeType === TRANSFORMED_NODES.softbreak) {
            ciceroMarkNode = {
                $class: TRANSFORMED_NODES.softbreak,
            };
        } else if (nodeInformation.nodeType === TRANSFORMED_NODES.variable) {
            ciceroMarkNode = {
                $class: TRANSFORMED_NODES.variable,
                value: nodeInformation.value,
                elementType: nodeInformation.elementType,
                name: nodeInformation.name,
            };
        } else if (nodeInformation.nodeType === TRANSFORMED_NODES.code) {
            ciceroMarkNode = {
                $class: TRANSFORMED_NODES.code,
                text: nodeInformation.value,
            };
        } else {
            ciceroMarkNode = {
                $class: TRANSFORMED_NODES.text,
                text: nodeInformation.value,
            };
        }
        for (
            let nodePropertyIndex = nodeInformation.properties.length - 1;
            nodePropertyIndex >= 0;
            nodePropertyIndex--
        ) {
            ciceroMarkNode = {
                $class: nodeInformation.properties[nodePropertyIndex],
                nodes: [ciceroMarkNode],
            };
            if (nodeInformation.properties[nodePropertyIndex] === TRANSFORMED_NODES.optional) {
                let currentNodes = [...ciceroMarkNode.nodes];
                ciceroMarkNode = {
                    $class: TRANSFORMED_NODES.optional,
                    ...nodeInformation.optionalProperties,
                    hasSome: nodeInformation.hasSome,
                    nodes: currentNodes,
                };
                if (nodeInformation.whenSomeType) {
                    ciceroMarkNode.whenSome = currentNodes;
                    ciceroMarkNode.whenNone = [];
                } else {
                    ciceroMarkNode.whenNone = currentNodes;
                    ciceroMarkNode.whenSome = [];
                }
            }
            if (nodeInformation.properties[nodePropertyIndex] === TRANSFORMED_NODES.link) {
                ciceroMarkNode.title = '';
                for (const relationshipElement of this.relationshipXML) {
                    if (relationshipElement.attributes.Id === nodeInformation.linkId) {
                        ciceroMarkNode.destination = relationshipElement.attributes.Target;
                        break;
                    }
                }
            }
        }
        return ciceroMarkNode;
    }

    /**
     * Generates a nesting for the nodes with common level.
     *
     * @param {number} commonLevel Common level of nesting
     * @returns {string} Expression for the nesting
     */
    generateNesting(commonLevel) {
        let expression = 'rootNode.nodes[rootNodesLength - 1].';
        for (let currLevel = 2; currLevel <= commonLevel; currLevel++) {
            const lengthExpression = expression + 'nodes.length-1';
            expression = expression + `nodes[${lengthExpression}].`;
        }
        return expression;
    }

    /**
     * Generates all nodes present in a block element( paragraph, heading ).
     *
     * @param {object}  rootNode              Block node like paragraph, heading, etc.
     * @param {boolean} returnConstructedNode return the constructed node if true else appends it to nodes array
     * @returns {*} Node if returnConstructedNode else None
     */
    generateNodes(rootNode, returnConstructedNode = false) {
        if (this.JSONXML.length > 0) {
            let constructedNode;
            constructedNode = this.constructCiceroMarkNodeJSON(this.JSONXML[0]);
            rootNode.nodes = [...rootNode.nodes, constructedNode];

            // not used explicitly but used via eval function
            //eslint-disable-next-line
            let rootNodesLength = 1;
            for (let nodeIndex = 1; nodeIndex < this.JSONXML.length; nodeIndex++) {
                let propertiesPrevious = this.JSONXML[nodeIndex - 1].properties;
                let propertiesCurrent = this.JSONXML[nodeIndex].properties;

                let commonPropertiesLength = 0;
                for (
                    let propertyIndex = 0;
                    propertyIndex < Math.min(propertiesPrevious.length, propertiesCurrent.length);
                    propertyIndex++
                ) {
                    if (propertiesCurrent[propertyIndex] === propertiesPrevious[propertyIndex]) {
                        commonPropertiesLength++;
                    } else {
                        break;
                    }
                }
                let updatedProperties = {
                    ...this.JSONXML[nodeIndex],
                    properties: [...this.JSONXML[nodeIndex].properties.slice(commonPropertiesLength)],
                };
                constructedNode = this.constructCiceroMarkNodeJSON(updatedProperties);

                const nestedExpression = this.generateNesting(commonPropertiesLength);
                if (commonPropertiesLength === 0) {
                    rootNode.nodes = [...rootNode.nodes, constructedNode];
                    rootNodesLength++;
                } else {
                    if (propertiesCurrent[commonPropertiesLength - 1] === TRANSFORMED_NODES.optional) {
                        if (this.JSONXML[nodeIndex].whenSomeType) {
                            eval(`${nestedExpression}whenSome=[...${nestedExpression}whenSome, constructedNode]`);
                        } else {
                            eval(`${nestedExpression}whenNone=[...${nestedExpression}whenNone, constructedNode]`);
                        }
                        if (eval(`${nestedExpression}hasSome`)) {
                            eval(`${nestedExpression}nodes=${nestedExpression}whenSome`);
                        } else {
                            eval(`${nestedExpression}nodes=${nestedExpression}whenNone`);
                        }
                    } else {
                        eval(`${nestedExpression}nodes=[...${nestedExpression}nodes, constructedNode]`);
                    }
                }
            }
            this.JSONXML = [];
            if (returnConstructedNode) {
                return rootNode;
            } else {
                this.nodes = [...this.nodes, rootNode];
            }
        }
    }

    /**
     * Traverses for properties and value.
     *
     * @param {Array}   node              Node to be traversed
     * @param {string}  calledBy          Parent node class that called the function
     * @param {object}  nodeInformation   Information for the current node
     * @returns {string} NodeInformation array if optional else Value in <w:t> tags
     */
    fetchFormattingProperties(node, calledBy = TRANSFORMED_NODES.paragraph, nodeInformation = null) {
        let ooxmlTagTextValue = '';
        // let currentNode;
        if (calledBy === TRANSFORMED_NODES.link) {
            nodeInformation.properties = [...nodeInformation.properties, calledBy];
        }
        for (const runTimeNodes of node.elements) {
            if (runTimeNodes.name === 'w:rPr') {
                let colorCodePresent = false;
                let shadeCodePresent = false;
                let vanishPropertyPresent = false;
                let fontFamilyPresent = false;
                for (let runTimeProperties of runTimeNodes.elements) {
                    if (runTimeProperties.name === 'w:i') {
                        nodeInformation.properties = [...nodeInformation.properties, TRANSFORMED_NODES.emphasize];
                    } else if (runTimeProperties.name === 'w:b') {
                        nodeInformation.properties = [...nodeInformation.properties, TRANSFORMED_NODES.strong];
                    } else if (runTimeProperties.name === 'w:color') {
                        if (runTimeProperties.attributes['w:val'] === 'C7254E') {
                            colorCodePresent = true;
                        }
                    } else if (runTimeProperties.name === 'w:shd') {
                        // `w:shd` tag is used to detect the highlight colour of
                        // the text. Semantically, w:highlight should have been
                        // used but the latter can render fixed colors only
                        // unlike what is needed here.
                        // Reference: http://officeopenxml.com/WPtextShading.php.
                        if (runTimeProperties.attributes['w:fill'] === 'F9F2F4') {
                            shadeCodePresent = true;
                        }
                    } else if (runTimeProperties.name === 'w:vanish') {
                        vanishPropertyPresent = true;
                    } else if (runTimeProperties.name === 'w:rFonts') {
                        if (runTimeProperties.attributes['w:ascii'] === 'Baskerville Old Face') {
                            fontFamilyPresent = true;
                        }
                    }
                }
                if (colorCodePresent && shadeCodePresent) {
                    nodeInformation.nodeType = TRANSFORMED_NODES.code;
                }
                if (vanishPropertyPresent) {
                    if (fontFamilyPresent) {
                        nodeInformation.whenSomeType = false;
                        nodeInformation.hasSome = true;
                    } else {
                        nodeInformation.whenSomeType = true;
                        nodeInformation.hasSome = false;
                    }
                } else {
                    if (fontFamilyPresent) {
                        nodeInformation.whenSomeType = false;
                        nodeInformation.hasSome = false;
                    } else {
                        nodeInformation.whenSomeType = true;
                        nodeInformation.hasSome = true;
                    }
                }
            } else if (runTimeNodes.name === 'w:t') {
                if (calledBy === TRANSFORMED_NODES.codeBlock) {
                    ooxmlTagTextValue += runTimeNodes.elements ? runTimeNodes.elements[0].text : '';
                } else if (calledBy === TRANSFORMED_NODES.optional) {
                    ooxmlTagTextValue = runTimeNodes.elements && runTimeNodes.elements[0].text;
                    nodeInformation.value = ooxmlTagTextValue;
                } else {
                    ooxmlTagTextValue = runTimeNodes.elements ? runTimeNodes.elements[0].text : ' ';
                    nodeInformation.value = ooxmlTagTextValue;
                    this.JSONXML = [...this.JSONXML, nodeInformation];
                }
            } else if (runTimeNodes.name === 'w:br') {
                ooxmlTagTextValue += '\n';
            } else if (runTimeNodes.name === 'w:sym') {
                nodeInformation.nodeType = TRANSFORMED_NODES.softbreak;
                if (calledBy !== TRANSFORMED_NODES.optional) {
                    this.JSONXML = [...this.JSONXML, nodeInformation];
                }
            }
        }
        // if no w:rPr is present then it is still possible that
        // node is of optional type with no formatting properties
        if (typeof nodeInformation.hasSome === 'undefined') {
            nodeInformation.whenSomeType = true;
            nodeInformation.hasSome = true;
        }

        if (calledBy === TRANSFORMED_NODES.optional) {
            return nodeInformation;
        }
        return ooxmlTagTextValue;
    }

    /**
     * Traverses the JSON object of XML elements in DFS approach.
     *
     * @param {object} node   Node object to be traversed
     * @param {string} parent Parent node name
     * @param {syring} id     Relation Id for link in OOXML
     * @returns {*} GeneratedNode if parent is of type clause else none
     */
    traverseElements(node, parent = TRANSFORMED_NODES.paragraph, id = undefined) {
        /**
         * The parent argument is useful in cases where parent is a clause or link.
         * If parent argument is not present, then everything would have been treated
         * as pargraphs and transformation would be faulty.
         */

        // Contains node present in a codeblock or blockquote, etc.
        let blockNodes = [];

        // Generated inline nodes using w:r tag
        let inlineNodes = [];
        for (const subNode of node) {
            if (subNode.name === 'w:p') {
                if (!subNode.elements) {
                    continue;
                }

                const { isHeading, level } = this.getHeading(
                    subNode.elements[0].elements && subNode.elements[0].elements[0]
                );

                const isThematicBreak = this.checkThematicBreakProperties(subNode.elements[0].elements);

                const isCodeBlock = this.checkCodeBlockProperties(subNode.elements[0].elements);

                if (isCodeBlock) {
                    let text = '';
                    for (const codeBlockSubNode of subNode.elements) {
                        if (codeBlockSubNode.name === 'w:r') {
                            text = this.fetchFormattingProperties(codeBlockSubNode, TRANSFORMED_NODES.codeBlock, {});
                        }
                    }
                    const codeBlockNode = {
                        $class: TRANSFORMED_NODES.codeBlock,
                        text,
                    };
                    this.nodes = [...this.nodes, codeBlockNode];
                    continue;
                }

                if (isThematicBreak) {
                    const thematicBreakNode = {
                        $class: TRANSFORMED_NODES.thematicBreak,
                    };
                    if (parent === TRANSFORMED_NODES.clause) {
                        blockNodes = [...blockNodes, thematicBreakNode];
                    } else {
                        this.nodes = [...this.nodes, thematicBreakNode];
                        continue;
                    }
                }

                this.traverseElements(subNode.elements);

                if (isHeading) {
                    let headingNode = {
                        $class: TRANSFORMED_NODES.heading,
                        level,
                        nodes: [],
                    };
                    if (parent === TRANSFORMED_NODES.clause) {
                        blockNodes = [...blockNodes, this.generateNodes(headingNode, true)];
                    } else {
                        this.generateNodes(headingNode);
                    }
                } else {
                    let paragraphNode = {
                        $class: TRANSFORMED_NODES.paragraph,
                        nodes: [],
                    };
                    if (parent === TRANSFORMED_NODES.clause) {
                        blockNodes = [...blockNodes, this.generateNodes(paragraphNode, true)];
                    } else {
                        this.generateNodes(paragraphNode);
                    }
                }
            } else if (subNode.name === 'w:sdt') {
                // denotes the whole template if parent is body
                if (parent === 'body') {
                    this.traverseElements(subNode.elements[1].elements);
                } else {
                    let nodeInformation = {
                        properties: [],
                        nodeType: TRANSFORMED_NODES.variable,
                        name: null,
                        elementType: null,
                    };
                    for (const variableSubNodes of subNode.elements) {
                        if (variableSubNodes.name === 'w:sdtPr') {
                            nodeInformation.name = this.getName(variableSubNodes.elements);
                            nodeInformation.elementType = this.getElementType(variableSubNodes.elements);
                            nodeInformation.nodeType = this.getNodeType(variableSubNodes.elements);
                        }
                        if (variableSubNodes.name === 'w:sdtContent') {
                            if (nodeInformation.nodeType === TRANSFORMED_NODES.clause) {
                                const nodes = this.traverseElements(
                                    variableSubNodes.elements,
                                    TRANSFORMED_NODES.clause
                                );
                                const clauseNode = {
                                    $class: TRANSFORMED_NODES.clause,
                                    elementType: nodeInformation.elementType,
                                    name: nodeInformation.name,
                                    nodes,
                                };
                                this.nodes = [...this.nodes, clauseNode];
                            } else if (nodeInformation.nodeType === TRANSFORMED_NODES.optional) {
                                if (variableSubNodes.elements) {
                                    const optionalNodes = this.traverseElements(
                                        variableSubNodes.elements,
                                        TRANSFORMED_NODES.optional
                                    );
                                    for (const node of optionalNodes) {
                                        node.properties = [
                                            TRANSFORMED_NODES.optional,
                                            ...node.properties,
                                        ];
                                        node.optionalProperties = {
                                            elementType: nodeInformation.elementType,
                                            name: nodeInformation.name,
                                        };
                                        this.JSONXML = [...this.JSONXML, { ...node }];
                                    }
                                }
                            } else {
                                for (const variableContentNodes of variableSubNodes.elements) {
                                    if (variableContentNodes.name === 'w:r') {
                                        inlineNodes = [
                                            ...inlineNodes,
                                            this.fetchFormattingProperties(
                                                variableContentNodes,
                                                parent,
                                                nodeInformation
                                            ),
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (subNode.name === 'w:hyperlink') {
                this.traverseElements(subNode.elements, TRANSFORMED_NODES.link, subNode.attributes['r:id']);
            } else if (subNode.name === 'w:r') {
                let nodeInformation = { properties: [], value: '' };
                if (parent === TRANSFORMED_NODES.link) {
                    nodeInformation.linkId = id;
                }
                inlineNodes = [...inlineNodes, this.fetchFormattingProperties(subNode, parent, nodeInformation)];
            }
        }
        if (parent === TRANSFORMED_NODES.optional) {
            return inlineNodes;
        }
        return blockNodes;
    }

    /**
     * Transform OOXML -> CiceroMark.
     *
     * @param {string} input the ooxml string
     * @param {string} pkgName the package name of the xml to be converted
     * @returns {object} CiceroMark object
     */
    toCiceroMark(input, pkgName = '/word/document.xml') {
        // Parses the OOXML 'test/data/ooxml/document.xml' to JSON
        const convertedJSObject = xmljs.xml2js(input, {
            ignoreDeclaration: true,
            ignoreInstruction: true,
        });
        const rootNode = convertedJSObject.elements[0].elements;
        let documentNode;

        for (const node of rootNode) {
            if (node.attributes['pkg:name'] === pkgName) {
                // Gets the document node
                documentNode = node.elements[0].elements[0];
            }
            if (node.attributes['pkg:name'] === '/word/_rels/document.xml.rels') {
                this.relationshipXML = node.elements[0].elements[0].elements;
            }
        }

        this.traverseElements(documentNode.elements[0].elements, 'body');

        return {
            $class: TRANSFORMED_NODES.document,
            xmlns: 'http://commonmark.org/xml/1.0',
            nodes: this.nodes,
        };
    }
}

module.exports = ToCiceroMarkVisitor;
