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
     * @param {*} input - CiceroMark DOM
     * @returns {*} Slate JSON
     */
    fromCiceroMark(input) {
        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }

        const CLAUSE = 'clause';
        const parameters = {};
        parameters.serializer = this.serializer;
        parameters.result = {};
        const visitor = new ToSlateVisitor();
        input.accept( visitor, parameters );
        const result = {
            document: parameters.result
        };
        const paragraphSpaceNodeJSON = {
            object: 'block',
            type: 'paragraph',
            data: {
            },
            children: [
                {
                    object: 'text',
                    text: ''
                }
            ]
        };

        // Find any clauses next to each other, force in a paragraph between
        if (result.document.children.length > 1) {
            let newArray = [];
            for (let i = 0; i <= result.document.children.length-1; i++) {
                newArray.push(result.document.children[i]);
                if (result.document.children[i].type === CLAUSE &&
                    result.document.children[i + 1] &&
                    result.document.children[i + 1].type === CLAUSE) {
                    newArray.push(paragraphSpaceNodeJSON);
                }
            }
            result.document.children = newArray;
        }

        // If the final node is a clause, force in a paragraph after
        const lastNodeType = result.document.children[result.document.children.length - 1]
            ? result.document.children[result.document.children.length - 1].type
            : null;

        if (lastNodeType === CLAUSE) {
            result.document.children.push(paragraphSpaceNodeJSON);
        }
        return result;
    }

    /**
     * Converts a Slate JSON to CiceroMark DOM
     * @param {*} value - Slate json
     * @returns {*} the CiceroMark DOM
     */
    toCiceroMark(value) {
        const clonedValue = JSON.parse(JSON.stringify(value)); // Workaround in case value is immutable
        return slateToCiceroMarkDom(clonedValue);
    }

    /**
     * Converts a Slate JSON to a markdown string
     * @param {*} value - Slate json
     * @param {object} [options] - configuration options
     * @returns {*} markdown string
     */
    toMarkdown(value, options) {
        const ciceroMark = this.toCiceroMark(value);
        return this.ciceroMarkTransformer.toMarkdown(ciceroMark, options);
    }

    /**
     * Converts a Slate JSON to a markdown cicero string
     * @param {*} value - Slate json
     * @param {object} [options] - configuration options
     * @returns {*} markdown cicero string
     */
    toMarkdownCicero(value, options) {
        const ciceroMark = this.toCiceroMark(value);
        const ciceroMarkUnwrapped = this.ciceroMarkTransformer.toCiceroMarkUnwrapped(ciceroMark, options);
        return this.ciceroMarkTransformer.toMarkdownCicero(ciceroMarkUnwrapped, options);
    }

    /**
     * Converts a markdown string to a Slate JSON
     * @param {string} markdown - a markdown string
     * @returns {*} Slate json
     */
    fromMarkdown(markdown) {
        const ciceroMarkDom = this.ciceroMarkTransformer.fromMarkdown(markdown);
        return this.fromCiceroMark(ciceroMarkDom);
    }
}

module.exports = SlateTransformer;