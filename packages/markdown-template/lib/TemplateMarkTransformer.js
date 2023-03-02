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

var {
  templateMarkManager,
  templateToTokens,
  tokensToUntypedTemplateMark,
  templateMarkTyping
} = require('./templatemarkutil');
var ToMarkdownTemplateVisitor = require('./ToMarkdownTemplateVisitor');
var ToCiceroMarkVisitor = require('./ToCiceroMarkVisitor');

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
    var template = tokensToUntypedTemplateMark(tokenStream, templateKind);
    if (options && options.verbose) {
      console.log('===== Untyped TemplateMark ');
      console.log(JSON.stringify(template, null, 2));
    }
    var typedTemplate = templateMarkTyping(template, modelManager, templateKind);
    if (options && options.verbose) {
      console.log('===== TemplateMark ');
      console.log(JSON.stringify(typedTemplate, null, 2));
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
    var tokenStream = this.toTokens(templateInput);
    if (options && options.verbose) {
      console.log('===== MarkdownIt Tokens ');
      console.log(JSON.stringify(tokenStream, null, 2));
    }
    return this.tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options);
  }

  /**
   * Converts a TemplateMark DOM to a template markdown string
   * @param {object} input TemplateMark DOM
   * @returns {string} the template markdown text
   */
  toMarkdownTemplate(input) {
    var visitor = new ToMarkdownTemplateVisitor();
    return visitor.toMarkdownTemplate(templateMarkManager.serializer, input);
  }

  /**
   * Instantiate a CiceroMark DOM from a TemplateMarkDOM
   * @param {*} data the contract/clause data input
   * @param {*} templateMark - the TemplateMark DOM
   * @param {object} modelManager - the model manager for this template
   * @param {string} templateKind - either 'clause' or 'contract'
   * @param {string} currentTime - the definition of 'now'
   * @param {number} utcOffset - the UTC offset
   * @param {object} [options] configuration options
   * @param {boolean} [options.verbose] verbose output
   * @returns {object} the result
   */
  instantiateCiceroMark(data, templateMark, modelManager, templateKind, currentTime, utcOffset, options) {
    var parameters = {
      templateMarkModelManager: templateMarkManager.modelManager,
      templateMarkSerializer: templateMarkManager.serializer,
      fullData: data,
      data: data,
      currentTime
    };
    var input = templateMarkManager.serializer.fromJSON(templateMark);
    var visitor = new ToCiceroMarkVisitor();
    input.accept(visitor, parameters);
    var result = Object.assign({}, templateMarkManager.serializer.toJSON(input));
    return result;
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