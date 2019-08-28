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
 * Converts a commonmark model instance to a markdown string.
 *
 * Note that there are several ways of representing the same markdown AST as text,
 * so this transformation is not guaranteed to equivalent if you roundtrip
 * markdown content. The resulting AST *should* be equivalent however.
 */
class ToStringVisitor {

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
     */
    static newParagraph(parameters) {
        if (!parameters.first) {
            parameters.result += '\n\n';
        }
    }

    /**
     * Prints a new list if not first
     * @param {*} parameters - the current parameters
     */
    static newList(parameters) {
        if (!parameters.first) {
            parameters.result += '\n';
        }
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        switch(thing.getType()) {
        case 'CodeBlock':
            parameters.result += `\`\`\` ${thing.info ? thing.info : ''}\n${thing.text}\`\`\`\n\n`;
            break;
        case 'Code':
            parameters.result += `\`${thing.text}\``;
            break;
        case 'HtmlInline':
            parameters.result += thing.text;
            break;
        case 'Emph':
            parameters.result += `*${ToStringVisitor.visitChildren(this, thing)}*`;
            break;
        case 'Strong':
            parameters.result += `**${ToStringVisitor.visitChildren(this, thing)}**`;
            break;
        case 'BlockQuote': {
            const parametersIn = ToStringVisitor.mkParametersIn(parameters);
            ToStringVisitor.newParagraph(parameters);
            parameters.result += `> ${ToStringVisitor.visitChildren(this, thing, parametersIn)}`;
        }
            break;
        case 'Heading': {
            const level = parseInt(thing.level);
            if (level < 3) {
                parameters.result += `${ToStringVisitor.visitChildren(this, thing)}\n${ToStringVisitor.mkSetextHeading(level)}\n`;
            } else {
                parameters.result += `${ToStringVisitor.mkATXHeading(level)} ${ToStringVisitor.visitChildren(this, thing)}\n`;
            }
        }
            break;
        case 'ThematicBreak':
            ToStringVisitor.newParagraph(parameters);
            parameters.result += '---\n';
            break;
        case 'Linebreak':
            parameters.result += '\\\n';
            break;
        case 'Softbreak':
            parameters.result += '\n';
            break;
        case 'Link':
            parameters.result += `[${ToStringVisitor.visitChildren(this, thing)}](${thing.destination})`;
            break;
        case 'Image':
            parameters.result += `![${ToStringVisitor.visitChildren(this, thing)}](${thing.destination})`;
            break;
        case 'Paragraph':
            ToStringVisitor.newParagraph(parameters);
            parameters.result += `${ToStringVisitor.visitChildren(this, thing)}`;
            break;
        case 'HtmlBlock':
            ToStringVisitor.newParagraph(parameters);
            parameters.result += `${thing.text}`;
            break;
        case 'Text':
            parameters.result += thing.text;
            break;
        case 'List': {
            let index = thing.start ? parseInt(thing.start) : 1;
            ToStringVisitor.newList(parameters);
            thing.nodes.forEach(item => {
                const parametersIn = ToStringVisitor.mkParametersInList(parameters);
                if(thing.type === 'ordered') {
                    parameters.result += `${ToStringVisitor.mkIndent(parameters)}${index++}. ${ToStringVisitor.visitChildren(this, item, parametersIn)}\n`;
                }
                else {
                    parameters.result += `${ToStringVisitor.mkIndent(parameters)}- ${ToStringVisitor.visitChildren(this, item, parametersIn)}\n`;
                }
                if(thing.tight === 'false') {
                    parameters.result += '\n';
                }
            });
            if(thing.tight !== 'false') {
                parameters.result += '\n';
            }
        }
            break;
        case 'Item':
            if(parameters.type === 'ordered') {
                parameters.result += '${ToStringVisitor.mkIndent(parameters)}$1. ';
            }
            else {
                parameters.result += '${ToStringVisitor.mkIndent(parameters)}- ';
            }
            parameters.result += ToStringVisitor.visitChildren(this, thing);
            break;
        case 'Document':
            parameters.result += ToStringVisitor.visitChildren(this, thing);
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        parameters.first = false;
    }
}

module.exports = ToStringVisitor;