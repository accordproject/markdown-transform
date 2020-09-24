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

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;

const CiceroMarkFromSlateVisitor = require('./CiceroMarkFromSlateVisitor');
const TemplateMarkFromSlateVisitor = require('./TemplateMarkFromSlateVisitor');
const CiceroMarkToSlateVisitor = require('./CiceroMarkToSlateVisitor');
const TemplateMarkToSlateVisitor = require('./TemplateMarkToSlateVisitor');

/**
 * post processing for clause nodes
 * @param {object} node - the slate node
 * @return {obejct} the post processed nodes
 */
function postProcessClauses(node) {
    const result = node;

    const CLAUSE = 'clause';
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
 * Converts a CiceroMark DOM to/from a Slate DOM.
 */
class SlateTransformer {
    /**
     * Construct the Slate transformer.
     */
    constructor() {
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
        this.templateMarkTransformer = new TemplateMarkTransformer();
        this.serializerCicero = this.ciceroMarkTransformer.getSerializer();
        this.serializerTemplate = this.templateMarkTransformer.getSerializer();
    }

    /**
     * Converts a CiceroMark DOM to a Slate DOM
     * @param {*} input - CiceroMark DOM
     * @returns {*} Slate JSON
     */
    fromCiceroMark(input) {
        if(!input.getType) {
            input = this.serializerCicero.fromJSON(input);
        }

        const parameters = {};
        parameters.serializer = this.serializerCicero;
        parameters.result = {};
        const visitor = new CiceroMarkToSlateVisitor();
        input.accept( visitor, parameters );
        const result = {
            document: parameters.result
        };

        return postProcessClauses(result);
    }

    /**
     * Converts a TemplateMark DOM to a Slate DOM
     * @param {*} input - TemplateMark DOM
     * @returns {*} Slate JSON
     */
    fromTemplateMark(input) {
        if(!input.getType) {
            input = this.serializerTemplate.fromJSON(input);
        }

        const parameters = {};
        parameters.serializer = this.serializerTemplate;
        parameters.result = {};
        const visitor = new TemplateMarkToSlateVisitor();
        input.accept( visitor, parameters );
        const result = {
            document: parameters.result
        };

        return postProcessClauses(result);
    }

    /**
     * Converts a Slate JSON to CiceroMark DOM
     * @param {*} value - Slate json
     * @returns {*} the CiceroMark DOM
     */
    toCiceroMark(value) {
        const clonedValue = JSON.parse(JSON.stringify(value)); // Workaround in case value is immutable
        const visitor = new CiceroMarkFromSlateVisitor();
        return visitor.fromSlate(clonedValue);
    }

    /**
     * Converts a Slate JSON to TemplateMark DOM
     * @param {*} value - Slate json
     * @returns {*} the TemplateMark DOM
     */
    toTemplateMark(value) {
        const clonedValue = JSON.parse(JSON.stringify(value)); // Workaround in case value is immutable
        const visitor = new TemplateMarkFromSlateVisitor();
        return visitor.fromSlate(clonedValue);
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