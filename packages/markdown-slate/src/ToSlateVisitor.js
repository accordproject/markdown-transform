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
 * Converts a CiceroMark DOM to a Slate JSON.
 */
class ToSlateVisitor {

    /**
     * Apply marks to a leaf node
     * @param {*} leafNode the leaf node
     * @param {*} parameters the parameters
     */
    static applyMarks(leafNode, parameters) {
        if (parameters.emph) {
            leafNode.italic = true;
        }
        if (parameters.strong) {
            leafNode.bold = true;
        }
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
        const textNode = {
            object: 'text',
            text: ToSlateVisitor.getText(thing)};

        this.applyMarks(textNode, parameters);
        return textNode;
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
        const textNode = {
            object: 'text',
            text: text
        };

        const inlineNode = {
            object: 'inline',
            type: type,
            data: data,
            children: [textNode]
        };
        this.applyMarks(inlineNode,parameters);

        return inlineNode;
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
                children: this.processChildNodes(thing,parameters),
            };
            break;
        case 'Variable': {
            const data = thing.format ? { id: thing.id, format: thing.format } : { id: thing.id };
            result = ToSlateVisitor.handleVariable('variable', data, thing.value, parameters);
        }
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
                children: [{
                    object: 'block',
                    type: 'paragraph',
                    children: [{
                        object: 'text',
                        text: thing.text
                    }],
                    data: {}
                }]
            };
            break;
        case 'Code':
            result = {
                object: 'text',
                text: thing.text,
                code: true
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
                block_quote: true,
                children: this.processChildNodes(thing,parameters),
                data: {}
            };
            break;
        case 'Heading':
            result = {
                object: 'block',
                data: {},
                type: ToSlateVisitor.getHeadingType(thing),
                children: this.processChildNodes(thing,parameters)
            };
            break;
        case 'ThematicBreak':
            result = {
                object: 'block',
                type: 'horizontal_rule',
                hr: true,
                children: []
            };
            break;
        case 'Linebreak':
            result = {
                object: 'inline',
                type: 'linebreak'
            };
            break;
        case 'Softbreak':
            result = {
                object: 'inline',
                type: 'softbreak'
            };
            break;
        case 'Link':
            result = {
                object: 'inline',
                type: 'link',
                data: {
                    href: thing.destination,
                    title: thing.title ? thing.title : ''
                },
                children: this.processChildNodes(thing,parameters)
            };
            break;
        case 'Image':
            result = {
                object: 'inline',
                type: 'image',
                data: {
                    'href': thing.destination,
                    'title': thing.title ? thing.title : ''
                },
                children: [
                    {
                        'object': 'text',
                        'text': thing.text ? thing.text : ''
                    }
                ]
            };
            break;
        case 'Paragraph':
            result = {
                object: 'block',
                type: 'paragraph',
                children: this.processChildNodes(thing,parameters),
                data: {}
            };
            break;
        case 'HtmlBlock':
            result = {
                object: 'block',
                type: 'html_block',
                data: {},
                children: [{
                    object: 'block',
                    type: 'paragraph',
                    children: [{
                        object: 'text',
                        text: thing.text,
                        html: true
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
                children: [] // XXX
            };
            break;
        case 'List':
            result = {
                object: 'block',
                data: { tight: thing.tight, start: thing.start, delimiter: thing.delimiter},
                type: thing.type === 'ordered' ? 'ol_list' : 'ul_list',
                children: this.processChildNodes(thing,parameters)
            };
            break;
        case 'ListVariable':
            /* XXX Will have to be changed to support editing of dynamic lists in the UI */
            result = {
                object: 'block',
                data: { tight: thing.tight, start: thing.start, delimiter: thing.delimiter, kind: 'variable' },
                type: thing.type === 'ordered' ? 'ol_list' : 'ul_list',
                children: this.processChildNodes(thing,parameters)
            };
            break;
        case 'Item':
            result = {
                object: 'block',
                type: 'list_item',
                data: {},
                children: this.processChildNodes(thing,parameters)
            };
            break;
        case 'Document':
            result = {
                object: 'document',
                children: this.processChildNodes(thing,parameters),
                data : {}
            };
            break;
        default:
            throw new Error(`Unhandled type ${thing.getType()}`);
        }

        // Cleanup block node for Slate
        if (result.object === 'block' || result.object === 'inline') {
            const emptyText = () => { return { object: 'text', text: '' }; };
            if (!result.data) {
                result.data = {};
            }
            if (!result.children || result.children.length === 0) {
                result.children = [ emptyText() ];
            }
            if (result.children && result.children.length > 0) {
                const normalizedChildren = [];
                for (let i = 0; i < result.children.length; i++) {
                    const child = result.children[i];
                    const isLast = i === result.children.length - 1;

                    if (child.object === 'inline') {
                        if (
                            normalizedChildren.length === 0 ||
                            normalizedChildren[normalizedChildren.length - 1].object === 'inline'
                        ) {
                            normalizedChildren.push(emptyText(), child);
                        } else if (isLast) {
                            normalizedChildren.push(child, emptyText());
                        } else {
                            normalizedChildren.push(child);
                        }
                    } else {
                        normalizedChildren.push(child);
                    }
                }
                result.children = normalizedChildren;
            }
        }

        parameters.result = result;
    }
}

module.exports = ToSlateVisitor;