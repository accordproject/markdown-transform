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

// const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Converts a commonmark model instance to an html string.
 *
 */
class ToHtmlStringVisitor {

    /**
     * Construct the visitor
     * @param {*} [options] configuration options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Visits a sub-tree and return the html
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @returns {string} the html for the sub tree
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
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        switch(thing.getType()) {
        case 'Clause':
            // {
            //     const ciceroMarkTransformer = new CiceroMarkTransformer();
            //     console.log(JSON.stringify(ciceroMarkTransformer.getSerializer().toJSON(thing), null, 4));
            // }
            parameters.result += `<div class="clause" clauseid="${thing.clauseid}" src="${thing.src}">\n${ToHtmlStringVisitor.visitChildren(this, thing)}</div>\n`;
            break;
        case 'Variable':
            parameters.result += `<div class="variable" id="${thing.id}">${thing.value}</div>\n`;
            break;
        case 'ComputedVariable':
            parameters.result += `<div class="computed>${thing.value}</div>\n`;
            break;
        case 'CodeBlock':
            parameters.result += `<pre><code>\n${thing.text}</pre></code>\n`;
            break;
        case 'Code':
            parameters.result += `<code>${thing.text}</code>`;
            break;
        case 'HtmlInline':
            parameters.result += thing.text;
            break;
        case 'Emph':
            parameters.result += `<emph>${ToHtmlStringVisitor.visitChildren(this, thing)}</emph>`;
            break;
        case 'Strong':
            parameters.result += `<strong>${ToHtmlStringVisitor.visitChildren(this, thing)}</strong>`;
            break;
        case 'BlockQuote': {
            parameters.result += `<blockquote>${ToHtmlStringVisitor.visitChildren(this, thing)}</blockquote>\n`;
        }
            break;
        case 'Heading': {
            const level = parseInt(thing.level);
            parameters.result += `<h${level}>${ToHtmlStringVisitor.visitChildren(this, thing)}</h${level}>\n`;
        }
            break;
        case 'ThematicBreak':
            parameters.result += '\n<hr>\n';
            break;
        case 'Linebreak':
            parameters.result += '<br>\n';
            break;
        case 'Softbreak':
            parameters.result += '\n';
            break;
        case 'Link':
            parameters.result += `<a href="${thing.destination}">${ToHtmlStringVisitor.visitChildren(this, thing)}/>`;
            break;
        case 'Image':
            parameters.result += `<img src="${thing.destination}"/>`;
            break;
        case 'Paragraph':
            parameters.result += `<p>${ToHtmlStringVisitor.visitChildren(this, thing)}</p>\n`;
            break;
        case 'HtmlBlock':
            parameters.result += `${thing.text}`;
            break;
        case 'Text':
            parameters.result += thing.text;
            break;
        case 'List': {
            // Always start with a new line
            parameters.result += '\n';
            if(thing.type === 'ordered') {
                parameters.result += '<ol>';
            }
            else {
                parameters.result += '<ul>';
            }

            thing.nodes.forEach(item => {
                parameters.result += `\n<li>${ToHtmlStringVisitor.visitChildren(this, item)}</li>`;
            });

            if(thing.type === 'ordered') {
                parameters.result += '</ol>';
            }
            else {
                parameters.result += '</ul>';
            }
        }
            break;
        case 'Item':
            parameters.result += `<li>${ToHtmlStringVisitor.visitChildren(this, thing)}</li>\n`;
            break;
        case 'Document':
            parameters.result += `<html>\n<body>\n${ToHtmlStringVisitor.visitChildren(this, thing)}</body>\n</html>`;
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        parameters.first = false;
    }
}

module.exports = ToHtmlStringVisitor;