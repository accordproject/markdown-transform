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

const CommonMarkUtils = require('./CommonMarkUtils');

/**
 * Converts a CommonMark DOM to a markdown string.
 *
 * Note that there are multiple ways of representing the same CommonMark DOM as text,
 * so this transformation is not guaranteed to equivalent if you roundtrip
 * markdown content. For example an H1 can be specified using either '#' or '='
 * notation.
 *
 * The resulting AST *should* be equivalent however.
 */
class ToMarkdownStringVisitor {
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Visits a sub-tree and return the markdown
     * @param {*} visitor - the visitor to use
     * @param {*} thing - the node to visit
     * @param {*} parameters - the current parameters
     * @returns {string} the markdown for the sub tree
     */
    static visitChildren(visitor, thing, parameters) {
        const parametersIn = CommonMarkUtils.mkParameters(thing, parameters);
        if(thing.nodes) {
            thing.nodes.forEach(node => {
                node.accept(visitor, parametersIn);
                CommonMarkUtils.nextNode(parametersIn);
            });
        }
        return parametersIn.result;
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        switch(thing.getType()) {
        // Inlines
        case 'Code': {
            const nodeText = thing.text ? thing.text : '';
            parameters.result += `\`${nodeText}\``;
        }
            break;
        case 'Emph': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += `*${children}*`;
        }
            break;
        case 'Strong': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += `**${children}**`;
        }
            break;
        case 'Link': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += `[${children}](${thing.destination} "${thing.title ? thing.title : ''}")`;
        }
            break;
        case 'Image': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += `![${children}](${thing.destination} "${thing.title ? thing.title : ''}")`;
        }
            break;
        case 'HtmlInline': {
            const nodeText = thing.text ? thing.text : '';
            parameters.result += nodeText;
        }
            break;
        case 'Linebreak': {
            parameters.result += '\\';
            parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
        }
            break;
        case 'Softbreak': {
            parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
        }
            break;
        case 'Text': {
            const nodeText = thing.text ? thing.text : '';
            parameters.result += CommonMarkUtils.escapeText(nodeText);
        }
            break;
        // Leaf blocks
        case 'ThematicBreak': {
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += '---';
        }
            break;
        case 'Heading': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            const level = parseInt(thing.level);
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            if (level < 3 && children !== '') {
                parameters.result += children;
                CommonMarkUtils.nextNode(parameters);
                parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
                parameters.result += CommonMarkUtils.mkSetextHeading(level);
            } else {
                parameters.result += CommonMarkUtils.mkATXHeading(level);
                parameters.result += ' ';
                parameters.result += children;
            }
        }
            break;
        case 'CodeBlock': {
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += `\`\`\`${thing.info ? ' ' + thing.info : ''}\n${CommonMarkUtils.escapeCodeBlock(thing.text)}\`\`\``;
        }
            break;
        case 'HtmlBlock': {
            const nodeText = thing.text ? thing.text : '';
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += nodeText;
        }
            break;
        case 'Paragraph': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += CommonMarkUtils.mkPrefix(parameters,parameters.first ? 1 : 2);
            parameters.result += `${children}`;
        }
            break;
        // Container blocks
        case 'BlockQuote': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += children;
        }
            break;
        case 'Item': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += `${CommonMarkUtils.mkPrefix(parameters,1)}-  ${children}`;
        }
            break;
        case 'List': {
            const firstIndex = thing.start ? parseInt(thing.start) : 1;
            let index = firstIndex;
            thing.nodes.forEach(item => {
                const children = ToMarkdownStringVisitor.visitChildren(this, item, parameters);
                const level = thing.tight && thing.tight === 'false' && index !== firstIndex ? 2 : 1;
                if(thing.type === 'ordered') {
                    parameters.result += `${CommonMarkUtils.mkPrefix(parameters,level)}${index}. ${children}`;
                }
                else {
                    parameters.result += `${CommonMarkUtils.mkPrefix(parameters,level)}-  ${children}`;
                }
                index++;
                CommonMarkUtils.nextNode(parameters);
            });
        }
            break;
        case 'Document': {
            const children = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            parameters.result += children;
        }
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        CommonMarkUtils.nextNode(parameters);
    }
}

module.exports = ToMarkdownStringVisitor;