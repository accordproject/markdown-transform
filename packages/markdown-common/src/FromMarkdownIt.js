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

const Stack = require('./Stack');
const parseHtmlBlock = require('./CommonMarkUtils').parseHtmlBlock;
const mergeAdjacentHtmlNodes = require('./CommonMarkUtils').mergeAdjacentHtmlNodes;
const unescapeCodeBlock = require('./CommonMarkUtils').unescapeCodeBlock;
const NS_PREFIX_CommonMarkModel = require('./externalModels/CommonMarkModel').NS_PREFIX_CommonMarkModel;

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
    case 'h6' : return '6';
    default:
        throw new Error('Unknown heading tag: ' + tag);
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

const inlineMap = {
    'text': { 'tag': NS_PREFIX_CommonMarkModel + 'Text', leaf: true },
    'code_inline': { 'tag': NS_PREFIX_CommonMarkModel + 'Code', leaf: true },
    'softbreak': { 'tag': NS_PREFIX_CommonMarkModel + 'Softbreak', leaf: true },
    'hardbreak': { 'tag': NS_PREFIX_CommonMarkModel + 'Linebreak', leaf: true },
    'html_inline': { 'tag': NS_PREFIX_CommonMarkModel + 'HtmlInline', leaf: true },
    'strong_open': { 'tag': NS_PREFIX_CommonMarkModel + 'Strong', leaf: false, open: true },
    'strong_close': { 'tag': NS_PREFIX_CommonMarkModel + 'Strong', leaf: false, open: false },
    'em_open': { 'tag': NS_PREFIX_CommonMarkModel + 'Emph', leaf: false, open: true },
    'em_close': { 'tag': NS_PREFIX_CommonMarkModel + 'Emph', leaf: false, open: false },
    'link_open': { 'tag': NS_PREFIX_CommonMarkModel + 'Link', leaf: false, open: true },
    'link_close': { 'tag': NS_PREFIX_CommonMarkModel + 'Link', leaf: false, open: false },
    'image': { 'tag': NS_PREFIX_CommonMarkModel + 'Image', leaf: false, openclosed: true },
};

/**
 * Process an inline node to CommonMark DOM
 *
 * @param {*} children - the content of the inline node
 * @returns {*} the CommonMark nodes
 */
function inlineToCommonMark(children) {
    let stack = new Stack();
    const rootNode = {
        '$class': 'org.accordproject.commonmark.Inline',
        'nodes': [],
    };
    stack.push(rootNode,false);
    for (let i = 0; i < children.length; i++) {
        const currentChild = children[i];
        const inlineDesc = inlineMap[currentChild.type];
        if (!inlineDesc) {
            throw new Error('Unknown inline type ' + currentChild.type);
        }
        if (inlineDesc.leaf) {
            const newNode = {
                '$class': inlineDesc.tag,
                'text': currentChild.content,
            };
            if (currentChild.type === 'softbreak' || currentChild.type === 'hardbreak') {
                delete newNode.text;
            }
            if (currentChild.type === 'html_inline') {
                newNode.tag = parseHtmlBlock(currentChild.content);
            }
            if (!(newNode.$class === NS_PREFIX_CommonMarkModel + 'Text' && newNode.text === '')) {
                stack.append(newNode);
            }
        } else if (inlineDesc.open) {
            const newNode = {
                '$class': inlineDesc.tag,
                'nodes': [],
            };
            if (currentChild.type === 'link_open') {
                newNode.destination = getAttr(currentChild.attrs,'href','');
                newNode.title = getAttr(currentChild.attrs,'title','');
            }
            stack.push(newNode, true);
        } else if (inlineDesc.openclosed) {
            const newNode = {
                '$class': inlineDesc.tag,
                'nodes': [],
            };
            if (currentChild.type === 'image') {
                newNode.destination = getAttr(currentChild.attrs,'src','');
                newNode.title = getAttr(currentChild.attrs,'title','');
                newNode.nodes = inlineToCommonMark(currentChild.children);
            }
            stack.append(newNode);
        } else {
            stack.pop();
        }
    }

    return mergeAdjacentHtmlNodes(rootNode.nodes,true);
}

