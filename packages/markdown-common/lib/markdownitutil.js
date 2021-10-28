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

const MarkdownIt = require('markdown-it');
const MarkdownItAttrs = require('markdown-it-attrs');
const MarkdownItBracketedSpans = require('markdown-it-bracketed-spans');
const MarkdownItContainer = require('markdown-it-container');
const MarkdownItUnderline = require('@accordproject/markdown-it-underline');

const containers = ['warning'];

/**
 * Create a new markdown-it parser
 * @param {string[]} containers - the list of container names supported
 * @param {*[]} extensions - other markdown-it extensions
 * @return {*} a markdown-it parser
 */
function newMarkdownIt(containers, extensions = []) {
    // Default parser
    let markdownIt = new MarkdownIt({html:true}); // XXX HTML inlines and code blocks true
    // Add underline support
    markdownIt = markdownIt.use(MarkdownItUnderline);
    // Add styling support
    markdownIt = markdownIt.use(MarkdownItAttrs);
    markdownIt = markdownIt.use(MarkdownItBracketedSpans);
    // Add containers support
    containers.forEach((container) => {
        markdownIt = markdownIt.use(MarkdownItContainer, container);
    });
    // Add other extensions
    extensions.forEach((extension) => {
        markdownIt = markdownIt.use(extension);
    });
    return markdownIt;
}

module.exports = { containers, newMarkdownIt };
