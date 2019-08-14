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
 * Visits a sub-tree and return the markdown
 * @param {*} visitor the visitor to use
 * @param {*} thing the node to visit
 * @param {*} [parameters] optional parameters
 * @returns {string} the markdown for the sub tree
 */
function visitChildren(visitor, thing, parameters) {
    if(!parameters) {
        parameters = {};
        parameters.result = '';
    }

    if(thing.nodes) {
        thing.nodes.forEach(node => {
            node.accept(visitor, parameters);
        });
    }

    return parameters.result;
}

/**
 * Converts a commonmark model instance to a markdown string
 */
class ToStringVisitor {

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        switch(thing.getType()) {
        case 'CodeBlock':
            parameters.result += `\`\`\` ${thing.info ? thing.info : ''}\n${thing.text}  \`\`\`\n\n`;
            break;
        case 'Code':
            parameters.result += `\`${thing.text}\``;
            break;
        case 'HtmlInline':
            parameters.result += thing.text;
            break;
        case 'Emph':
            parameters.result += `*${visitChildren(this, thing)}*`;
            break;
        case 'Strong':
            parameters.result += `**${visitChildren(this, thing)}**`;
            break;
        case 'BlockQuote':
            parameters.result += `> ${visitChildren(this, thing)}`;
            break;
        case 'Heading':
            parameters.result += `${Array(parseInt(thing.level)).fill('#').join('')} ${visitChildren(this, thing)}\n`;
            break;
        case 'ThematicBreak':
            parameters.result += '---\n';
            break;
        case 'Link':
            parameters.result += `[${visitChildren(this, thing)}](${thing.destination})`;
            break;
        case 'Paragraph':
            parameters.result += `${visitChildren(this, thing)}\n\n`;
            break;
        case 'HtmlBlock':
            parameters.result += `${thing.text}\n\n`;
            break;
        case 'Text':
            parameters.result += thing.text;
            break;
        case 'List': {
            let index = thing.start ? parseInt(thing.start) : 0;
            thing.nodes.forEach(item => {
                if(thing.type === 'ordered') {
                    parameters.result += `${index++}. ${visitChildren(this, item.nodes[0])}\n`;
                }
                else {
                    parameters.result += `* ${visitChildren(this, item.nodes[0])}\n`;
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
                parameters.result += '1. ';
            }
            else {
                parameters.result += '* ';
            }
            parameters.result += visitChildren(this, thing);
            break;
        case 'Document':
            parameters.result += visitChildren(this, thing);
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
    }
}

/**
 * Converts a commonmark document to a markdown string
 * @param {*} concertoObject concerto commonmark object
 * @returns {string} the markdown string
 */
function commonmarkToString(concertoObject) {
    const parameters = {};
    parameters.result = '';
    const visitor = new ToStringVisitor();
    concertoObject.accept( visitor, parameters );
    return parameters.result;
}

module.exports = commonmarkToString;