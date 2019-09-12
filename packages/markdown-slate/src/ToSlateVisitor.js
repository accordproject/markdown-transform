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

const CommonMark = require('@accordproject/markdown-common').CommonMark;

/**
 * Converts a commonmark AST to a Slate DOM.
 */
class ToSlateVisitor {

    /**
     * Converts a sub-tree of formatting nodes to an array of marks
     * @param {*} thing a concerto Strong, Emph or Text node
     * @param {*} marks an initial set of marks
     * @returns {*} the array of slate marks to use
     */
    static getMarks(thing, marks) {
        let result = Array.from(marks);

        switch(thing.getType()) {
        case 'Strong':
            result.push({
                object: 'mark',
                type: 'bold',
                data: {}
            });
            break;
        case 'Emph':
            result.push({
                object: 'mark',
                type: 'italic',
                data: {}
            });
            break;
        }

        // recurse on child nodes
        if(thing.nodes && thing.nodes.length > 0) {
            result = ToSlateVisitor.getMarks(thing.nodes[0], result);
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
                return null;
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
     * @returns {*} the slate text node with marks
     */
    static handleFormattedText(thing) {
        return {
            object: 'text',
            text: ToSlateVisitor.getText(thing),
            marks: ToSlateVisitor.getMarks(thing, []),
        };
    }

    /**
     * Returns the processed child nodes
     * @param {*} thing a concerto ast nodes
     * @returns {*} an array of slate nodes
     */
    processChildNodes(thing) {
        const result = [];
        if(!thing.nodes) {
            throw new Error(`Node ${thing.getType()} doesn't have any children!`);
        }

        const commonMark = new CommonMark();
        const json = commonMark.getSerializer().toJSON(thing);
        console.log('Processing', JSON.stringify(json, null, 4));

        thing.nodes.forEach(node => {
            //console.log(`Processing ${thing.getType()} > ${node.getType()}`);
            const child = {};
            node.accept(this, child);
            result.push(child.result);
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

        //console.log('Processing', thing.getType());
        switch(thing.getType()) {
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
                'object': 'text',
                'text': thing.text,
                'marks': [
                    {
                        'object': 'mark',
                        'type': 'code',
                        'data': {}
                    }
                ]
            };
            break;
        case 'Emph':
        case 'Strong':
        case 'Text':
            result = ToSlateVisitor.handleFormattedText(thing);
            break;
        case 'BlockQuote':
            result = {
                'object': 'block',
                'type': 'block_quote',
                'nodes': this.processChildNodes(thing)
            };
            break;
        case 'Heading':
            result = {
                'object': 'block',
                'data': {},
                'type': ToSlateVisitor.getHeadingType(thing),
                'nodes': this.processChildNodes(thing)
            };
            break;
        case 'ThematicBreak':
            result = {
                'object': 'block',
                'type': 'paragraph',
                'nodes': []
            };
            break;
        case 'Linebreak':
            result = {
                'object': 'block',
                'type': 'paragraph',
                'nodes': []
            };
            break;
        case 'Softbreak':
            result = {
                'object': 'block',
                'type': 'paragraph',
                'nodes': []
            };
            break;
        case 'Link':
            result = {
                'object': 'inline',
                'type': 'link',
                'data': {
                    'href': thing.destination
                },
                'nodes': [
                    {
                        'object': 'text',
                        'text': thing.nodes[0].text,
                        'marks': []
                    }
                ]
            };
            break;
        case 'Image':
            result = {
                'object': 'inline',
                'type': 'link',
                'data': {
                    'href': thing.destination
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
                'nodes': this.processChildNodes(thing),
                'data': {}
            };
            break;
        case 'HtmlBlock':
        case 'HtmlInline':
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
            };            break;
        case 'List':
            result = {
                'object': 'block',
                'data': { tight: thing.tight, start: thing.start, delimiter: thing.delimiter},
                'type': thing.type === 'ordered' ? 'ol_list' : 'ul_list',
                'nodes': this.processChildNodes(thing)
            };
            break;
        case 'Item':
            result = {
                'object': 'block',
                'type': 'list_item',
                'data': {},
                'nodes': this.processChildNodes(thing.nodes[0]) // discard the para
            };
            break;
        case 'Document':
            result = {
                'object': 'document',
                'nodes': this.processChildNodes(thing),
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