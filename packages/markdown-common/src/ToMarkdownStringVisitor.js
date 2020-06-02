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
                parametersIn.first = false;
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
        const nodeText = thing.text ? thing.text : '';
        switch(thing.getType()) {
        case 'CodeBlock':
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += `\`\`\`${thing.info ? ' ' + thing.info : ''}\n${CommonMarkUtils.escapeCodeBlock(thing.text)}\`\`\``;
            break;
        case 'Code':
            parameters.result += `\`${nodeText}\``;
            break;
        case 'HtmlInline':
            parameters.result += nodeText;
            break;
        case 'Emph':
            parameters.result += `*${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}*`;
            break;
        case 'Strong':
            parameters.result += `**${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}**`;
            break;
        case 'BlockQuote':
            parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            break;
        case 'Heading': {
            const level = parseInt(thing.level);
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            const headingText = ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            if (level < 3 && headingText !== '') {
                parameters.result += headingText;
                parameters.first = false;
                parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
                parameters.result += CommonMarkUtils.mkSetextHeading(level);
            } else {
                parameters.result += CommonMarkUtils.mkATXHeading(level);
                parameters.result += ' ';
                parameters.result += headingText;
            }
        }
            break;
        case 'ThematicBreak':
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += '---';
            break;
        case 'Linebreak':
            parameters.result += '\\';
            parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
            break;
        case 'Softbreak':
            parameters.result += CommonMarkUtils.mkPrefix(parameters,1);
            break;
        case 'Link':
            parameters.result += `[${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}](${thing.destination} "${thing.title ? thing.title : ''}")`;
            break;
        case 'Image':
            parameters.result += `![${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}](${thing.destination} "${thing.title ? thing.title : ''}")`;
            break;
        case 'Paragraph':
            parameters.result += CommonMarkUtils.mkPrefix(parameters,parameters.first ? 1 : 2);
            parameters.result += `${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}`;
            break;
        case 'HtmlBlock':
            parameters.result += CommonMarkUtils.mkPrefix(parameters,2);
            parameters.result += nodeText;
            break;
        case 'Text':
            parameters.result += CommonMarkUtils.escapeText(nodeText);
            break;
        case 'List': {
            const first = thing.start ? parseInt(thing.start) : 1;
            let index = first;
            thing.nodes.forEach(item => {
                const level = thing.tight && thing.tight === 'false' && index !== first ? 2 : 1;
                if(thing.type === 'ordered') {
                    parameters.result += `${CommonMarkUtils.mkPrefix(parameters,level)}${index}. ${ToMarkdownStringVisitor.visitChildren(this, item, parameters)}`;
                }
                else {
                    parameters.result += `${CommonMarkUtils.mkPrefix(parameters,level)}-  ${ToMarkdownStringVisitor.visitChildren(this, item, parameters)}`;
                }
                index++;
                parameters.first = false;
            });
        }
            break;
        case 'Item': {
            parameters.result += `${CommonMarkUtils.mkPrefix(parameters,1)}-  ${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}`;
        }
            break;
        case 'Document':
            parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        parameters.first = false;
    }
}

module.exports = ToMarkdownStringVisitor;