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
const typeOf = require('type-of');
const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

/**
 * Transforms OOXML to CiceroMark
 */
class OoxmlTransformer {
    /**
     * Gets the id of the variable
     *
     * @param {Array} elements the variable elements
     * @returns {string} the name of the variable
     */
    getName(elements) {
        const variableProperties = elements[0];
        for (const property of variableProperties.elements) {
            if (property.name === 'w:tag') {
                return property.attributes['w:val'];
            }
        }
        return null;
    }

    /**
     * Get the type of the element
     *
     * @param {Array} elements the variable elements
     * @returns {string} the type of the element
     */
    getElementType(elements) {
        const variableProperties = elements[0];
        for (const property of variableProperties.elements) {
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
     * Gets the value of the variable
     *
     * @param {Array} elements the variable elements
     * @returns {string} the value of the variable
     */
    getValue(elements) {
        const variableContents = elements[1];
        for (const property of variableContents.elements[0].elements) {
            if (property.name === 'w:t') {
                return property.elements[0].text;
            }
        }
        return null;
    }

    /**
     * Checks if the element is a line break or not
     *
     * @param {object} element the element to be checked
     * @returns {boolean} whether the element is a line break
     */
    isLineBreak(element) {
        return element.name === 'w:p' && element.elements === undefined;
    }

    /**
     * Returns if the element is a heading or not and if it is, an attribute
     * level is also passed to determine the style of the heading.
     *
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
     * Return the node after parsing each element
     *
     * @param {object} element the element of the document node
     * @returns {Array|object} the nodes
     */
    deserializeElement(element) {
        switch (element.name) {
        case 'w:p':
            if (element.elements !== undefined) {
                const headingElement = this.getHeading(element.elements[0].elements[0]);
                const lineBreak = this.isLineBreak(element.elements[0].elements[0]);
                if (headingElement.isHeading) {
                    return {
                        $class: `${NS_PREFIX_CommonMarkModel}Heading`,
                        level: headingElement.level,
                        nodes: [this.deserializeElements(element.elements)[0]],
                    };
                }
                if (!lineBreak) {
                    return {
                        $class: `${NS_PREFIX_CommonMarkModel}Paragraph`,
                        nodes: this.deserializeElements(element.elements)
                    };
                }
            }
            return;
        case 'w:sdt': {
            const name = this.getName(element.elements);
            const value = this.getValue(element.elements);
            const elementType = this.getElementType(element.elements);
            if (name && value && elementType) {
                return {
                    $class: 'org.accordproject.ciceromark.Variable',
                    value,
                    name,
                    elementType,
                };
            }
            return this.deserializeElements(element.elements);
        }
        case 'w:sym':
            return {
                $class: `${NS_PREFIX_CommonMarkModel}Softbreak`,
            };
        case 'w:r':
            if (element.elements[0].name === 'w:rPr') {
                let emphasisedTextFound = element.elements[0].elements.some(
                    subElement => {
                        return subElement.name === 'w:i';
                    }
                );
                if (emphasisedTextFound) {
                    return {
                        $class: `${NS_PREFIX_CommonMarkModel}Emph`,
                        nodes: [
                            ...this.deserializeElements(element.elements),
                        ],
                    };
                }
            }
            return [...this.deserializeElements(element.elements)];
        case 'w:color':
            return element.attributes['w:color'];
        case 'w:t':
            return {
                $class: `${NS_PREFIX_CommonMarkModel}Text`,
                text: element.elements[0].text
            };
        default:
            return this.deserializeElements(element.elements);
        }
    }

    /**
     * Gets the CiceroMark JSON object
     *
     * @param {Array} elements the root node
     * @returns {object} the CiceroMark object
     */
    deserializeElements(elements) {
        let nodes = [];
        if (elements === undefined) {
            return;
        }

        for (const element of elements) {
            if (element.name === 'w:pPr') {
                continue;
            }
            const node = this.deserializeElement(element);
            switch (typeOf(node)) {
            case 'array':
                nodes = [...nodes, ...node];
                break;
            case 'object':
                nodes = [...nodes, node];
                break;
            }
        }

        return nodes;
    }

    /**
     * Transform OOXML -> CiceroMark
     *
     * @param {string} input the ooxml string
     * @param {string} pkgName the package name of the xml to be converted
     * @returns {object} CiceroMark object
     */
    toCiceroMark(input, pkgName='/word/document.xml') {
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
        const nodes = this.deserializeElements(documentNode.elements);
        return {
            '$class': `${NS_PREFIX_CommonMarkModel}${'Document'}`,
            xmlns: 'http://commonmark.org/xml/1.0',
            nodes,
        };
    }
}

module.exports = OoxmlTransformer;