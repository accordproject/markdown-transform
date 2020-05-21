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

const NS = 'org.accordproject.commonmark';
const NS_CICERO = 'org.accordproject.ciceromark';


/**
 * Removes nodes if they are an empty paragraph
 * @param {*} input - the current result of slateToCiceroMarkDom
 * @returns {*} the final result of slateToCiceroMarkDom
 */
const removeEmptyParagraphs = (input) => {
    let nodesWithoutBlankParagraphs = [];
    input.nodes.forEach(node => {
        if (node.$class === 'org.accordproject.commonmark.Paragraph' &&
            node.nodes.length === 1 &&
            node.nodes[0].$class === 'org.accordproject.commonmark.Text' &&
            node.nodes[0].text === '') {
            return;
        }
        nodesWithoutBlankParagraphs.push(node);
    });
    input.nodes = nodesWithoutBlankParagraphs;
    return input;
};

/**
 * Gather the text for the node
 * @param {*} input - the current slate node
 * @returns {string} the text contained in the slate node
 */
const getText = (input) => {
    let result = '';

    if (input.type === 'paragraph') {
        result += '\n';
    }

    if (input.text) {
        result += input.text;
    }
    if (input.children) {
        input.children.forEach(node => {
            result += getText(node);
        });
    }
    return result;
};

/**
 * Converts a set of Slate child node to CiceroMark DOM (as JSON)
 * @param {*} value the Slate value
 * @returns {*} the CiceroMark DOM as a Concerto object
 */
function slateToCiceroMarkDom(value) {

    const result = {
        $class : 'org.accordproject.commonmark.Document',
        xmlns : 'http://commonmark.org/xml/1.0',
        nodes : []
    };
    // convert the value to a plain object
    _recursive(result, value.document.children);
    return removeEmptyParagraphs(result);
}

/**
 * Converts an array of Slate nodes, pushing them into the parent
 * @param {*} parent the parent CiceroMark DOM node
 * @param {*} nodes an array of Slate nodes
 */
