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
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;

/**
 * Transforms OOXML to CiceroMark
 */
class OoxmlTransformer {
    /**
     * Defines the JSON XML array for blocks
     */
    constructor() {
        // for storing the xml tags present in a node containing its properties in array form
        this.JSONXML = [];

        // nodes of a paragraph or heading element
        this.nodes = [];
    }

    /**
     * @param {object} headingElement the element to be checked
     * @returns {object} object of `isHeading` and its level
     */
    getHeading(headingElement) {
        if (headingElement.attributes !== undefined) {
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
     * Gets the id of the variable
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
        return null;
    }

    /**
     * Get the type of the element
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
        return null;
    }

    /**
     * Constructs a ciceroMark Node JSON from the information
     *
     * @param {object} nodeInformation Contains properties and value of a node
     * @return {object} CiceroMark Node
     */
    construtCiceroMarkNodeJSON(nodeInformation) {
        let obj = {};
        if (nodeInformation.nodeType === 'softbreak') {
            obj = {
                $class: `${NS_PREFIX_CommonMarkModel}Softbreak`,
            };
        } else if (nodeInformation.nodeType === 'variable') {
            obj = {
                $class: `${NS_PREFIX_CiceroMarkModel}Variable`,
                value: nodeInformation.value || 'Not provided',
                elementType: nodeInformation.elementType || 'Not a template variable',
                name: nodeInformation.name || 'No name available',
            };
        } else {
            obj = {
                $class: `${NS_PREFIX_CommonMarkModel}Text`,
                text: nodeInformation.value,
            };
        }
        for (let i = nodeInformation.properties.length - 1; i >= 0; i--) {
            obj = {
                $class: nodeInformation.properties[i],
                nodes: [obj],
            };
        }
        return obj;
    }

    /**
     * Creates a pargraph, heading or block CiceroMark Node
     *
     * @param {object} rootNode Pargraph, heading or any other node
     */
    constructNodes(rootNode) {
        if (this.JSONXML.length > 0) {
            let constructedNode;
            constructedNode = this.construtCiceroMarkNodeJSON(this.JSONXML[0]);
            rootNode.nodes = [...rootNode.nodes, constructedNode];

            let rootNodesLength = 1;
            for (let i = 1; i < this.JSONXML.length; i++) {
                let propertiesPrevious = this.JSONXML[i - 1].properties;
                let propertiesCurrent = this.JSONXML[i].properties;

                let commonLength = 0;
                for (let j = 0; j < Math.min(propertiesPrevious.length, propertiesCurrent.length); j++) {
                    if (propertiesCurrent[j] === propertiesPrevious[j]) {
                        commonLength++;
                    } else {
                        break;
                    }
                }
                let updatedProperties = {
                    ...this.JSONXML[i],
                    properties: [...this.JSONXML[i].properties.slice(commonLength)],
                };
                constructedNode = this.construtCiceroMarkNodeJSON(updatedProperties);

                if (commonLength === 0) {
                    rootNode.nodes = [...rootNode.nodes, constructedNode];
                    rootNodesLength++;
                } else if (commonLength === 1) {
                    rootNode.nodes[rootNodesLength - 1].nodes = [
                        ...rootNode.nodes[rootNodesLength - 1].nodes,
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
    findAndTraverseRunTimeNodes(node, nodeInformation) {
        for (const runTimeNodes of node.elements) {
            if (runTimeNodes.name === 'w:rPr') {
                for (let runTimeProperties of runTimeNodes.elements) {
                    if (runTimeProperties.name === 'w:i') {
                        nodeInformation.properties = [
                            ...nodeInformation.properties,
                            `${NS_PREFIX_CommonMarkModel}Emph`,
                        ];
                    } else if (runTimeProperties.name === 'w:b') {
                        nodeInformation.properties = [
                            ...nodeInformation.properties,
                            `${NS_PREFIX_CommonMarkModel}Strong`,
                        ];
                    }
                }
            } else if (runTimeNodes.name === 'w:t') {
                nodeInformation.value = runTimeNodes.elements[0].text;
                this.JSONXML = [...this.JSONXML, nodeInformation];
            } else if (runTimeNodes.name === 'w:sym') {
                nodeInformation.nodeType = 'softbreak';
                this.JSONXML = [...this.JSONXML, nodeInformation];
            }
        }
    }

    /**
     * Traverses the JSON object of XML elememts in DFS approach.
     *
     * @param {object} node Node object to be traversed
     * @param {object} parent Parent node name
     */
    traverseElements(node, parent = '') {
        for (const subNode of node) {
            if (subNode.name === 'w:p') {
                const { isHeading, level } = this.getHeading(subNode.elements[0].elements[0]);

                if (subNode.elements) {
                    this.traverseElements(subNode.elements);
                }

                if (isHeading) {
                    let headingNode = {
                        $class: `${NS_PREFIX_CommonMarkModel}Heading`,
                        level,
                        nodes: [],
                    };
                    this.constructNodes(headingNode);
                } else {
                    let paragraphNode = {
                        $class: `${NS_PREFIX_CommonMarkModel}Paragraph`,
                        nodes: [],
                    };
                    this.constructNodes(paragraphNode);
                }
            } else if (subNode.name === 'w:sdt') {
                // denotes the whole template if parent is body
                if (parent === 'body') {
                    this.traverseElements(subNode.elements[1].elements);
                } else {
                    let nodeInformation = {
                        properties: [],
                        value: '',
                        nodeType: 'variable',
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
                                    this.findAndTraverseRunTimeNodes(variableContentNodes, nodeInformation);
                                }
                            }
                        }
                    }
                }
            } else if (subNode.name === 'w:r') {
                let nodeInformation = { properties: [], value: '' };
                this.findAndTraverseRunTimeNodes(subNode, nodeInformation);
            }
        }
    }

    /**
     * Transform OOXML -> CiceroMark
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

module.exports = OoxmlTransformer;
