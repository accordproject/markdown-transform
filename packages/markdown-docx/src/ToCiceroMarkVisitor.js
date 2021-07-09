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

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

const { DEFINED_NODES } = require('./constants');

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
                return property.attributes['w:val'];
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
                return combinedTitle.split(' | ')[1];
            }
        }
    }

    /**
     * Constructs a ciceroMark Node for inline element from the information.
     *
     * @param {object} nodeInformation Contains properties and value of a node
     * @return {object} CiceroMark Node
     */
    constructCiceroMarkNodeJSON(nodeInformation) {
        let ciceroMarkNode = {};
        if (nodeInformation.nodeType === DEFINED_NODES.softbreak) {
            ciceroMarkNode = {
                $class: DEFINED_NODES.softbreak,
            };
        } else if (nodeInformation.nodeType === DEFINED_NODES.variable) {
            ciceroMarkNode = {
                $class: DEFINED_NODES.variable,
                value: nodeInformation.value,
                elementType: nodeInformation.elementType,
                name: nodeInformation.name,
            };
        } else if (nodeInformation.nodeType === DEFINED_NODES.code) {
            ciceroMarkNode = {
                $class: DEFINED_NODES.code,
                text: nodeInformation.value,
            };
        } else {
            ciceroMarkNode = {
                $class: DEFINED_NODES.text,
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
        }
        return ciceroMarkNode;
    }

    /**
     * Generates all nodes present in a block element( paragraph, heading ).
     *
     * @param {object} rootNode Block node like paragraph, heading, etc.
     */
    generateNodes(rootNode) {
        if (this.JSONXML.length > 0) {
            let constructedNode;
            constructedNode = this.constructCiceroMarkNodeJSON(this.JSONXML[0]);
            rootNode.nodes = [...rootNode.nodes, constructedNode];

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

                if (commonPropertiesLength === 0) {
                    rootNode.nodes = [...rootNode.nodes, constructedNode];
                    rootNodesLength++;
                } else if (commonPropertiesLength === 1) {
                    rootNode.nodes[rootNodesLength - 1].nodes = [
                        ...rootNode.nodes[rootNodesLength - 1].nodes,
                        constructedNode,
                    ];
                } else if (commonPropertiesLength === 2) {
                    const subNodeLength = rootNode.nodes[rootNodesLength - 1].nodes.length;
                    rootNode.nodes[rootNodesLength - 1].nodes[subNodeLength - 1].nodes = [
                        ...rootNode.nodes[rootNodesLength - 1].nodes[subNodeLength - 1].nodes,
                        constructedNode,
                    ];
                }
            }
            this.JSONXML = [];
            this.nodes = [...this.nodes, rootNode];
        }
    }

    /**
     * Traverses for properties and value.
     *
     * @param {Array}  node            Node to be traversed
     * @param {object} nodeInformation Information for the current node
     */
    fetchFormattingProperties(node, nodeInformation) {
        for (const runTimeNodes of node.elements) {
            if (runTimeNodes.name === 'w:rPr') {
                let colorCodePresent = false;
                let shadeCodePresent = false;
                for (let runTimeProperties of runTimeNodes.elements) {
                    if (runTimeProperties.name === 'w:i') {
                        nodeInformation.properties = [...nodeInformation.properties, DEFINED_NODES.emphasize];
                    } else if (runTimeProperties.name === 'w:b') {
                        nodeInformation.properties = [...nodeInformation.properties, DEFINED_NODES.strong];
                    } else if (runTimeProperties.name === 'w:color') {
                        if (runTimeProperties.attributes['w:val'] === 'C7254E') {
                            colorCodePresent = true;
                        }
                    } else if (runTimeProperties.name === 'w:shd') {
                        // w:highlight can render only fixed colors
                        // w:shd can detect the highlight color of text which can vary
                        if (runTimeProperties.attributes['w:fill'] === 'F9F2F4') {
                            shadeCodePresent = true;
                        }
                    }
                }
                if (colorCodePresent && shadeCodePresent) {
                    nodeInformation.nodeType = DEFINED_NODES.code;
                }
            } else if (runTimeNodes.name === 'w:t') {
                nodeInformation.value = runTimeNodes.elements ? runTimeNodes.elements[0].text : ' ';
                this.JSONXML = [...this.JSONXML, nodeInformation];
            } else if (runTimeNodes.name === 'w:sym') {
                nodeInformation.nodeType = DEFINED_NODES.softbreak;
                this.JSONXML = [...this.JSONXML, nodeInformation];
            }
        }
    }

    /**
     * Traverses the JSON object of XML elements in DFS approach.
     *
     * @param {object} node Node object to be traversed
     * @param {object} parent Parent node name
     */
    traverseElements(node, parent = '') {
        for (const subNode of node) {
            if (subNode.name === 'w:p') {
                const { isHeading, level } = this.getHeading(
                    subNode.elements && subNode.elements[0].elements && subNode.elements[0].elements[0]
                );

                if (subNode.elements) {
                    this.traverseElements(subNode.elements);
                }

                if (isHeading) {
                    let headingNode = {
                        $class: DEFINED_NODES.heading,
                        level,
                        nodes: [],
                    };
                    this.generateNodes(headingNode);
                } else {
                    let paragraphNode = {
                        $class: DEFINED_NODES.paragraph,
                        nodes: [],
                    };
                    this.generateNodes(paragraphNode);
                }
            } else if (subNode.name === 'w:sdt') {
                // denotes the whole template if parent is body
                if (parent === 'body') {
                    this.traverseElements(subNode.elements[1].elements);
                } else {
                    let nodeInformation = {
                        properties: [],
                        value: '',
                        nodeType: DEFINED_NODES.variable,
                        name: null,
                        elementType: null,
                    };
                    for (const variableSubNodes of subNode.elements) {
                        if (variableSubNodes.name === 'w:sdtPr') {
                            nodeInformation.name = this.getName(variableSubNodes.elements);
                            nodeInformation.elementType = this.getElementType(variableSubNodes.elements);
                        }
                        if (variableSubNodes.name === 'w:sdtContent') {
                            for (const variableContentNodes of variableSubNodes.elements) {
                                if (variableContentNodes.name === 'w:r') {
                                    this.fetchFormattingProperties(variableContentNodes, nodeInformation);
                                }
                            }
                        }
                    }
                }
            } else if (subNode.name === 'w:r') {
                let nodeInformation = { properties: [], value: '' };
                this.fetchFormattingProperties(subNode, nodeInformation);
            }
        }
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
                break;
            }
        }

        this.traverseElements(documentNode.elements[0].elements, 'body');

        return {
            $class: `${NS_PREFIX_CommonMarkModel}${'Document'}`,
            xmlns: 'http://commonmark.org/xml/1.0',
            nodes: this.nodes,
        };
    }
}

module.exports = ToCiceroMarkVisitor;
