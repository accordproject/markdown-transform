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

const { Decorators } = require('@accordproject/markdown-cicero');
const {
    handleFormattedText,
    getHeadingType,
    unquoteString,
} = require('./pdfmakeutil');

/**
 * Converts a CiceroMark DOM to a PDF Make JSON.
 * http://pdfmake.org/playground.html
 */
class CiceroMarkToPdfMakeVisitor {

    /**
     * Construct the visitor
     */
    constructor() {
    }

    /**
     * Returns the processed children
     * @param {*} thing a concerto ast node
     * @param {string} fieldName name of the field containing the children
     * @param {*} parameters the parameters
     * @returns {*} an array of slate nodes
     */
    processChildren(thing,fieldName,parameters) {
        const result = [];
        const nodes = thing[fieldName] ? thing[fieldName] : [];

        nodes.forEach(node => {
            // console.log(`Processing ${thing.getType()} > ${node.getType()}`);
            const newParameters = {
                strong: parameters.strong,
                emph: parameters.emph,
                code: parameters.code,
            };
            node.accept(this, newParameters);
            if (Array.isArray(newParameters.result)) {
                Array.prototype.push.apply(result,newParameters.result);
            } else {
                result.push(newParameters.result);
            }
        });

        return result;
    }

    /**
     * Returns the processed child nodes
     * @param {*} thing a concerto ast node
     * @param {*} parameters the parameters
     * @returns {*} an array of slate nodes
     */
    processChildNodes(thing,parameters) {
        return this.processChildren(thing,'nodes',parameters);
    }

    /**
     * Visit a concerto ast node and return the corresponding slate node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        // the style defaults to the name of the type
        let decoratorStyle = null;

        // if the type has an explicit Pdf style decorator, then we use it
        try {
            const decorators = new Decorators(thing);
            decoratorStyle = decorators.getDecoratorValue( 'Pdf', 'style');
        }
        catch(error) {
            console.log(error);
        }
        let result = {
            style : decoratorStyle ? decoratorStyle : thing.getType()
        };

        switch(thing.getType()) {
        case 'Emph': {
            parameters.emph = true;
            result.text = this.processChildNodes(thing,parameters);
            result.italics = true;
        }
            break;
        case 'Strong': {
            parameters.strong = true;
            result.text = this.processChildNodes(thing,parameters);
            result.bold = true;
        }
            break;
        case 'BlockQuote':
        case 'Item':
        case 'Clause': {
            result.stack = this.processChildNodes(thing,parameters);
        }
            break;
        case 'Link':
            {
                result.text = thing.nodes[0].text;
                result.link = thing.destination;
            }
            break;
        case 'Image':
            {
                result.image = thing.destination;
            }
            break;
        case 'Paragraph': {
            const child = this.processChildNodes(thing,parameters);
            if(child[0] && child[0].style === 'Image') { // PDFMake can't render images inline
                result.stack = child;
            }
            else {
                result.text = child;
                result.margin = [0,5];
            }
        }
            break;
        case 'EnumVariable':
        case 'FormattedVariable':
        case 'Formula':
        case 'Variable': {
            const fixedText = thing.elementType === 'String' || thing.identifiedBy ? unquoteString(thing.value) : thing.value;
            result.text = fixedText;
        }
            break;
        case 'Optional':
        case 'Conditional': {
            const child = this.processChildNodes(thing,parameters);
            result.stack = child;
        }
            break;
        case 'HtmlInline':
        case 'HtmlBlock':
        case 'CodeBlock':
        case 'Code': {
            result.text = thing.text;
        }
            break;
        case 'Text': {
            result = handleFormattedText(thing, parameters);
        }
            break;
        case 'Heading': {
            result.style = getHeadingType(thing.level);
            result.text = this.processChildNodes(thing,parameters);
            result.tocItem = thing.nodes && thing.nodes.length > 0 ? true : false;
        }
            break;
        case 'ThematicBreak': {
            result.text = '';
            result.pageBreak = 'after';
        }
            break;
        case 'Linebreak': {
            result.text = '\n';
        }
            break;
        case 'Softbreak': {
            result.text = ' ';
        }
            break;
        case 'ListBlock':
        case 'List': {
            result[thing.type === 'ordered' ? 'ol' : 'ul'] = this.processChildNodes(thing,parameters);
        }
            break;
        case 'Document': {
            result.content = this.processChildNodes(thing,parameters);
        }
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }

        parameters.result = result;
    }
}

module.exports = CiceroMarkToPdfMakeVisitor;