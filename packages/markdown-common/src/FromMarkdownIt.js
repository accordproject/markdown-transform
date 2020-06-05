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
const { unescapeCodeBlock, parseHtmlBlock, mergeAdjacentHtmlNodes, headingLevel, getAttr, trimEndline } = require('./CommonMarkUtils');
const commonrules = require('./commonrules');

/**
 * Converts a markdown-it token stream to a CommonMark DOM
 */
class FromMarkdownIt {
    /**
     * Construct the transformer
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     */
    constructor(rules) {
        this.rules = commonrules;
        if (rules) {
            this.rules.inlines = Object.assign(this.rules.inlines,rules.inlines);
            this.rules.blocks = Object.assign(this.rules.blocks,rules.blocks);
        }
    }

    /**
     * Create a callback for inlines
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @returns {*} the callback
     */
    static inlineCallback(rules) {
        return (tokens) => FromMarkdownIt.inlineToCommonMark(rules,tokens);
    }

    /**
     * Process an inline node to CommonMark DOM
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @param {*} tokens - the content of the inline node
     * @returns {*} the CommonMark nodes
     */
    static inlineToCommonMark(rules,tokens) {
        let stack = new Stack();
        const rootNode = {
            '$class': 'org.accordproject.commonmark.Inline',
            'nodes': [],
        };
        stack.push(rootNode,false);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const rule = rules.inlines[token.type];
            if (!rule) {
                throw new Error('Unknown inline type ' + token.type);
            }
            if (rule.leaf) {
                const node = { $class: rule.tag };
                if (rule.enter) { rule.enter(node,token,FromMarkdownIt.inlineCallback(rules)); }
                if (!(rule.skipEmpty && node.text === '')) {
                    stack.append(node);
                }
            } else if (rule.open && rule.close) {
                const node = { $class: rule.tag };
                if (rule.enter) { rule.enter(node,token,FromMarkdownIt.inlineCallback(rules)); }
                stack.append(node);
            } else if (rule.open) {
                const node = { $class: rule.tag };
                if (rule.enter) { rule.enter(node,token,FromMarkdownIt.inlineCallback(rules)); }
                node.nodes = [];
                stack.push(node, true);
            } else if (rule.close) {
                const node = stack.pop();
                if (rule.exit) { rule.exit(node,token,FromMarkdownIt.inlineCallback(rules)); }
            }
        }

        return mergeAdjacentHtmlNodes(rootNode.nodes,true);
    }

    /**
     * Transform a block token stream to CommonMark DOM
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @param {*} tokens - the markdown-it token stream
     * @returns {*} the CommonMark nodes
     */
    static blockToCommonMark(rules,tokens) {
        let stack = new Stack();
        let tight = new Stack();
        const rootNode = {
            '$class': 'org.accordproject.commonmark.Document',
            'xmlns' : 'http://commonmark.org/xml/1.0',
            'nodes': [],
        };
        stack.push(rootNode,false);
        tight.push({tight:'true'},false);

        for(let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Special purpose to recover tight v loose information in list nodes
            if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
                tight.push({tight:'true'},false);
            } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
                const isTight = tight.pop();
                const listNode = stack.peek();
                listNode.tight = isTight.tight;
            } else if (token.type === 'paragraph_open' && !token.hidden) {
                tight.peek().tight = 'false';
            }

            switch(token.type) {
            case 'inline': {
                const currentNode = stack.peek();
                if (currentNode) {
                    currentNode.nodes = FromMarkdownIt.inlineCallback(rules)(token.children);
                } else {
                    throw new Error('Malformed token stream: no current node');
                }
            }
                break;
            case 'code_block':
            case 'fence': {
                const info = token.info.trim();
                const newNode = {
                    '$class': 'org.accordproject.commonmark.CodeBlock',
                    'info': info ? info : null,
                    'tag': parseHtmlBlock(info),
                    'text': token.content ? unescapeCodeBlock(token.content) : null,
                };
                stack.append(newNode);
            }
                break;
            case 'html_block': {
                const content = trimEndline(token.content);
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
                stack.push(newNode);
            }
                break;
            case 'heading_open':{
                const newNode = {
                    '$class': 'org.accordproject.commonmark.Heading',
                    'level': headingLevel(token.tag),
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
                    'tight': 'true', // XXX Default but can be overridden when closing the list tag
                    'nodes': [],
                };
                stack.push(newNode);
            }
                break;
            case 'ordered_list_open':{
                const newNode = {
                    '$class': 'org.accordproject.commonmark.List',
                    'type': 'ordered',
                    'start': getAttr(token.attrs,'start','1'),
                    'tight': 'true', // XXX Default but can be overridden when closing the list tag
                    'delimiter': token.markup === ')' ? 'paren' : 'period',
                    'nodes': [],
                };
                stack.push(newNode);
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
            case 'bullet_list_close':
            case 'ordered_list_close':
            case 'list_item_close': {
                let currentNode = stack.pop();
                if (token.type !== 'paragraph_close') {
                    if (currentNode.nodes.length === 0) {
                        delete currentNode.nodes;
                    }
                }
            }
                break;
            default: {
                throw new Error('Unknown block type: ' + token.type);
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

    /**
     * Transform a token stream to CommonMark DOM
     *
     * @param {*} tokens - the markdown-it token stream
     * @returns {*} the CommonMark nodes
     */
    toCommonMark(tokens) {
        return FromMarkdownIt.blockToCommonMark(this.rules,tokens);
    }

}

module.exports = FromMarkdownIt;
