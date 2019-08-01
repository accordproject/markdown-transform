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

const Markdown = require ('./Markdown');
const NL = '\n';

/**
 * Converts Slate DOM to markdown text
 */
class ToMarkdown extends Markdown {

    /**
     * Constructor
     * @param {*} pluginManager the plugin manager to use
     */
    constructor(pluginManager) {
        super(pluginManager);
        this.stack = [];
        this.first = false;
    }

    /**
     * Converts the document nodes to markdown
     * @param {*} value the Slate value
     * @returns {string} the markdown text
     */
    convert(value) {
        return this.recursive(value.document.nodes);
    }

    /**
     * Process all the nodes and their children
     * @param {*} nodes the Slate nodes
     * @returns {string} the markdown text
     */
    recursive(nodes) {
        let markdown = '';

        nodes.forEach((node, index) => {
            this.stack.push(node);
            this.setFirst(index === 0);

            switch (node.object) {
            case 'text':
                markdown += this.text(node);
                break;
            case 'block':
            case 'inline': {
                const method = Markdown.camelCase(node.type);

                if (typeof this[method] === 'function') {
                    markdown += this[method](node);
                } else {
                    const plugin = this.pluginManager.findPlugin('slate', node.type);

                    if (plugin && typeof plugin.toMarkdown === 'function') {
                        try {
                            markdown += plugin.toMarkdown(this, node, this.stack.length);
                        } catch (err) {
                            // eslint-disable-next-line no-console
                            console.log(`Exception from ${plugin.name}: ${err.message}`);
                        }
                    } else {
                        throw new Error(`Cannot find a handler for ${method} with ${node}`);
                    }
                }
            }
                break;
            default:
            }

            this.stack.pop();
        });

        return markdown;
    }

    /**
     * Returns the parent node from the stack, or null
     * @returns {*} the parent node or null
     */
    getParent() {
        if (!this.stack || this.stack.length < 1) {
            return null;
        }

        return this.stack[this.stack.length - 2];
    }

    /**
     * Sets the first flag
     * @param {boolean} first the first flag
     */
    setFirst(first) {
        this.first = first;
    }

    /**
     * Returns true if the 'first' flag is set
     * @returns {boolean} true if the first flag is set
     */
    isFirst() {
        return this.first;
    }

    /**
     * Handles the Slate paragraph block
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    paragraph(node) {
        let prefix = `${NL}${NL}`;
        const parent = this.getParent();

        if (parent) {
            if (parent.type === 'code_block' || parent.type === ('list_item')) {
                prefix = NL;
            }
        }

        if (this.isFirst()) {
            prefix = '';
        }

        return `${prefix}${this.recursive(node.nodes)}`;
    }

    /**
     * Extracts the text from the first child node
     * @param {*} node slate node
     * @returns {string} the text for the node
     */
    static getTextFromNode(node) {
        return node.nodes[0].text;
    }

    /**
     * Handles the Slate link node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    link(node) {
        return `[${ToMarkdown.getTextFromNode(node)}](${node.data.href})`;
    }

    /**
     * Handles the Slate hr node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    horizontalRule(node) {
        return `${NL}${NL}---`;
    }

    /**
     * Handles the Slate block quote node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    blockQuote(node) {
        return `${NL}> ${this.recursive(node.nodes)}`;
    }

    /**
     * Handles the Slate h1 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingOne(node) {
        return `${NL}${NL}# ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate h2 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingTwo(node) {
        return `${NL}${NL}## ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate h3 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingThree(node) {
        return `${NL}${NL}### ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate h4 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingFour(node) {
        return `${NL}${NL}#### ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate h5 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingFive(node) {
        return `${NL}${NL}##### ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate h6 node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    headingSix(node) {
        return `${NL}${NL}###### ${ToMarkdown.getTextFromNode(node)}`;
    }

    /**
     * Handles the Slate html block node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    htmlBlock(node) {
        return NL + NL + this.recursive(node.nodes);
    }

    /**
     * Handles the Slate html inline node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    htmlInline(node) {
        return this.recursive(node.nodes);
    }

    /**
     * Handles the Slate code block node
     * @param {*} node slate node
     * @returns {string} markdown text
     */
    codeBlock(node) {
    // eslint-disable-next-line no-useless-escape
        const quote = '\`\`\`';
        const md = this.recursive(node.nodes);
        return quote + NL + md + quote;
    }

    /**
     * Handles a text node
     * @param {*} node the slate text node
     * @returns {string} the markdown text
     */
    text(node) {
        let result = '';

        const isBold = node.marks.some(mark => mark.type === 'bold');
        const isItalic = node.marks.some(mark => mark.type === 'italic');
        const isUnderline = node.marks.some(mark => mark.type === 'underline');
        const isCode = node.marks.some(mark => mark.type === 'code');
        let openMark = '';
        let closeMark = '';

        if (isBold) {
            openMark = '**';
            closeMark = '**';
        }

        if (isItalic) {
            openMark += '*';
            closeMark += '*';
        }

        if (isUnderline) {
            openMark += '__';
            closeMark += '__';
        }

        if (isCode) {
            openMark += '`';
            closeMark += '`';
        }

        result += openMark + node.text + closeMark;

        return result;
    }
}

module.exports = ToMarkdown;