/**
 * Transform a token stream to CommonMark DOM
 *
 * @param {*} tokenStream - the markdown-it token stream
 * @returns {*} the CommonMark nodes
 */
function toCommonMark(tokenStream) {
    let stack = new Stack();
    let tight = new Stack();
    const rootNode = {
        '$class': 'org.accordproject.commonmark.Document',
        'xmlns' : 'http://commonmark.org/xml/1.0',
        'nodes': [],
    };
    stack.push(rootNode,false);
    tight.push({tight:'true'},false);
    for(let i = 0; i < tokenStream.length; i++) {
        const currentToken = tokenStream[i];
        switch(currentToken.type) {
        case 'inline': {
            const currentNode = stack.peek();
            if (currentNode) {
                currentNode.nodes = inlineToCommonMark(currentToken.children);
            } else {
                throw new Error('Malformed token stream: no current node');
            }
        }
            break;
        case 'code_block':
        case 'fence': {
            const info = currentToken.info.trim();
            const newNode = {
                '$class': 'org.accordproject.commonmark.CodeBlock',
                'info': info ? info : null,
                'tag': parseHtmlBlock(info),
                'text': currentToken.content ? unescapeCodeBlock(currentToken.content) : null,
            };
            stack.append(newNode);
        }
            break;
        case 'html_block': {
            const content = trimEndline(currentToken.content);
            const newNode = {
                '$class': 'org.accordproject.commonmark.HtmlBlock',
                'tag': parseHtmlBlock(content),
                'text': content
            };
            stack.append(newNode);
        }
            break;
        case 'hr': {
            const newNode = {
                '$class': 'org.accordproject.commonmark.ThematicBreak',
            };
            stack.append(newNode);
        }
            break;
        case 'paragraph_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.Paragraph',
                'nodes': [],
            };
            if (!currentToken.hidden) {
                tight.peek().tight = 'false';
            }
            stack.push(newNode);
        }
            break;
        case 'heading_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.Heading',
                'level': headingLevel(currentToken.tag),
                'nodes': [],
            };
            stack.push(newNode);
        }
            break;
        case 'blockquote_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.BlockQuote',
                'nodes': [],
            };
            stack.push(newNode);
        }
            break;
        case 'bullet_list_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.List',
                'type': 'bullet',
                'tight': 'true',
                'nodes': [],
            };
            stack.push(newNode);
            tight.push({tight:'true'},false);
        }
            break;
        case 'ordered_list_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.List',
                'type': 'ordered',
                'start': getAttr(currentToken.attrs,'start','1'),
                'tight': 'true',
                'delimiter': currentToken.markup === ')' ? 'paren' : 'period',
                'nodes': [],
            };
            stack.push(newNode);
            tight.push({tight:'true'},false);
        }
            break;
        case 'list_item_open':{
            const newNode = {
                '$class': 'org.accordproject.commonmark.Item',
                'nodes': [],
            };
            stack.push(newNode);
        }
            break;
        case 'paragraph_close':
        case 'heading_close':
        case 'blockquote_close':
        case 'list_item_close': {
            let currentNode = stack.pop();
            if (currentToken.type !== 'paragraph_close') {
                if (currentNode.nodes.length === 0) {
                    delete currentNode.nodes;
                }
            }
        }
            break;
        case 'bullet_list_close':
        case 'ordered_list_close': {
            stack.pop().tight = tight.pop().tight;
        }
            break;
        default: {
            throw new Error('Unknown block type: ' + currentToken.type);
        }
        }
    }
    if (!rootNode.nodes || rootNode.nodes.length === 0) {
        rootNode.nodes.push({
            '$class': 'org.accordproject.commonmark.Paragraph',
            'nodes': [ { '$class': 'org.accordproject.commonmark.Text', 'text': '' } ]
        });
    }
    return rootNode;
}

module.exports = toCommonMark;
