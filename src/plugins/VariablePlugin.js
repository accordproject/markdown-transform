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

const BasePlugin = require('./BasePlugin');

/**
 * A plugin for a variable
 */
class VariablePlugin extends BasePlugin {

    /**
  * Return the name of the plugin
  * @returns {string} the name of the plugin
  */
    getName() {
        return 'variable';
    }

    /**
   * Return the tags for the plugin
   * @returns {object[]} the tags for the plugin
   */
    getTags() {
        return [{
            md: 'variable'
        }];
    }

    /**
     * @param {ToMarkdown} parent - the orchestrator
     * @param {Node} value - the Slate Node
     * @returns {string} the markdown text
     */
    toMarkdown(parent, value) {
        let textValue = '';

        if (value.nodes.length > 0 && value.nodes[0].text) {
            textValue = value.nodes[0].text;
        }

        if (this.options && this.options.rawValue) {
            return textValue;
        }

        const attributes = value.data.attributes;
        let result = `<variable id="${attributes.id}" value="${encodeURI(textValue)}"`;

        if (attributes.format) {
            result += ` format="${encodeURI(attributes.format)}`;
        }

        result += '/>';
        return result;
    }

    /**
     * Builds a Slate documents based on common mark AST
     * @param {*} stack the results
     * @param {*} event the parser event
     * @param {*} tag the custom tag
     * @param {*} node the common mark AST node
     * @returns {boolean} true if the plugin handled the node
     */
    fromMarkdown(stack, event, tag, node) {
        const parent = stack.peek();

        // variables can only occur inside paragraphs
        if (!parent.type || parent.type !== 'paragraph') {
            const para = {
                object: 'block',
                type: 'paragraph',
                data: {},
                nodes: [],
            };
            stack.push(para);
        }

        const inline = {
            object: 'inline',
            type: 'variable',
            data: Object.assign(tag),
            nodes: [{
                object: 'text',
                text: `${decodeURI(tag.attributes.value)}`,
            }]
        };

        stack.append(inline);

        if (!parent.type || parent.type !== 'paragraph') {
            stack.pop();
        }

        return true;
    }
}

module.exports = VariablePlugin;
