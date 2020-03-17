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
     * @param {*} visitor - the visitor to use
     * @param {*} thing - the node to visit
     * @param {*} parameters - the current parameters
     * @param {*} paramsFun - function to construct the parameters for children
     * @returns {string} the markdown for the sub tree
     */
    static visitChildren(visitor, thing, parameters, paramsFun) {
        const paramsFunActual = paramsFun ? paramsFun : ToMarkdownStringVisitor.mkParameters;
        const parametersIn = paramsFunActual(parameters);
        if(thing.nodes) {
            thing.nodes.forEach(node => {
                node.accept(visitor, parametersIn);
                parametersIn.first = false;
            });
        }
        return parametersIn.result;
    }

    /**
     * Set parameters for general blocks
     * @param {*} parametersOut - the current parameters
     * @return {*} the new parameters with block quote level incremented
     */
    static mkParameters(parametersOut) {
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
    static mkParametersInBlockQuote(parametersOut) {
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
    static mkParametersInList(parametersOut) {
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
    static mkPrefix(parameters, newlines) {
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
     * Adding escapes for code blocks
     * @param {string} input - unescaped
     * @return {string} escaped
     */
    static escapeCodeBlock(input) {
        return input.replace(/`/g, '\\`');
    }

    /**
     * Adding escapes for text nodes
     * @param {string} input - unescaped
     * @return {string} escaped
     */
    static escapeText(input) {
        return input.replace(/[*`&]/g, '\\$&') // Replaces special characters
            .replace(/^(#+) /g, '\\$1 ') // Replaces heading markers
            .replace(/^(\d+)\. /g, '$1\\. ') // Replaces ordered lists markers
            .replace(/^- /g, '\\- '); // Replaces unordered lists markers
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
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,2);
            parameters.result += `\`\`\`${thing.info ? ' ' + thing.info : ''}\n${ToMarkdownStringVisitor.escapeCodeBlock(thing.text)}\`\`\``;
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
            parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing, parameters, ToMarkdownStringVisitor.mkParametersInBlockQuote);
            break;
        case 'Heading': {
            const level = parseInt(thing.level);
            if (level < 3) {
                parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,2);
                parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
                parameters.first = false;
                parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,1);
                parameters.result += ToMarkdownStringVisitor.mkSetextHeading(level);
            } else {
                parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,2);
                parameters.result += ToMarkdownStringVisitor.mkATXHeading(level);
                parameters.result += ' ';
                parameters.result += ToMarkdownStringVisitor.visitChildren(this, thing, parameters);
            }
        }
            break;
        case 'ThematicBreak':
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,2);
            parameters.result += '---';
            break;
        case 'Linebreak':
            parameters.result += '\\';
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,1);
            break;
        case 'Softbreak':
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,1);
            break;
        case 'Link':
            parameters.result += `[${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}](${thing.destination} "${thing.title ? thing.title : ''}")`;
            break;
        case 'Image':
            parameters.result += `![${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}](${thing.destination} "${thing.title ? thing.title : ''}")`;
            break;
        case 'Paragraph':
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,parameters.first ? 1 : 2);
            parameters.result += `${ToMarkdownStringVisitor.visitChildren(this, thing, parameters)}`;
            break;
        case 'HtmlBlock':
            parameters.result += ToMarkdownStringVisitor.mkPrefix(parameters,2);
            parameters.result += nodeText;
            break;
        case 'Text':
            parameters.result += ToMarkdownStringVisitor.escapeText(nodeText);
            break;
        case 'List': {
            const first = thing.start ? parseInt(thing.start) : 1;
            let index = first;
            thing.nodes.forEach(item => {
                const level = thing.tight && thing.tight === 'false' ? 2 : 1;
                if(thing.type === 'ordered') {
                    parameters.result += `${ToMarkdownStringVisitor.mkPrefix(parameters,level)}${ this.options.noIndex ? 1 : index}. ${ToMarkdownStringVisitor.visitChildren(this, item, parameters, ToMarkdownStringVisitor.mkParametersInList)}`;
                }
                else {
                    parameters.result += `${ToMarkdownStringVisitor.mkPrefix(parameters,level)}-  ${ToMarkdownStringVisitor.visitChildren(this, item, parameters, ToMarkdownStringVisitor.mkParametersInList)}`;
                }
                index++;
                parameters.first = false;
            });
        }
            break;
        case 'Item':
            // we can hit this case with malformed html
            {
                parameters.result += `${ToMarkdownStringVisitor.mkPrefix(parameters,1)}-  ${ToMarkdownStringVisitor.visitChildren(this, thing, parameters, ToMarkdownStringVisitor.mkParametersInList)}`;
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