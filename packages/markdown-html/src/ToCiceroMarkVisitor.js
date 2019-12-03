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
const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const jsdom = require('jsdom');
const typeOf = require('type-of');
const defaultRules = require('./rules');
const { JSDOM } = jsdom;

/**
 * Converts an html string to a CiceroMark DOM
 *
 */
class ToCiceroMarkVisitor {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options = {}) {
        let {
            rules = [],
        } = options;
        this.options = options;
        this.rules = [...rules, ...defaultRules];
    }

    /**
     * Filter out cruft newline nodes inserted by the DOM parser.
     *
     * @param {Object} element DOM element
     * @return {Boolean} true if node is not a new line
     */
    cruftNewline(element) {
        return !(element.nodeName === '#text' && element.nodeValue === '\n');
    }

    /**
     * Deserialize a DOM element.
     *
     * @param {Object} element DOM element
     * @return {Any} node
     */
    deserializeElement(element) {
        let node;

        console.log('tagName', element.tagName);
        if (!element.tagName) {
            element.tagName = '';
        }

        const next = elements => {
            if (Object.prototype.toString.call(elements) === '[object NodeList]') {
                elements = Array.from(elements);
            }

            switch (typeOf(elements)) {
            case 'array':
                return this.deserializeElements(elements);
            case 'object':
                return this.deserializeElement(elements);
            case 'null':
            case 'undefined':
                return;
            default:
                throw new Error(
                    `The \`next\` argument was called with invalid children: "${elements}".`
                );
            }
        };

        for (const rule of this.rules) {
            if (!rule.deserialize) {continue;}
            const ret = rule.deserialize(element, next);
            const type = typeOf(ret);

            if (
                type !== 'array' &&
                type !== 'object' &&
                type !== 'null' &&
                type !== 'undefined'
            ) {
                throw new Error(
                    `A rule returned an invalid deserialized representation: "${node}".`
                );
            }

            if (ret === undefined) {
                continue;
            } else if (ret === null) {
                return null;
            // } else if (ret.object === 'mark') {
            //     node = this.deserializeMark(ret); // will we need this??
            } else {
                node = ret;
            }

            if (node.object === 'block' || node.object === 'inline') {
                node.data = node.data || {};
                node.nodes = node.nodes || [];
            } else if (node.object === 'text') {
                node.marks = node.marks || [];
                node.text = node.text || '';
            }

            break;
        }

        return node || next(element.childNodes);
    }

    /**
     * Deserialize an array of DOM elements.
     *
     * @param {Array} elements DOM elements
     * @return {Array} array of nodes
     */
    deserializeElements(elements = []) {
        let nodes = [];

        elements.filter(this.cruftNewline).forEach(element => {
            // console.log('element -- ', element);
            const node = this.deserializeElement(element);
            // console.log('node -- ', node);

            switch (typeOf(node)) {
            case 'array':
                nodes = nodes.concat(node);
                break;
            case 'object':
                nodes.push(node);
                break;
            }
        });

        return nodes;
    }

    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} CiceroMark DOM
     */
    toCiceroMark(input, format='concerto') {
        console.log('INPUT --- ', input);
        // use DOMParser if we have it
        // const parsed = new DOMParser().parseFromString(input, 'text/html');
        const fragment = JSDOM.fragment(input);
        const children = Array.from(fragment.childNodes);
        // console.log('children -- ', children);
        const nodes = this.deserializeElements(children);
        // console.log('nodes', nodes);
        return {
            '$class': `${NS_PREFIX_CommonMarkModel}${'Document'}`,
            nodes,
            xmlns: 'http://commonmark.org/xml/1.0',
        };
    }
}

module.exports = ToCiceroMarkVisitor;
