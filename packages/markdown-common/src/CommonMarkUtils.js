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
 *
 * @param {string} string the string to capitalize
 * @returns {string} the string capitalized
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 *
 * @param {string} name the name of the commonmark type
 * @returns {string} the concerto type name
 */
function toClass(name) {
    const camelCased = name.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
    return NS_PREFIX_CommonMarkModel + capitalizeFirstLetter(camelCased);
}

/**
 * Set parameters for general blocks
 * @param {*} parametersOut - the current parameters
 * @return {*} the new parameters with block quote level incremented
 */
function mkParameters(parametersOut) {
    let parameters = {};
    parameters.result = '';
    parameters.first = parametersOut.first;
    parameters.stack = parametersOut.stack.slice();
    return parameters;
}

/**
 * Set parameters for block quote
 * @param {*} parametersOut - the current parameters
 * @return {*} the new parameters with block quote level incremented
 */
function mkParametersInBlockQuote(parametersOut) {
    let parameters = {};
    parameters.result = '';
    parameters.first = parametersOut.first;
    parameters.stack = parametersOut.stack.slice();
    parameters.stack.push('block');
    return parameters;
}

/**
 * Set parameters for inner list
 * @param {*} parametersOut - the current parameters
 * @return {*} the new parameters with first set to true
 */
function mkParametersInList(parametersOut) {
    let parameters = {};
    parameters.result = '';
    parameters.first = true;
    parameters.stack = parametersOut.stack.slice();
    parameters.stack.push('list');
    return parameters;
}

/**
 * Create prefix
 * @param {*} parameters - the parameters
 * @param {*} newlines - number of newlines
 * @return {string} the prefix
 */
function mkPrefix(parameters, newlines) {
    if (newlines === 0) {
        return '';
    }
    const stack = parameters.stack;
    let prefix = '';
    for (let i = stack.length-1; i >= 0; i--) {
        if (stack[i] === 'list') {
            if (parameters.first) {
                break;
            } else {
                prefix = '   ' + prefix;
            }
        } else if (stack[i] === 'block') {
            prefix = '> ' + prefix;
        }
    }
    if (parameters.first) {
        return prefix;
    } else {
        return ('\n' + prefix).repeat(newlines);
    }
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
    return input.replace(/[*`&]/g, '\\$&') // Replaces special characters
        .replace(/^(#+) /g, '\\$1 ') // Replaces heading markers
        .replace(/^(\d+)\. /g, '$1\\. ') // Replaces ordered lists markers
        .replace(/^- /g, '\\- '); // Replaces unordered lists markers
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
 * Is it a leaf node?
 * @param {*} json - the JS Object for the AST
 * @return {boolean} whether it's a leaf node
 */
function isLeafNode(json) {
    return (json.$class === (NS_PREFIX_CommonMarkModel + 'Text') ||
            json.$class === (NS_PREFIX_CommonMarkModel + 'CodeBlock') ||
            json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') ||
            json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlBlock') ||
            json.$class === (NS_PREFIX_CommonMarkModel + 'Code'));
}

/**
 * Is it a HTML node? (html blocks or html inlines)
 * @param {*} json - the JS Object for the AST
 * @return {boolean} whether it's a leaf node
 */
function isHtmlNode(json) {
    return (json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') ||
            json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlBlock'));
}

/**
 * Is it a Code Block node?
 * @param {*} json the JS Object for the AST
 * @return {boolean} whether it's a leaf node
 */
function isCodeBlockNode(json) {
    return json.$class === (NS_PREFIX_CommonMarkModel + 'CodeBlock');
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
 * Merge adjacent text nodes in a list of nodes
 * @param {[*]} nodes a list of nodes
 * @returns {*} a new list of nodes with redundant text nodes removed
 */
function mergeAdjacentTextNodes(nodes) {
    if(nodes) {
        const result = [];
        for(let n=0; n < nodes.length; n++) {
            const cur = nodes[n];
            const next = n+1 < nodes.length ? nodes[n+1] : null;

            if(next &&
               cur.$class === (NS_PREFIX_CommonMarkModel + 'Text') &&
               next.$class === (NS_PREFIX_CommonMarkModel + 'Text')) {
                next.text = cur.text + next.text;  // Fold text in next node, skip current node
            }
            else {
                result.push(cur);
            }
        }
        return result;
    }
    else {
        return nodes;
    }
}

/**
 * Merge adjacent Html nodes in a list of nodes
 * @param {[*]} nodes - a list of nodes
 * @param {boolean} tagInfo - whether to extract Html tags
 * @returns {*} a new list of nodes with open/closed Html nodes merged
 */
function mergeAdjacentHtmlNodes(nodes, tagInfo) {
    if(nodes) {
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
            }
            else {
                result.push(cur);
            }
        }
        return result;
    }
    else {
        return nodes;
    }
}

module.exports.toClass = toClass;

module.exports.mkParameters = mkParameters;
module.exports.mkParametersInBlockQuote = mkParametersInBlockQuote;
module.exports.mkParametersInList = mkParametersInList;
module.exports.mkPrefix = mkPrefix;
module.exports.mkSetextHeading = mkSetextHeading;
module.exports.mkATXHeading = mkATXHeading;

module.exports.escapeText = escapeText;
module.exports.escapeCodeBlock = escapeCodeBlock;
module.exports.unescapeCodeBlock = unescapeCodeBlock;

module.exports.isLeafNode = isLeafNode;
module.exports.isHtmlNode = isHtmlNode;
module.exports.isCodeBlockNode = isCodeBlockNode;

module.exports.parseHtmlBlock = parseHtmlBlock;
module.exports.mergeAdjacentTextNodes = mergeAdjacentTextNodes;
module.exports.mergeAdjacentHtmlNodes = mergeAdjacentHtmlNodes;
