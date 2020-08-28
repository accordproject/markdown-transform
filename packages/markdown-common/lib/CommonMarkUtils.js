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

const DOMParser = require('xmldom').DOMParser;
const NS_PREFIX_CommonMarkModel = require('./externalModels/CommonMarkModel').NS_PREFIX_CommonMarkModel;

/**
 * CommonMark Utilities
 */

/**
 * Initial block stack
 * @return {*} the block stack
 */
function blocksInit() {
    return {
        first: true,
        blocks: [],
    };
}

/**
 * Next node
 * @param {*} stack the current block stack
 */
function blocksNextNode(stack) {
    stack.first = false;
}

/**
 * enter block
 * @param {*} stack the current block stack
 * @param {string} blockType the block type
 * @param {*} setFirst whether entering this block should set first
 * @return {*} the block stack
 */
function blocksEnterBlock(stack, blockType, setFirst) {
    let newStack = {};
    if(setFirst(blockType)) {
        newStack.first = true;
    } else {
        newStack.first = stack.first;
    }
    newStack.blocks = stack.blocks.slice();
    newStack.blocks.push(blockType);
    return newStack;
}

/**
 * Create a prefix within an existing line
 * @param {Array<string>} blocks - the ancestor blocks
 * @return {string} the prefix to add to the current line
 */
function prefixInLine(blocks) {
    let prefix = '';
    for (let i = blocks.length-1; i >= 0; i--) {
        if (blocks[i] === 'Item' || blocks[i] === 'ListBlockDefinition') {
            break;
        } else if (blocks[i] === 'BlockQuote') {
            prefix = '> ' + prefix;
        }
    }
    return prefix;
}

/**
 * Create a new line
 * @param {Array<string>} blocks - the ancestor blocks
 * @return {string} the prefixed new line
 */
function newLine(blocks) {
    let prefix = '';
    for (let i = blocks.length-1; i >= 0; i--) {
        if (blocks[i] === 'Item' || blocks[i] === 'ListBlockDefinition') {
            prefix = '   ' + prefix;
        } else if (blocks[i] === 'BlockQuote') {
            prefix = '> ' + prefix;
        }
    }
    return '\n' + prefix;
}

/**
 * Next node
 * @param {*} parameters the current parameters
 */
function nextNode(parameters) {
    blocksNextNode(parameters.stack);
    if(parameters.index) {
        parameters.index++;
    }
}

/**
 * Set parameters for general blocks
 * @param {*} ast - the current ast node
 * @param {*} parametersOut - the current parameters
 * @param {*} init - initial result value
 * @param {*} setFirst whether entering this block should set first
 * @return {*} the new parameters with block quote level incremented
 */
function mkParameters(ast, parametersOut, init, setFirst) {
    let parameters = Object.assign({},parametersOut); // This is important to allow extra parameters to be passed
    parameters.result = init;
    parameters.stack = blocksEnterBlock(parametersOut.stack,ast.getType(),setFirst);
    if(ast.getType() === 'List') {
        parameters.indexInit = ast.start ? parseInt(ast.start) : 1; // Initial index
        parameters.index = parameters.indexInit; // Current index
        parameters.tight = ast.tight; // Tight or loose list
        parameters.type = ast.type; // ordered or bulleted list
    }
    return parameters;
}

/**
 * Create a line prefix
 * @param {*} parameters - the parameters
 * @param {*} nb - number of newlines
 * @return {string} the prefix
 */
function mkPrefix(parameters, nb) {
    const stack = parameters.stack;
    if (stack.first) {
        return prefixInLine(stack.blocks);
    } else {
        const nl = newLine(stack.blocks);
        return nl.repeat(nb);
    }
}

/**
 * Create a single new line
 * @param {*} parameters - the parameters
 * @return {string} the prefix
 */
function mkNewLine(parameters) {
    const stack = parameters.stack;
    return newLine(stack.blocks);
}

/**
 * Create Setext heading
 * @param {number} level - the heading level
 * @return {string} the markup for the heading
 */
function mkSetextHeading(level) {
    if (level === 1) {
        return '====';
    } else {
        return '----';
    }
}

/**
 * Create ATX heading
 * @param {number} level - the heading level
 * @return {string} the markup for the heading
 */
function mkATXHeading(level) {
    return Array(level).fill('#').join('');
}

/**
 * Adding escapes for text nodes
 * @param {string} input - unescaped
 * @return {string} escaped
 */
