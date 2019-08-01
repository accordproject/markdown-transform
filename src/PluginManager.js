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
 * Manages a set of plugins
 */
class PluginManager {

    /**
    * Construct the plugin manager
    * @param {object[]} plugins  the plugins to register
    */
    constructor(plugins) {
        this.plugins = plugins;
    }

    /**
   * Returns the first plugin that can handle a tag or null
   * @param {string} tagName - the name of the tag
   * @param {*} search - the value to search for
   * @return {Plugin} - the plugin or null
   */
    findPlugin(tagName, search) {
        for (let n = 0; n < this.plugins.length; n += 1) {
            const plugin = this.plugins[n];

            for (let i = 0; i < plugin.getTags().length; i += 1) {
                const tag = plugin.getTags()[i];
                const tagValue = tag[tagName];

                if (tagValue) {
                    let result = false;
                    if (typeof tagValue === 'function') {
                        result = tagValue(search);
                    } else {
                        result = tagValue === search;
                    }
                    if (result) {
                        return plugin;
                    }
                }
            }
        }

        // eslint-disable-next-line no-console
        console.log(`Failed to find plugin ${tagName}:${search}`);
        return null;
    }
}

module.exports = PluginManager;