function _recursive(parent, nodes) {

    nodes.forEach((node, index) => {
        let result = null;

        if('text' in node && !node.type) {
            result = handleText(node);
        } else {
            switch(node.type) {
            case 'clause':
                // console.log(JSON.stringify(node, null, 4));
                result = {$class : `${NS_CICERO}.Clause`, name: node.data.name, src: node.data.src, nodes: []};
                if (node.data.elementType) {
                    result.elementType = node.data.elementType;
                }
                break;
            case 'variable':
            case 'conditional':
                result = handleVariable(node);
                break;
            case 'formula':
                result = handleFormula(node);
                break;
            case 'paragraph':
                result = {$class : `${NS}.Paragraph`, nodes: []};
                break;
            case 'softbreak':
                result = {$class : `${NS}.Softbreak`};
                break;
            case 'linebreak':
                result = {$class : `${NS}.Linebreak`};
                break;
            case 'horizontal_rule':
                result = {$class : `${NS}.ThematicBreak`};
                break;
            case 'heading_one':
                result = {$class : `${NS}.Heading`, level : '1', nodes: []};
                break;
            case 'heading_two':
                result = {$class : `${NS}.Heading`, level : '2', nodes: []};
                break;
            case 'heading_three':
                result = {$class : `${NS}.Heading`, level : '3', nodes: []};
                break;
            case 'heading_four':
                result = {$class : `${NS}.Heading`, level : '4', nodes: []};
                break;
            case 'heading_five':
                result = {$class : `${NS}.Heading`, level : '5', nodes: []};
                break;
            case 'heading_six':
                result = {$class : `${NS}.Heading`, level : '6', nodes: []};
                break;
            case 'block_quote':
                result = {$class : `${NS}.BlockQuote`, nodes: []};
                break;
            case 'code_block':
                result = {$class : `${NS}.CodeBlock`, text: getText(node)};
                break;
            case 'html_block':
                result = {$class : `${NS}.HtmlBlock`, text: getText(node)};
                break;
            case 'html_inline':
                result = {$class : `${NS}.HtmlInline`, text: node.data.content};
                break;
            case 'ol_list':
            case 'ul_list': {
                if (node.data.type === 'variable') {
                    result = {$class : `${NS_CICERO}.ListBlock`, name: node.data.name, type: node.type === 'ol_list' ? 'ordered' : 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
                    if (node.data.elementType) {
                        result.elementType = node.data.elementType;
                    }
                } else {
                    result = {$class : `${NS}.List`, type: node.type === 'ol_list' ? 'ordered' : 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
                }
            }
                break;
            case 'list_item':
                result = {$class : `${NS}.Item`, nodes: []};
                break;
            case 'link':
                result = {$class : `${NS}.Link`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
                break;
            case 'image':
                result = {$class : `${NS}.Image`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
                break;
            }
        }

        // process any children, attaching to first child if it exists (for list items)
        if(node.children && result && result.nodes) {
            _recursive(result.nodes[0] ? result.nodes[0] : result, node.children);
            if (result.nodes.length === 0) {
                result.nodes.push({$class : `${NS}.Text`, text : ''});
            }
        }

        if(!parent.nodes) {
            throw new Error(`Parent node doesn't have children ${JSON.stringify(parent)}`);
        }

        if(result) {
            parent.nodes.push(result);
        }
    });
}

/**
 * Handles marks
 * @param {*} slateNode the slate node
 * @param {*} newNode the new node
 * @returns {*} the final ast node
 */
function handleMarks(slateNode,newNode) {
    let strong = null;
    let emph = null;
    let result = newNode;

    const isBold = slateNode.bold;
    const isItalic = slateNode.italic;

    if (isBold) {
        strong = {$class : `${NS}.Strong`, nodes: []};
    }

    if (isItalic) {
        emph  = {$class : `${NS}.Emph`, nodes: []};
    }

    if(strong) {
        strong.nodes.push(result);
        result = strong;
    }
    if(emph) {
        emph.nodes.push(result);
        result = emph;
    }

    return result;
}

/**
 * Handles a text node
 * @param {*} node the slate text node
 * @returns {*} the ast node
 */
function handleText(node) {
    let result = null;
    const isCode = node.code;
    if (node.object === 'text' && node.text === '') { return null; }
    if (isCode) {
        result = {$class : `${NS}.Code`, text: node.text};
    } else {
        result = {$class : `${NS}.Text`, text : node.text};
    }

    return handleMarks(node,result);
}

/**
 * Handles a variable node
 * @param {*} node the slate variable node
 * @returns {*} the ast node
 */
function handleVariable(node) {
    let result = null;

    const textNode = node.children[0]; // inlines always contain a single text node
    node.children = []; // Reset the children for the inline to avoid recursion

    const type = node.type;
    const data = node.data;

    const baseName = type === 'variable' ? (Object.prototype.hasOwnProperty.call(data,'format') ? 'FormattedVariable' : (Object.prototype.hasOwnProperty.call(data,'enumValues') ? 'EnumVariable' : 'Variable')) : 'Conditional';
    const className = `${NS_CICERO}.${baseName}`;

    result = {
        $class : className,
        name : data.name,
        value : textNode.text
    };

    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'format')) {
        result.format = data.format;
    }
    if (Object.prototype.hasOwnProperty.call(data,'enumValues')) {
        result.enumValues = data.enumValues;
    }
    if (Object.prototype.hasOwnProperty.call(data,'whenTrue')) {
        result.whenTrue = data.whenTrue;
    }
    if (Object.prototype.hasOwnProperty.call(data,'whenFalse')) {
        result.whenFalse = data.whenFalse;
    }

    return handleMarks(node,result);
}

/**
 * Handles a formula
 * @param {*} node the slate formula node
 * @returns {*} the ast node
 */
function handleFormula(node) {
    let result = null;

    const textNode = node.children[0]; // inlines always contain a single text node
    node.children = []; // Reset the children for the inline to avoid recursion

    const className = `${NS_CICERO}.Formula`;

    result = {
        $class : className,
        value : textNode.text
    };

    const data = node.data;
    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'name')) {
        result.name = data.name;
    }

    return handleMarks(node,result);
}

module.exports = slateToCiceroMarkDom;