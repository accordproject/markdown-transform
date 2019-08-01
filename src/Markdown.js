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
 * Abstract class
 */
class Markdown {

    /**
     * Constructs the abstract Markdown class
     * @param {*} pluginManager the plugin manager to use
     */
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
    }

    /**
   * Converts a string to camel case
   * @param {string} input the input string
   * @return {string} the input converted to camelCase
   */
    static camelCase(input) {
        return input.toLowerCase().replace(/-|_(.)/g, (match, group1) => group1.toUpperCase());
    }
}

module.exports = Markdown;
