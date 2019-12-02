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

const ToHtmlStringVisitor = require('./ToHtmlStringVisitor');
const ToCiceroMarkVisitor = require('./ToCiceroMarkVisitor');
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

/**
 * Converts a CiceroMark or CommonMark DOM to HTML
 */
class HtmlTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options = {}) {
        this.options = options;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
    }

    /**
     * Converts a CiceroMark DOM to an html string
     * @param {*} input - CiceroMark DOM object
     * @returns {string} the html string
     */
    toHtml(input) {

        if(!input.getType) {
            input = this.ciceroMarkTransformer.getSerializer().fromJSON(input);
        }

        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToHtmlStringVisitor(this.options);
        input.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} CiceroMark DOM
     */
    toCiceroMark(input, format = 'concerto') {
        const visitor = new ToCiceroMarkVisitor(this.options);
        return visitor.toCiceroMark(input, format);
    }
}

module.exports = HtmlTransformer;