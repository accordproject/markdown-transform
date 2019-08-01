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
 * Handles a custom video tag
 */
class VideoPlugin extends BasePlugin {

    /**
    * Return the name of the plugin
    * @returns {string} the name of the plugin
    */
    getName() {
        return 'video';
    }

    /**
* Return the tags for the plugin
* @returns {object[]} the tags for the plugin
*/
    getTags() {
        return [{
            md: 'video'
        }];
    }

    /**
     * Converts a slate node to markdown
     * @param {ToMarkdown} parent the orchestrator
     * @param {Node} value the slate node
     * @param {Integer} depth the recursive depth
     * @returns {string} the markdown string
     */
    toMarkdown(parent, value, depth) {
        return `<video ${value.data.attributeString}/>\n\n`;
    }

    /**
     * Converts markdown to a slate document
     * @param {*} stack the output stack
     * @param {*} event the parse event
     * @param {*} tag the custom tag
     * @returns {boolean} true if handled
     */
    fromMarkdown(stack, event, tag) {
        const block = {
            object: 'block',
            type: 'video',
            data: Object.assign(tag),
        };

        stack.push(block);
        stack.pop();
        return true;
    }
}

module.exports = VideoPlugin;
