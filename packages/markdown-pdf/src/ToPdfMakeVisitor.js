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
 * Unquote strings
 * @param {string} value - the string
 * @return {string} the unquoted string
 */
// function unquoteString(value) {
//     return value.substring(1,value.length-1);
// }

/**
 * Converts a CiceroMark DOM to a PDF Make JSON.
 * http://pdfmake.org/playground.html
 */
class ToPdfMakeVisitor {

    /**
     * Construct the visitor
     * @param {*} [options] configuration options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Apply marks to a leaf node
     * @param {*} leafNode the leaf node
     * @param {*} parameters the parameters
     */
    static applyMarks(leafNode, parameters) {
        if (parameters.emph) {
            leafNode.style = 'Emph';
            leafNode.italics = true;
        }
        if (parameters.strong) {
            leafNode.style = 'Strong';
            leafNode.bold = true;
        }
        if (parameters.code) {
            leafNode.style = 'Code';
        }
    }

    /**
     * Converts a formatted text node to a slate text node with marks
     * @param {*} thing a concerto Strong, Emph or Text node
     * @param {*} parameters the parameters
     * @returns {*} the slate text node with marks
     */
    static handleFormattedText(thing, parameters) {
        const textNode = {
            text: ToPdfMakeVisitor.getText(thing)};

        this.applyMarks(textNode, parameters);
        return textNode;
    }

    /**
     * Gets the text value from a formatted sub-tree
     * @param {*} thing a concerto Strong, Emph or Text node
     * @returns {string} the 'text' property of the formatted sub-tree
     */
    static getText(thing) {
        if(thing.getType() === 'Text') {
            return thing.text;
        }
        else {
            if(thing.nodes && thing.nodes.length > 0) {
                return ToPdfMakeVisitor.getText(thing.nodes[0]);
            }
            else {
                return '';
            }
        }
    }

    /**
     * Converts a heading level to a heading style name
     * @param {*} thing concert heading node
     * @returns {string} the heading type
     */
    static getHeadingType(thing) {
        switch(thing.level) {
        case '1': return 'heading_one';
        case '2': return 'heading_two';
        case '3': return 'heading_three';
        case '4': return 'heading_four';
        case '5': return 'heading_five';
        case '6': return 'heading_six';
        default: return 'heading_one';
        }
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
            //console.log(`Processing ${thing.getType()} > ${node.getType()}`);
            const newParameters = {
                strong: parameters.strong,
                emph: parameters.emph,
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

        let result = {
            style: thing.getType()
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
            result.text = this.processChildNodes(thing,parameters);
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
        case 'Forumla':
        case 'Variable': {
            result.text = thing.value;
        }
            break;
        case 'Conditional': {
            result.text = thing.nodes[0].text;
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
            result = ToPdfMakeVisitor.handleFormattedText(thing, parameters);
        }
            break;
        case 'Heading': {
            result.style = ToPdfMakeVisitor.getHeadingType(thing);
            result.text = this.processChildNodes(thing,parameters);
            result.tocItem = true;
            if(result.style === 'heading_one') {
                result.pageBreak = 'before';
            }
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
            result.info = {
                title: 'Smart Legal Contract',
                author: 'Clause',
                subject: 'subject of document',
                keywords: 'keywords for document',
            };
            result.defaultStyle = {
                fontSize: 12,
                lineHeight: 1.5
            };
            result.pageSize = 'A4';
            result.pageOrientation = 'portrait',
            result.pageMargins = [ 40, 60, 40, 60 ],
            result.content = [{
                toc: {
                    title: {text: 'INDEX', style: 'heading_one'}
                }
            }];
            result.content = result.content.concat(this.processChildNodes(thing,parameters));
            result.footer = function(currentPage, pageCount) {
                return {
                    text: currentPage.toString() + ' / ' + pageCount,
                    style: 'Footer'
                };
            };
            result.styles = {
                Footer: {
                    fontSize: 12,
                    font: 'LiberationSerif',
                    alignment: 'center'
                },
                heading_one: {
                    fontSize: 30,
                    font: 'LiberationSerif',
                    bold: true,
                    alignment: 'center'
                },
                heading_two: {
                    fontSize: 28,
                    font: 'LiberationSerif',
                    bold: true
                },
                heading_three: {
                    fontSize: 26,
                    font: 'LiberationSerif',
                    bold: true
                },
                heading_four: {
                    fontSize: 24,
                    font: 'LiberationSerif',
                    bold: true
                },
                heading_five: {
                    fontSize: 22,
                    font: 'LiberationSerif',
                    bold: true
                },
                heading_six: {
                    fontSize: 20,
                    font: 'LiberationSerif',
                    bold: true
                },
                Emph: {
                    italics: true
                },
                Strong: {
                    bold: true
                },
                Code: {
                    font: 'Courier'
                },
                CodeBlock: {
                    font: 'Courier',
                },
                HtmlInline: {
                    font: 'Courier'
                },
                HtmlBlock: {
                    font: 'Courier',
                },
                Paragraph: {
                    font: 'LiberationSerif',
                    fontSize: 12,
                    alignment: 'justify'
                },
                toc: {
                    font: 'LiberationSerif',
                    fontSize: 14
                },
                tocItem: {
                    font: 'LiberationSerif',
                    fontSize: 14
                },
                Clause: {
                    font: 'LiberationSerif',
                    fontSize: 12
                },
                Link: {
                    font: 'LiberationSerif',
                    fontSize: 12,
                    color: 'blue'
                },
                List: {
                    font: 'LiberationSerif',
                    fontSize: 12,
                },
                Item: {
                    font: 'LiberationSerif',
                    fontSize: 12,
                },
                BlockQuote: {
                    font: 'LiberationSerif',
                    fontSize: 14,
                    italics: true,
                    margin: [20, 0]
                },
            };
        }
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }

        parameters.result = result;
    }
}

module.exports = ToPdfMakeVisitor;