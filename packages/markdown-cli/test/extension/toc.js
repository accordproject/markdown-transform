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

// What nodes should we keep in a table of contents?
const keepContent = ['Heading'];
const keepNode = ['Document'];

/**
 * Create a table of contents in commonmark format
 * @param {object} input - the commonmark document
 * @return {object} - the table of contents
 */
function createToc(input) {
    const result = Object.assign({}, input);
    const typeName = input.$class.split('.').pop();
    if (keepContent.some((name) => typeName === name)) {
        return [result];
    }
    if (keepNode.some((name) => typeName === name)) {
        result.nodes = input.nodes.flatMap(createToc);
        return [result];
    }
    return [];
}

module.exports = {
    format: {
        name: 'toc',
        docs: 'table of contents',
        fileFormat: 'utf8'
    },
    transforms: {
        // Transform commonmark into a table of contents
        commonmark: {
            toc: (input, parameters, options) => createToc(input)[0],
        },
        // Transform a table of contents back into commonmark
        toc: {
            commonmark: ((input, parameteres, options) => input),
        },
    }
};
