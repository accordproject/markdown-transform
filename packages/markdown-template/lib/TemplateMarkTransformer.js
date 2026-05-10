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

/**
 * @typedef {{
 *   type: string,
 *   tag: string,
 *   nesting: number,
 *   attrs?: Array<[string, string]> | null,
 *   map?: [number, number] | null,
 *   level?: number,
 *   children?: MarkdownToken[] | null,
 *   content?: string,
 *   markup?: string,
 *   info?: string,
 *   meta?: unknown,
 *   block?: boolean,
 *   hidden?: boolean
 * }} MarkdownToken
 */

/**
 * @typedef {MarkdownToken[]} MarkdownTokenStream
 */

/**
 * @typedef {{ $class: string, [key: string]: unknown }} TemplateMarkJson
 */

/**
 * @typedef {{ fileName?: string, content: string }} TemplateInput
 */

/**
 * @typedef {'clause' | 'contract'} TemplateKind
 */

/**
 * @typedef {{ verbose?: boolean }} TemplateTransformOptions
 */

/**
 * Support for TemplateMark Templates
 */
class TemplateMarkTransformer {
  /**
   * Converts a template string to a token stream
   * @param {TemplateInput} templateInput the template template
   * @returns {MarkdownTokenStream} the token stream
   */
  toTokens(templateInput) {
    return templateToTokens(templateInput.content);
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * Converts a template token strean string to a TemplateMark DOM
   * @param {MarkdownTokenStream} tokenStream the template token stream
   * @param {import('@accordproject/concerto-core').ModelManager} modelManager - the model manager for this template
   * @param {TemplateKind} templateKind - either 'clause' or 'contract'
   * @param {TemplateTransformOptions} [options] configuration options
   * @param {boolean} [options.verbose] verbose output
   * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
   * @returns {TemplateMarkJson} the result of parsing
   */
  tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options, conceptFullyQualifiedName) {
    var template = tokensToUntypedTemplateMark(tokenStream, templateKind);
    if (options && options.verbose) {
      console.log('===== Untyped TemplateMark ');
      console.log(JSON.stringify(template, null, 2));
    }
    var typedTemplate = templateMarkTyping(template, modelManager, templateKind, conceptFullyQualifiedName);
    if (options && options.verbose) {
      console.log('===== TemplateMark ');
      console.log(JSON.stringify(typedTemplate, null, 2));
    }
    return typedTemplate;
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * Converts a markdown string to a TemplateMark DOM
   * @param {TemplateInput} templateInput the template template
   * @param {import('@accordproject/concerto-core').ModelManager} modelManager - the model manager for this template
   * @param {TemplateKind} templateKind - either 'clause' or 'contract'
   * @param {TemplateTransformOptions} [options] configuration options
   * @param {boolean} [options.verbose] verbose output
   * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
   * @returns {TemplateMarkJson} the result of parsing
   */
  fromMarkdownTemplate(templateInput, modelManager, templateKind, options, conceptFullyQualifiedName) {
    if (!modelManager) {
      throw new Error('Cannot parse without template model');
    }
    var tokenStream = this.toTokens(templateInput);
    if (options && options.verbose) {
      console.log('===== MarkdownIt Tokens ');
      console.log(JSON.stringify(tokenStream, null, 2));
    }
    return this.tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options, conceptFullyQualifiedName);
  }

  /**
   * Converts a TemplateMark DOM to a template markdown string
   * @param {TemplateMarkJson} input TemplateMark DOM
   * @returns {string} the template markdown text
   */
  toMarkdownTemplate(input) {
    var visitor = new ToMarkdownTemplateVisitor();
    return visitor.toMarkdownTemplate(templateMarkManager.serializer, input);
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * Get TemplateMark serializer
   * @return {import('@accordproject/concerto-core').Serializer} templatemark serializer
   */
  getSerializer() {
    return templateMarkManager.serializer;
  }
}
module.exports = TemplateMarkTransformer;