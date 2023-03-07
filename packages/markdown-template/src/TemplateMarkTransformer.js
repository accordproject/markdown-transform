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

const {
    templateMarkManager,
    templateToTokens,
    tokensToUntypedTemplateMark,
    templateMarkTyping,
} = require('./templatemarkutil');

const ToMarkdownTemplateVisitor = require('./ToMarkdownTemplateVisitor');

/**
 * Support for TemplateMark Templates
 */
class TemplateMarkTransformer {
    /**
     * Converts a template string to a token stream
     * @param {object} templateInput the template template
     * @returns {object} the token stream
     */
    toTokens(templateInput) {
        return templateToTokens(templateInput.content);
    }

    /**
     * Converts a template token strean string to a TemplateMark DOM
     * @param {object} tokenStream the template token stream
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options) {
        const template = tokensToUntypedTemplateMark(tokenStream, templateKind);
        if (options && options.verbose) {
            console.log('===== Untyped TemplateMark ');
            console.log(JSON.stringify(template,null,2));
        }
        const typedTemplate = templateMarkTyping(template, modelManager, templateKind);
        if (options && options.verbose) {
            console.log('===== TemplateMark ');
            console.log(JSON.stringify(typedTemplate,null,2));
        }
        return typedTemplate;
    }

    /**
     * Converts a markdown string to a TemplateMark DOM
     * @param {{fileName:string,content:string}} templateInput the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} the result of parsing
     */
    fromMarkdownTemplate(templateInput, modelManager, templateKind, options) {
        if (!modelManager) {
            throw new Error('Cannot parse without template model');
        }

        const tokenStream = this.toTokens(templateInput);
        if (options && options.verbose) {
            console.log('===== MarkdownIt Tokens ');
            console.log(JSON.stringify(tokenStream,null,2));
        }
        return this.tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options);
    }

    /**
     * Converts a TemplateMark DOM to a template markdown string
     * @param {object} input TemplateMark DOM
     * @returns {string} the template markdown text
     */
    toMarkdownTemplate(input) {
        const visitor = new ToMarkdownTemplateVisitor();
        return visitor.toMarkdownTemplate(templateMarkManager.serializer,input);
    }

    /**
     * Get TemplateMark serializer
     * @return {*} templatemark serializer
     */
    getSerializer() {
        return templateMarkManager.serializer;
    }
}

module.exports = TemplateMarkTransformer;