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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const { NS_PREFIX_CiceroMarkTemplateModel, CiceroMarkTemplateModel } = require('./externalModels/CiceroMarkTemplateModel.js');

const parserOfTemplateAst = require('../lib/FromTemplateAst').parserOfTemplateAst;

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text for the clause
 * @return {string} - the normalized text for the clause
 */
function normalizeText(input) {
    // we replace all \r and \n with \n
    let text =  input.replace(/\r/gm,'');
    return text;
}

/**
 * Support for CiceroMark Templates
 */
class TemplateTransformer {
    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @param {object} template the template ast
     * @returns {object} the result of parsing
     */
    parse(markdown, template) {
        const normalizedMarkdown = normalizeText(markdown);
        const parser = parserOfTemplateAst(template);
        const result = parser.parse(normalizedMarkdown);
        // XXX Add error handling here
        return result;
    }

}

module.exports.normalizeText = normalizeText;
module.exports.TemplateTransformer = TemplateTransformer;