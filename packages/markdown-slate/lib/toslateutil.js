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

/**
 * Unquote strings
 * @param {string} value - the string
 * @return {string} the unquoted string
 */
function unquoteString(value) {
    try {
        return value.substring(1,value.length-1);
    } catch(err) {
        return value;
    }
}

/**
 * Apply marks to a leaf node
 * @param {*} leafNode the leaf node
 * @param {*} parameters the parameters
 */
function applyMarks(leafNode, parameters) {
    if (parameters.emph) {
        leafNode.italic = true;
    }
    if (parameters.strong) {
        leafNode.bold = true;
    }
}

/**
 * Gets the text value from a formatted sub-tree
 * @param {*} thing a concerto Strong, Emph or Text node
 * @returns {string} the 'text' property of the formatted sub-tree
 */
function getText(thing) {
    if(thing.getType() === 'Text') {
        return thing.text;
    }
    else {
        if(thing.nodes && thing.nodes.length > 0) {
            return getText(thing.nodes[0]);
        }
        else {
            return '';
        }
    }
}

/**
 * Converts a heading level to a slate heading type name
 * @param {*} thing concert heading node
 * @returns {string} the slate heading type
 */
function getHeadingType(thing) {
    switch(thing.level) {
    case '1': return 'heading_one';
    case '2': return 'heading_two';
    case '3': return 'heading_three';
    case '4': return 'heading_four';
    case '5': return 'heading_five';
    case '6': return 'heading_six';
    default: return 'heading_one';
    }
}

/**
 * Converts a formatted text node to a slate text node with marks
 * @param {*} thing a concerto Strong, Emph or Text node
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleFormattedText(thing, parameters) {
    const textNode = {
        object: 'text',
        text: getText(thing)};

    applyMarks(textNode, parameters);
    return textNode;
}

/**
 * Converts a conditional variable node to a slate node with marks
 * @param {string} name - the name of the block
 * @param {*} data - the data for the conditional variable
 * @param {*} nodes - the conditional nodes
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleBlockDefinition(name, data, nodes, parameters) {
    const inlineNode = {
        object: 'inline',
        type: name,
        data: data,
        children: nodes
    };
    applyMarks(inlineNode,parameters);

    return inlineNode;
}

/**
 * Converts a variable node to a text node with marks
 * @param {*} type - the type of variable
 * @param {*} data - the data for the variable
 * @param {*} text - the text for the variable
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleVariable(type, data, text, parameters) {
    const fixedText = data.elementType === 'String' || data.identifiedBy ? unquoteString(text) : text;
    const textNode = {
        object: 'text',
        text: fixedText
    };

    return handleBlockDefinition(type, data, [textNode], parameters);
}

/**
 * Converts a variable definition node to a text node with marks
 * @param {*} type - the type of variable
 * @param {*} data - the data for the variable
 * @param {*} text - the text for the variable
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleVariableDefinition(type, data, text, parameters) {
    const textNode = {
        object: 'text',
        text: text
    };

    return handleBlockDefinition(type, data, [textNode], parameters);
}

/**
 * Converts a formula node to a slate text node with marks
 * @param {*} data - the data for the formula
 * @param {*} text - the text for the formula
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleFormula(data, text, parameters) {
    const textNode = {
        object: 'text',
        text: text
    };
    return handleBlockDefinition('formula', data, [textNode], parameters);
}

/**
 * Cleanup Slate node (post processing)
 * @param {object} node - the slate node
 * @returns {object} the cleaned up slate node
 */
function cleanup(node) {
    const result = node;
    // Cleanup block node for Slate
    if (result.object === 'block' || result.object === 'inline') {
        const emptyText = () => { return { object: 'text', text: '' }; };
        if (!result.data) {
            result.data = {};
        }
        if (!result.children || result.children.length === 0) {
            result.children = [ emptyText() ];
        }
        if (result.children && result.children.length > 0) {
            const normalizedChildren = [];
            for (let i = 0; i < result.children.length; i++) {
                const child = result.children[i];
                const isLast = i === result.children.length - 1;

                if (child.object === 'inline') {
                    if (
                        normalizedChildren.length === 0 ||
                            normalizedChildren[normalizedChildren.length - 1].object === 'inline'
                    ) {
                        normalizedChildren.push(emptyText(), child);
                    } else if (isLast) {
                        normalizedChildren.push(child, emptyText());
                    } else {
                        normalizedChildren.push(child);
                    }
                } else {
                    normalizedChildren.push(child);
                }
            }
            result.children = normalizedChildren;
        }
    }
    return result;
}

module.exports = {
    unquoteString,
    applyMarks,
    getText,
    getHeadingType,
    handleFormattedText,
    handleBlockDefinition,
    handleVariable,
    handleVariableDefinition,
    handleFormula,
    cleanup,
};