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
 * Utilities
 */
const leadingSpace = (line) => {
    const res = line.match(/^([ \t]*)[^]*$/);
    const space = res ? res[1] : '';
    return space;
};
const trailingSpace = (line) => {
    const res = line.match(/[^]*[^ \t]+([ \t]*)$/);
    const space = res ? res[1] : '';
    return space;
};

const procStartLines = (text) => {
    const lines = text.split('\n');
    if (lines.length === 1) {
        return { 'closed': false, 'softbreak': false, 'space': leadingSpace(lines[0]), remaining: lines };
    }
    let startNLs = 0;
    for (let i=0; i < lines.length-1; i++) {
        if (/^[ \t]*$/.test(lines[i])) {
            startNLs++;
        } else {
            break;
        }
    }
    const remaining = lines.slice(startNLs);
    let start;
    if (startNLs >= 2) {
        start = { 'closed': true, 'softbreak': false, 'space': '', remaining: remaining };
    } else if (startNLs === 1) {
        start = { 'closed': false, 'softbreak': true, 'space': '', remaining: remaining };
    } else {
        start = { 'closed': false, 'softbreak': false, 'space': leadingSpace(lines[0]), remaining: remaining };
    }
    return start;
};
const procEndLines = (lines) => {
    if (lines.length === 0) {
        return { 'closed': false, 'softbreak': false, 'space': '' };
    }
    let endNLs = 0;
    for (let i=lines.length-1; i > 0; i--) {
        if (/^[ \t]*$/.test(lines[i])) {
            endNLs++;
        } else {
            break;
        }
    }
    let end;
    if (endNLs > 2) {
        end = { 'closed': true, 'softbreak': false, 'space': '' };
    } else if (endNLs === 1) {
        end = { 'closed': false, 'softbreak': true, 'space': '' };
    } else {
        end = { 'closed': false, 'softbreak': false, 'space': trailingSpace(lines[lines.length-1]) };
    }
    return end;
};

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class TemplateMarkVisitor {
    /**
     * Construct a softbreak node
     * @param {*} [parameters] optional parameters
     * @return {*} clean nodes and next partial nodes
     */
    static newSoftBreak(parameters) {
        const node = parameters.templateMarkFactory.newConcept('org.accordproject.commonmark','Softbreak');
        return node;
    }

    /**
     * Construct a text node
     * @param {string} text content
     * @param {*} [parameters] optional parameters
     * @return {*} clean nodes and next partial nodes
     */
    static newTextNode(text,parameters) {
        const node = parameters.templateMarkFactory.newConcept('org.accordproject.commonmark','Text');
        node.text = text;
        return node;
    }

    /**
     * Process one text chunk
     * @param {*} node the text node
     * @param {*} prevPartial the current partial node
     * @param {*} [parameters] optional parameters
     * @return {*} clean nodes and next partial nodes
     */
    static processChunk(node,currentPartial,parameters) {
        const text = node.value;
        let cleanNodes = [];

        let firstNode = null;
        let lastNode = null;

        const start = procStartLines(text);
        const end = procEndLines(start.remaining);

        // Process beginning of chunk
        if (currentPartial) {
            // Process beginning of chunk
            if (start.closed) {
                currentPartial = null;
            } else {
                if (start.softbreak) {
                    currentPartial.nodes.push(TemplateMarkVisitor.newSoftBreak(parameters))
                }
                if (start.space) {
                    currentPartial.nodes.push(TemplateMarkVisitor.newTextNode(start.space,parameters))
                }
                const firstNode = node.nodes.shift();
                currentPartial.nodes = currentPartial.nodes.concat(firstNode.nodes);
            }
        }

        // Process end of chunk
        if (end.closed) {
            cleanNodes = cleanNodes.concat(node.nodes);
            currentPartial = null;
        } else {
            lastNode = node.nodes[node.nodes.length-1];
            if (lastNode) {
                cleanNodes = cleanNodes.concat(node.nodes);
                currentPartial = lastNode;
            }
            if (currentPartial) {
                if (end.space) {
                    currentPartial.nodes.push(TemplateMarkVisitor.newTextNode(end.space,parameters))
                }
                if (end.softbreak) {
                    currentPartial.nodes.push(TemplateMarkVisitor.newSoftBreak(parameters))
                }
            }
        }
        return { cleanNodes: cleanNodes, partial: currentPartial };
    }

    /**
     * Fold TemplateMark nodes
     * @param {*} nodes the children
     * @param {*} [parameters] optional parameters
     */
    static foldNodes(nodes,parameters) {
        const reducer = (accumulator, currentNode) => {
            switch(currentNode.getType()) {
            case 'TextChunk': {
                const partialCheck = TemplateMarkVisitor.processChunk(currentNode,accumulator.partial,parameters);
                accumulator.nodes = accumulator.nodes.concat(partialCheck.cleanNodes);
                if (partialCheck.partial) {
                    accumulator.partial = partialCheck.partial;
                }
            }
                break;
            case 'FormulaDefinition':
            case 'VariableDefinition':
            case 'EnumVariableDefinition':
            case 'FormattedVariableDefinition':
            case 'ConditionalDefinition':
            case 'WithDefinition': {
                if (accumulator.partial) {
                    accumulator.partial.nodes.push(currentNode);
                } else {
                    accumulator.nodes.push(currentNode);
                }
            }
                break;
            case 'ListBlockDefinition':
            case 'ClauseDefinition': {
                if (accumulator.partial) {
                    accumulator.partial = null;
                    accumulator.nodes.push(currentNode);
                } else {
                    accumulator.nodes.push(currentNode);
                }
            }
                break;
            default: {
                accumulator.nodes.push(currentNode);
                break;
            }
            }
            return accumulator;
        };
        const reduced = nodes.reduce(reducer,{partial:null,nodes:[]});
        return reduced.nodes;
    }

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            TemplateMarkVisitor.visitNodes(visitor, thing.nodes, parameters);
            const newNodes = TemplateMarkVisitor.foldNodes(thing.nodes, parameters);
            thing.nodes = [].concat(newNodes);
        }
    }

    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor, things, parameters) {
        things.forEach(node => {
            node.accept(visitor, parameters);
        });
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        const currentModel = parameters.model;
        switch(thing.getType()) {
        case 'TextChunk': {
            const newNodes = parameters.commonMark.fromMarkdown(thing.value).nodes;
            thing.nodes = newNodes;
        }
            break;
        default:
            TemplateMarkVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = TemplateMarkVisitor;