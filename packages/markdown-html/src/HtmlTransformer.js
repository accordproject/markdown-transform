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

/**
 * Converts a CiceroMark or CommonMark DOM to HTML
 */
class HtmlTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Converts a CiceroMark DOM to an html string
     * @param {*} concertoObject - concerto CiceroMark DOM object
     * @returns {string} the html string
     */
    toHtmlStringConcerto(concertoObject) {
        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToHtmlStringVisitor(this.options);
        concertoObject.accept(visitor, parameters);
        return parameters.result.trim();
    }
}

module.exports = HtmlTransformer;