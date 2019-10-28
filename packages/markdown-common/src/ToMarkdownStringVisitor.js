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
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Visits a sub-tree and return the markdown
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @returns {string} the markdown for the sub tree
     */
    static visitChildren(visitor, thing, parameters) {
        if(!parameters) {
            parameters = {};
            parameters.result = '';
            parameters.first = false;
            parameters.indent = 0;
        }

        if(thing.nodes) {
            thing.nodes.forEach(node => {
                node.accept(visitor, parameters);
            });
        }

        return parameters.result;
    }

    /**
     * Set parameters for inner node
     * @param {*} parametersOut - the current parameters
     * @return {*} the new parameters with first set to true
     */
    static mkParametersIn(parametersOut) {
        let parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = parametersOut.indent; // Same indentation
        return parameters;
    }

    /**
     * Set parameters for inner list
     * @param {*} parametersOut - the current parameters
     * @return {*} the new parameters with first set to true
     */
    static mkParametersInList(parametersOut) {
        let parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = parametersOut.indent+1; // Increases indentation
        return parameters;
    }

    /**
     * Create indendation
     * @param {*} parameters - the current parameters
     * @return {string} whitespace for indentation
     */
    static mkIndent(parameters) {
        return new Array(parameters.indent*3+1).join(' ');
    }

    /**
     * Create Setext heading
     * @param {number} level - the heading level
     * @return {string} the markup for the heading
     */
    static mkSetextHeading(level) {
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
    static mkATXHeading(level) {
        return Array(level).fill('#').join('');
    }

    /**
     * Prints a new paragraph if not first
     * @param {*} parameters - the current parameters
     * @param {*} level - number of new lines
     */
    static newBlock(parameters,level) {
        const newlines = parameters.first ? '' : Array(level).fill('\n').join('');
        parameters.result += newlines;
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        switch(thing.getType()) {
        case 'CodeBlock':
            ToMarkdownStringVisitor.newBlock(parameters,2);
            parameters.result += `\`\`\`${thing.info ? ' ' + thing.info : ''}\n${thing.text}\`\`\`\n\n`;
            break;
        case 'Code':
            parameters.result += `\`${thing.text}\``;
            break;
        case 'HtmlInline':
            parameters.result += thing.text;
            break;
        case 'Emph':
            parameters.result += `*${ToMarkdownStringVisitor.visitChildren(this, thing)}*`;
            break;
        case 'Strong':
            parameters.result += `**${ToMarkdownStringVisitor.visitChildren(this, thing)}**`;
            break;
        case 'BlockQuote': {
            const parametersIn = ToMarkdownStringVisitor.mkParametersIn(parameters);
            ToMarkdownStringVisitor.newBlock(parameters,2);
            parameters.result += `> ${ToMarkdownStringVisitor.visitChildren(this, thing, parametersIn)}`;
        }
            break;
        case 'Heading': {
            ToMarkdownStringVisitor.newBlock(parameters,2);
            const level = parseInt(thing.level);
            if (level < 3) {
                parameters.result += `${ToMarkdownStringVisitor.visitChildren(this, thing)}\n${ToMarkdownStringVisitor.mkSetextHeading(level)}`;
            } else {
                parameters.result += `${ToMarkdownStringVisitor.mkATXHeading(level)} ${ToMarkdownStringVisitor.visitChildren(this, thing)}`;
            }
        }
            break;
        case 'ThematicBreak':
            ToMarkdownStringVisitor.newBlock(parameters,2);
            parameters.result += '---';
            break;
        case 'Linebreak':
            parameters.result += '\\\n';
            break;
        case 'Softbreak':
            parameters.result += '\n';
            break;
        case 'Link':
            parameters.result += `[${ToMarkdownStringVisitor.visitChildren(this, thing)}](${thing.destination})`;
            break;
        case 'Image':
            parameters.result += `![${ToMarkdownStringVisitor.visitChildren(this, thing)}](${thing.destination})`;
            break;
        case 'Paragraph':
            ToMarkdownStringVisitor.newBlock(parameters,2);
            parameters.result += `${ToMarkdownStringVisitor.visitChildren(this, thing)}`;
            break;
        case 'HtmlBlock':
            ToMarkdownStringVisitor.newBlock(parameters,2);
            parameters.result += `${thing.text}`;
            break;
        case 'Text':
            parameters.result += thing.text;
            break;
        case 'List': {
            const first = thing.start ? parseInt(thing.start) : 1;
            let index = first;
            // Always start with a new line
            parameters.result += '\n';
            thing.nodes.forEach(item => {
                const parametersIn = ToMarkdownStringVisitor.mkParametersInList(parameters);
                if(thing.tight === 'false' && index !== first) {
                    parameters.result += '\n';
                }
                if(thing.type === 'ordered') {
                    parameters.result += `\n${ToMarkdownStringVisitor.mkIndent(parameters)}${ this.options.noIndex ? 1 : index}. ${ToMarkdownStringVisitor.visitChildren(this, item, parametersIn)}`;
                }
                else {
                    parameters.result += `\n${ToMarkdownStringVisitor.mkIndent(parameters)}- ${ToMarkdownStringVisitor.visitChildren(this, item, parametersIn)}`;
                }
                index++;
            });
        }
            break;
        case 'Item':
            throw new Error('Item node should not occur outside of List nodes');
        case 'Document':
            parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing);
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        parameters.first = false;
    }
}

module.exports = ToMarkdownStringVisitor;