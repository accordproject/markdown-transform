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
  CommonMarkUtils,
  CommonMarkModel
} = require('@accordproject/markdown-common');
var FromCommonMarkVisitor = require('@accordproject/markdown-common').FromCommonMarkVisitor;
var fromcommonmarkrules = require('@accordproject/markdown-common').fromcommonmarkrules;
var fromtemplatemarkrules = require('./fromtemplatemarkrules');

/**
 * Fixes up the root note, removing Clause or Contract indication
 * @param {object} input the input templatemark
 * @return {object} the fixed up templatemark
 */
function fixupRootNode(input) {
  var rootNode = {
    '$class': "".concat(CommonMarkModel.NAMESPACE, ".Document"),
    'xmlns': 'http://commonmark.org/xml/1.0',
    'nodes': input.nodes[0].nodes
  };
  return rootNode;
}

/**
 * Converts a TemplateMark DOM to a template markdown string.
 */
class ToMarkdownTemplateVisitor extends FromCommonMarkVisitor {
  /**
   * Construct the visitor.
   * @param {object} [options] configuration options
   * @param {*} resultSeq how to sequentially combine results
   * @param {object} rules how to process each node type
   */
  constructor(options) {
    var resultString = result => {
      return result;
    };
    var resultSeq = (parameters, result) => {
      result.forEach(next => {
        parameters.result += next;
      });
    };
    var setFirst = thingType => {
      return thingType === 'Item' || thingType === 'ClauseDefinition' || thingType === 'ListBlockDefinition' ? true : false;
    };
    var rules = fromcommonmarkrules;
    Object.assign(rules, fromtemplatemarkrules);
    super(options, resultString, resultSeq, rules, setFirst);
  }

  /**
   * Converts a TemplateMark DOM to a template markdown string.
   * @param {*} serializer - TemplateMark serializer
   * @param {*} input - TemplateMark DOM (JSON)
   * @returns {string} the template markdown string
   */
  toMarkdownTemplate(serializer, input) {
    var parameters = {};
    var fixedInput = serializer.fromJSON(fixupRootNode(input));
    parameters.result = this.resultString('');
    parameters.stack = CommonMarkUtils.blocksInit();
    fixedInput.accept(this, parameters);
    return parameters.result.trim();
  }
}
module.exports = ToMarkdownTemplateVisitor;