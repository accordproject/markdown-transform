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

const Value = require('slate').Value;
const ToSlateVisitor = require('./ToSlateVisitor');
const slateToCiceroMarkDom = require('./slateToCiceroMarkDom');
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Converts a CiceroMark DOM to/from a Slate DOM.
 */
class SlateTransformer {
    /**
     * Construct the Slate transformer.
     */
    constructor() {
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
        this.serializer = this.ciceroMarkTransformer.getSerializer();
    }

    /**
     * Converts a CiceroMark DOM to a Slate DOM
     * @param {*} input CiceroMark DOM
     * @returns {*} Slate DOM
     */
    fromCiceroMark(input) {

        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }

        const CLAUSE = 'clause';
        const parameters = {};
        parameters.result = {};
        parameters.marks = [];
        const visitor = new ToSlateVisitor();
        input.accept( visitor, parameters );
        const result = {
            object: 'value',
            document: parameters.result
        };
        const paragraphSpaceNodeJSON = {
            object: 'block',
            type: 'paragraph',
            data: {
            },
            nodes: [
                {
                    object: 'text',
                    text: '',
                    marks: []
                }
            ]
        };

        // Find any clauses next to each other, force in a paragraph between
        const newArray = [];
        result.document.nodes.forEach((node, i) => {
            newArray.push(node);
            if (node.type === CLAUSE || result.document.nodes[i + 1] === CLAUSE) {

                newArray.push(paragraphSpaceNodeJSON);
                return;
            }
            return;
        });
        result.document.nodes = newArray;

        // If the final node is a clause, force in a paragraph after
        const lastNodeType = result.document.nodes[result.document.nodes.length - 1]
            ? result.document.nodes[result.document.nodes.length - 1].type
            : null;

        if (lastNodeType === CLAUSE) {
            result.document.nodes.push(paragraphSpaceNodeJSON);
        }
        return Value.fromJSON(result);
    }

    /**
     * Converts a Slate value document node to CiceroMark DOM
     * @param {*} value - Slate value
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} the CiceroMark DOM
     */
    toCiceroMark(value, format='concerto') {
        const json = slateToCiceroMarkDom(value.document);
        // console.log(JSON.stringify(json, null, 3));

        if(format === 'concerto') {
            return this.serializer.fromJSON(json);
        }
        else {
            return json;
        }
    }

    /**
     * Converts a Slate DOM to a markdown string
     * @param {*} value Slate value
     * @param {object} [options] configuration options
     * @returns {*} markdown string
     */
    toMarkdown(value, options) {
        const ciceroMark = this.toCiceroMark(value, 'json');
        return this.ciceroMarkTransformer.toMarkdown(ciceroMark, options);
    }

    /**
     * Converts a markdown string to a Slate DOM
     * @param {string} markdown a markdown string
     * @returns {*} Slate value
     */
    fromMarkdown(markdown) {
        const ciceroMarkDom = this.ciceroMarkTransformer.fromMarkdown(markdown, 'json');
        // console.log(JSON.stringify(ciceroMarkDom, null, 4));
        return this.fromCiceroMark(ciceroMarkDom);
    }
}

module.exports = SlateTransformer;