function escapeText(input) {
    return input.replace(/[*`&>]/g, '\\$&') // Replaces special characters
        .replace(/^(#+) /g, '\\$1 ') // Replaces heading markers
        .replace(/^(\d+)\. /g, '$1\\. ') // Replaces ordered list markers
        .replace(/^- /g, '\\- ') // Replaces unordered list markers
        .replace(/^_/g, '\\_'); // Replaces thematic break markers
}

/**
 * Adding escapes for code blocks
 * @param {string} input - unescaped
 * @return {string} escaped
 */
function escapeCodeBlock(input) {
    return input.replace(/`/g, '\\`');
}

/**
 * Removing escapes
 * @param {string} input - escaped
 * @return {string} unescaped
 */
function unescapeCodeBlock(input) {
    return input.replace(/\\`/g, '`');
}

/**
 * Parses an HTML block and extracts the attributes, tag name and tag contents.
 * Note that this will return null for strings like this: </foo>
 * @param {string} string - the HTML block to parse
 * @return {Object} - a tag object that holds the data for the html block
 */
function parseHtmlBlock(string) {
    try {
        const doc = (new DOMParser()).parseFromString(string, 'text/html');
        const item = doc.childNodes[0];
        const attributes = item.attributes;
        const attributeObject = {};
        let attributeString = '';

        for (let i = 0; i < attributes.length; i += 1) {
            attributeString += `${attributes[i].name} = "${attributes[i].value}" `;
            attributeObject[attributes[i].name] = attributes[i].value;
        }

        const tag = {};
        tag.$class = NS_PREFIX_CommonMarkModel + 'TagInfo';
        tag.tagName = item.tagName.toLowerCase();
        tag.attributeString = attributeString;
        tag.attributes = [];
        for (const attName in attributeObject) {
            if (Object.prototype.hasOwnProperty.call(attributeObject, attName)) {
                const attValue = attributeObject[attName];
                tag.attributes.push({
                    $class : NS_PREFIX_CommonMarkModel + 'Attribute',
                    name : attName,
                    value : attValue,
                });
            }
        }
        tag.content = item.textContent;
        tag.closed = string.endsWith('/>');

        return tag;
    } catch (err) {
        // no children, so we return null
        return null;
    }
}

/**
 * Merge adjacent Html nodes in a list of nodes
 * @param {[*]} nodes - a list of nodes
 * @param {boolean} tagInfo - whether to extract Html tags
 * @returns {*} a new list of nodes with open/closed Html nodes merged
 */
function mergeAdjacentHtmlNodes(nodes, tagInfo) {
    const result = [];
    for(let n=0; n < nodes.length; n++) {
        const cur = nodes[n];
        const next = n+1 < nodes.length ? nodes[n+1] : null;

        if(next &&
           cur.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') &&
           next.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') &&
           cur.tag &&
           next.text === `</${cur.tag.tagName}>`) {
            next.text = cur.text + next.text;  // Fold text in next node, skip current node
            next.tag = tagInfo ? parseHtmlBlock(next.text) : null;
        } else {
            result.push(cur);
        }
    }
    return result;
}

/**
 * Determine the heading level
 *
 * @param {string} tag the heading tag
 * @returns {string} the heading level
 */
function headingLevel(tag) {
    switch(tag) {
    case 'h1' : return '1';
    case 'h2' : return '2';
    case 'h3' : return '3';
    case 'h4' : return '4';
    case 'h5' : return '5';
    default: return '6';
    }
}

/**
 * Get an attribute value
 *
 * @param {*} attrs open ordered list attributes
 * @param {string} name attribute name
 * @param {*} def a default value
 * @returns {string} the initial index
 */
function getAttr(attrs,name,def) {
    if (attrs) {
        const startAttrs = attrs.filter((x) => x[0] === name);
        if (startAttrs[0]) {
            return '' + startAttrs[0][1];
        } else {
            return def;
        }
    } else {
        return def;
    }
}

/**
 * Trim single ending newline
 *
 * @param {string} text the input text
 * @returns {string} the trimmed text
 */
function trimEndline(text) {
    if (text.charAt(text.length-1) && text.charAt(text.length-1) === '\n') {
        return text.substring(0,text.length-1);
    } else {
        return text;
    }
}

module.exports.blocksInit = blocksInit;

module.exports.nextNode = nextNode;
module.exports.mkParameters = mkParameters;
module.exports.mkNewLine = mkNewLine;
module.exports.mkPrefix = mkPrefix;
module.exports.mkSetextHeading = mkSetextHeading;
module.exports.mkATXHeading = mkATXHeading;

module.exports.escapeText = escapeText;
module.exports.escapeCodeBlock = escapeCodeBlock;
module.exports.unescapeCodeBlock = unescapeCodeBlock;

module.exports.parseHtmlBlock = parseHtmlBlock;
module.exports.mergeAdjacentHtmlNodes = mergeAdjacentHtmlNodes;

module.exports.headingLevel = headingLevel;
module.exports.getAttr = getAttr;
module.exports.trimEndline = trimEndline;
