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
 * A plugin to handle markdown lists
 */
class ListPlugin extends BasePlugin {

    /**
    * Return the name of the plugin
    * @returns {string} the name of the plugin
    */
    getName() {
        return 'list';
    }

    /**
* Return the tags for the plugin
* @returns {object[]} the tags for the plugin
*/
    getTags() {
        return [
            {
                html: 'ul',
                slate: 'ul_list',
                md: node => node.listType === 'bullet'
            },
            {
                html: 'ol',
                slate: 'ol_list',
                md: node => node.listType === 'ordered'
            },
            {
                html: 'li',
                slate: 'list_item',
                md: node => node.type === 'item'
            }
        ];
    }

    /**
   * @param {ToMarkdown} parent the orchestrator
   * @param {Node} value slate node
   * @param {Integer} depth the recursive depth
   * @returns {string} the markdown text
   */
    toMarkdown(parent, value, depth) {
        let markdown = '';
        const listStyleType = (value.type === 'ol_list') ? '1. ' : '* ';
        let indent = '';
        for (let i = 0; i < depth - 1; i += 1) {
            indent += '   ';
        }
        value.nodes.forEach((li) => {
            const text = parent.recursive(li.nodes);
            markdown += `\n${indent}${listStyleType}${text}`;
        });

        return markdown;
    }


    /**
     * Converts from markdown to Slate
     * @param {Stack} stack te output stack
     * @param {*} event the parse event
     * @returns {boolean} true if handled
     */
    fromMarkdown(stack, event) {
        let newType = null;
        if (event.node.listType === 'ordered') {
            newType = 'ol_list';
        }
        if (event.node.listType === 'bullet') {
            newType = 'ul_list';
        }
        if (event.node.type === 'item') {
            newType = 'list_item';
        }

        if (event.entering) {
            const block = {
                object: 'block',
                type: newType,
                data: {},
                nodes: [],
            };
            stack.push(block);
        } else {
            stack.pop();
        }

        return true;
    }
}

module.exports = ListPlugin;
