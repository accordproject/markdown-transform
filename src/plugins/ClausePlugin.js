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
 * A plugin for a clause embedded in a contract
 */
class ClausePlugin extends BasePlugin {

    /**
    * Return the name of the plugin
    * @returns {string} the name of the plugin
    */
    getName() {
        return 'clause';
    }

    /**
   * Return the tags for the plugin
   * @returns {object[]} the tags for the plugin
   */
    getTags() {
        return [{
            md: 'clause'
        }];
    }

    /**
     * Converts a Slate Node to markdown
     * @param {ToMarkdown} parent the orchestrator
     * @param {Node} value the Slate Node
     * @returns {string} the markdown string
     */
    toMarkdown(parent, value) {
        let markdown = `\n\n\`\`\` <clause src=${value.data.attributes.src} clauseid=${value.data.attributes.clauseid}>\n`;

        value.nodes.forEach((li) => {
            const text = parent.recursive(li.nodes);
            markdown += text;
        });

        markdown += '\n```\n';
        return markdown;
    }

    /**
     * Converts from CommonMark AST to Slate AST
     * @param {*} stack the return stack
     * @param {*} event the commonmark parser event
     * @param {*} tag the html tag
     * @param {*} node the commonmark node
     * @param {*} parseNestedMarkdown a function used to parse nested markdown
     * @returns {boolean} true if the plugin has handled this block
     */
    fromMarkdown(stack, event, tag, node, parseNestedMarkdown) {
        const block = {
            object: 'block',
            type: 'clause',
            data: tag,
            nodes: [],
        };

        stack.push(block);

        const para = {
            object: 'block',
            type: 'paragraph',
            data: {},
            nodes: [],
        };

        stack.push(para);

        // sub-parse of the contents of the clause node
        const text = tag.content ? tag.content : node.literal;
        const slateDoc = parseNestedMarkdown(text).toJSON();
        slateDoc.document.nodes.forEach(node => stack.append(node));
        stack.pop();
        stack.pop();
        return true;
    }
}

module.exports = ClausePlugin;
