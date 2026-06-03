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

import { CommonMarkModel } from '@accordproject/markdown-common';
import defaultRules, { Rule } from './rules';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const typeOf = require('type-of');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsdom: any = typeof DOMParser === 'undefined' ? require('jsdom') : null;
const JSDOM: any = jsdom ? jsdom.JSDOM : null;

/**
 * Converts an html string to a CiceroMark DOM
 */
export class ToCiceroMarkVisitor {
    options: any;
    rules: Rule[];

    constructor(options: any = {}) {
        const { rules = [] } = options;
        this.options = options;
        this.rules = [...rules, ...defaultRules];
    }

    /**
     * Filter out cruft newline nodes inserted by the DOM parser.
     */
    cruftNewline(element: any): boolean {
        return !(element.nodeName === '#text' && element.nodeValue === '\n');
    }

    /**
     * Deserialize a DOM element.
     */
    deserializeElement(element: any, ignoreSpace?: boolean): any {
        let node: any;

        if (!element.tagName) {
            element.tagName = '';
        }

        const next = (elements: any, ignoreSpace?: boolean): any => {
            if (Object.prototype.toString.call(elements) === '[object NodeList]') {
                elements = Array.from(elements);
            }

            switch (typeOf(elements)) {
                case 'array':
                    return this.deserializeElements(elements, ignoreSpace);
                case 'object':
                    return this.deserializeElement(elements, ignoreSpace);
                case 'null':
                case 'undefined':
                    return;
                default:
                    throw new Error(`The \`next\` argument was called with invalid children: "${elements}".`);
            }
        };

        for (const rule of this.rules) {
            if (!rule.deserialize) { continue; }
            const ret = rule.deserialize(element, next, ignoreSpace);
            const type = typeOf(ret);

            if (
                type !== 'array' &&
                type !== 'object' &&
                type !== 'null' &&
                type !== 'undefined'
            ) {
                throw new Error(`A rule returned an invalid deserialized representation: "${node}".`);
            }

            if (ret === undefined) {
                continue;
            } else if (ret === null) {
                return null;
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

        return node || next(element.childNodes, ignoreSpace);
    }

    /**
     * Deserialize an array of DOM elements.
     */
    deserializeElements(elements: any[] = [], ignoreSpace?: boolean): any[] {
        let nodes: any[] = [];

        elements.filter(this.cruftNewline).forEach((element) => {
            const node = this.deserializeElement(element, ignoreSpace);

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
     */
    toCiceroMark(input: string, _format = 'concerto'): any {
        let fragment: any;
        if (typeof DOMParser === 'undefined') {
            fragment = JSDOM.fragment(input);
        } else {
            // eslint-disable-next-line no-undef
            fragment = new DOMParser().parseFromString(input, 'text/html');
        }
        const children = Array.from(fragment.childNodes);
        const nodes = this.deserializeElements(children, true);
        return {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            nodes,
            xmlns: 'http://commonmark.org/xml/1.0',
        };
    }
}

export default ToCiceroMarkVisitor;
