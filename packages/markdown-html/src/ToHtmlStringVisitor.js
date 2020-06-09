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
            parameters.result += `<div class="clause" name="${thing.name}" src="${thing.src}">\n${ToHtmlStringVisitor.visitChildren(this, thing)}</div>\n`;
            break;
        case 'Variable': {
            parameters.result += `<span class="variable" name="${thing.name}">${thing.value}</span>`;
        }
            break;
        case 'FormattedVariable': {
            parameters.result += `<span class="variable" name="${thing.name}" format="${thing.format}">${thing.value}</span>`;
        }
            break;
        case 'EnumVariable': {
            const enumValues = encodeURIComponent(JSON.stringify(thing.enumValues));
            parameters.result += `<span class="variable" name="${thing.name}" enumValues="${enumValues}">${thing.value}</span>`;
        }
            break;
        case 'Conditional':
            parameters.result += `<span class="conditional" name="${thing.name}" whenTrue="${thing.whenTrue[0] ? thing.whenTrue[0].text : ''}" whenFalse="${thing.whenFalse[0] ? thing.whenFalse[0].text : ''}">${thing.nodes[0].text}</span>`;
            break;
        case 'Formula':
            parameters.result += `<span class="formula" name="${thing.name}">${thing.value}</span>`;
            break;
        case 'CodeBlock': {
            const info = thing.info;
            if (info) {
                parameters.result += `<pre class="code_block"><code data-ciceromark="${encodeURIComponent(thing.info)}">${thing.text}</pre></code>\n`;
            } else {
                parameters.result += `<pre class="code_block"><code>${thing.text}</pre></code>\n`;
            }
        }
            break;
        case 'Code':
            parameters.result += `<code>${thing.text}</code>`;
            break;
        case 'HtmlInline':
            parameters.result += `<span class="html_inline">${thing.text}</span>`;
            break;
        case 'Emph':
            parameters.result += `<em>${ToHtmlStringVisitor.visitChildren(this, thing)}</em>`;
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
            parameters.result += '<br>';
            break;
        case 'Softbreak':
            parameters.result += '\n';
            break;
        case 'Link':
            parameters.result += `<a href="${thing.destination}" title=${thing.title}>${ToHtmlStringVisitor.visitChildren(this, thing)}</a>`;
            break;
        case 'Image':
            parameters.result += `<img src="${thing.destination}" title="${thing.title}"/>`;
            break;
        case 'Paragraph':
            parameters.result += `<p>${ToHtmlStringVisitor.visitChildren(this, thing)}</p>\n`;
            break;
        case 'HtmlBlock':{
            parameters.result += `<pre class="html_block"><code>${thing.text}</pre></code>\n`;
            break;
        }
        case 'Text':
            parameters.result += `${thing.text}`;
            break;
        case 'List': {
            // Always start with a new line
            parameters.result += '\n';
            const { delimiter, start, tight} = thing;
            if(thing.type === 'ordered') {
                parameters.result += `<ol delimiter=${delimiter} start=${start} tight=${tight}>`;
            }
            else {
                parameters.result += `<ul tight=${tight}>`;
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
            parameters.result += `<html>\n<body>\n<div class="document">\n${ToHtmlStringVisitor.visitChildren(this, thing)}</div>\n</body>\n</html>`;
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }
        parameters.first = false;
    }
}

module.exports = ToHtmlStringVisitor;