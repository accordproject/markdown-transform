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
 * Converts a CiceroMark DOM to a Slate DOM.
 */
class ToSlateVisitor {

    /**
     * Converts a sub-tree of formatting nodes to an array of marks
     * @param {*} parameters the parameters
     * @returns {*} the array of slate marks to use
     */
    static getMarks(parameters) {
        let result = [];

        if (parameters.emph) {
            result.push({
                object: 'mark',
                type: 'italic',
                data: {}
            });
        }
        if (parameters.strong) {
            result.push({
                object: 'mark',
                type: 'bold',
                data: {}
            });
        }

        return result;
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
                return ToSlateVisitor.getText(thing.nodes[0]);
            }
            else {
                return '';
            }
        }
    }

    /**
     * Converts a heading level to a slate heading type name
     * @param {*} thing concert heading node
     * @returns {string} the slate heading type
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
     * Converts a formatted text node to a slate text node with marks
     * @param {*} thing a concerto Strong, Emph or Text node
     * @param {*} parameters the parameters
     * @returns {*} the slate text node with marks
     */
    static handleFormattedText(thing, parameters) {
        return {
            object: 'text',
            text: ToSlateVisitor.getText(thing),
            marks: ToSlateVisitor.getMarks(parameters),
        };
    }

    /**
     * Converts a variable node to a slate text node with marks
     * @param {*} type - the type of variable
     * @param {*} data - the data for the variable
     * @param {*} text - the text for the variable
     * @param {*} parameters the parameters
     * @returns {*} the slate text node with marks
     */
    static handleVariable(type, data, text, parameters) {
        return {
            object: 'inline',
            type: type,
            data: data,
            nodes: [{
                object: 'text',
                text: text,
                marks: ToSlateVisitor.getMarks(parameters),
            }],
        };
    }

    /**
     * Returns the processed child nodes
     * @param {*} thing a concerto ast nodes
     * @param {*} parameters the parameters
     * @returns {*} an array of slate nodes
     */
    processChildNodes(thing,parameters) {
        const result = [];
        if(!thing.nodes) {
            thing.nodes = []; // Treat no nodes as empty array of nods
        }

        thing.nodes.forEach(node => {
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
     * Visit a concerto ast node and return the corresponding slate node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {

        let result = null;

        switch(thing.getType()) {
        case 'Clause':
            result = {
                object: 'block',
                type: 'clause',
                data: {
                    clauseid: thing.clauseid,
                    src: thing.src
                },
                nodes: this.processChildNodes(thing,parameters),
            };
            break;
        case 'Variable':
            result = ToSlateVisitor.handleVariable('variable', { id: thing.id }, thing.value, parameters);
            break;
        case 'ConditionalVariable':
            result = ToSlateVisitor.handleVariable('conditional', { id: thing.id, whenTrue: thing.whenTrue, whenFalse: thing.whenFalse }, thing.value, parameters);
            break;
        case 'ComputedVariable':
            result = ToSlateVisitor.handleVariable('computed', {}, thing.value, parameters);
            break;
        case 'CodeBlock':
            result = {
                object: 'block',
                type: 'code_block',
                data: {},
                nodes: [{
                    object: 'block',
                    type: 'paragraph',
                    nodes: [{
                        object: 'text',
                        text: thing.text,
                        marks: []
                    }],
                    data: {}
                }]
            };
            break;
        case 'Code':
            result = {
                object: 'text',
                text: thing.text,
                marks: [
                    {
                        object: 'mark',
                        type: 'code',
                        data: {}
                    }
                ]
            };
            break;
        case 'Emph':
            parameters.emph = true;
            result = this.processChildNodes(thing,parameters);
            break;
        case 'Strong':
            parameters.strong = true;
            result = this.processChildNodes(thing,parameters);
            break;
        case 'Text':
            result = ToSlateVisitor.handleFormattedText(thing, parameters);
            break;
        case 'BlockQuote':
            result = {
                object: 'block',
                type: 'block_quote',
                nodes: this.processChildNodes(thing,parameters)
            };
            break;
        case 'Heading':
            result = {
                'object': 'block',
                'data': {},
                'type': ToSlateVisitor.getHeadingType(thing),
                'nodes': this.processChildNodes(thing,parameters)
            };
            break;
        case 'ThematicBreak':
            result = {
                'object': 'block',
                'type': 'horizontal_rule',
                'nodes': []
            };
            break;
        case 'Linebreak':
            result = {
                'object': 'inline',
                'type': 'linebreak'
            };
            break;
        case 'Softbreak':
            result = {
                'object': 'inline',
                'type': 'softbreak'
            };
            break;
        case 'Link':
            result = {
                'object': 'inline',
                'type': 'link',
                'data': {
                    'href': thing.destination,
                    'title': thing.title ? thing.title : ''
                },
                'nodes': this.processChildNodes(thing,parameters)
            };
            break;
        case 'Image':
            result = {
                'object': 'inline',
                'type': 'image',
                'data': {
                    'href': thing.destination,
                    'title': thing.title ? thing.title : ''
                },
                'nodes': [
                    {
                        'object': 'text',
                        'text': thing.text,
                        'marks': []
                    }
                ]
            };
            break;
        case 'Paragraph':
            result = {
                'object': 'block',
                'type': 'paragraph',
                'nodes': this.processChildNodes(thing,parameters),
                'data': {}
            };
            break;
        case 'HtmlBlock':
            result = {
                object: 'block',
                type: 'html_block',
                data: {},
                nodes: [{
                    object: 'block',
                    type: 'paragraph',
                    nodes: [{
                        object: 'text',
                        text: thing.text,
                        marks: [
                            {
                                'object': 'mark',
                                'type': 'html',
                                'data': {}
                            }
                        ]
                    }],
                    data: {}
                }]
            };
            break;
        case 'HtmlInline':
            result = {
                object: 'inline',
                type: 'html_inline',
                data: {
                    content: thing.text,
                },
                nodes: [] // XXX
            };
            break;
        case 'List':
            result = {
                'object': 'block',
                'data': { tight: thing.tight, start: thing.start, delimiter: thing.delimiter},
                'type': thing.type === 'ordered' ? 'ol_list' : 'ul_list',
                'nodes': this.processChildNodes(thing,parameters)
            };
            break;
        case 'ListVariable':
            /* XXX Will have to be changed to support editing of dynamic lists in the UI */
            result = {
                'object': 'block',
                'data': { tight: thing.tight, start: thing.start, delimiter: thing.delimiter, kind: 'variable' },
                'type': thing.type === 'ordered' ? 'ol_list' : 'ul_list',
                'nodes': this.processChildNodes(thing,parameters)
            };
            break;
        case 'Item':
            result = {
                'object': 'block',
                'type': 'list_item',
                'data': {},
                'nodes': this.processChildNodes(thing,parameters)
            };
            break;
        case 'Document':
            result = {
                'object': 'document',
                'nodes': this.processChildNodes(thing,parameters),
                'data' : {}
            };
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }

        parameters.result = result;
    }
}

module.exports = ToSlateVisitor;