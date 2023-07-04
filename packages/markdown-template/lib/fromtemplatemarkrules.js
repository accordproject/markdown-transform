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

var CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;
var rules = {};
// Inlines
rules.VariableDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = [resultString('{{'), resultString(thing.name), resultString('}}')];
  resultSeq(parameters, result);
};
rules.FormattedVariableDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = [resultString('{{'), resultString(thing.name), resultString(' as "'), resultString(thing.format), resultString('"}}')];
  resultSeq(parameters, result);
};
rules.EnumVariableDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = [resultString('{{'), resultString(thing.name), resultString('}}')];
  resultSeq(parameters, result);
};
rules.FormulaDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var result = [resultString('{{%'), resultString(thing.code), resultString('%}}')];
  resultSeq(parameters, result);
};
rules.ConditionalDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var next1 = "{{#if ".concat(thing.name, "}}");
  var whenTrue = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
  var whenFalse = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
  var next2 = '{{/if}}';
  var result;
  if (whenFalse) {
    var next3 = '{{else}}';
    result = [resultString(next1), resultString(whenTrue), resultString(next3), resultString(whenFalse), resultString(next2)];
  } else {
    result = [resultString(next1), resultString(whenTrue), resultString(next2)];
  }
  resultSeq(parameters, result);
};
rules.OptionalDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var next1 = "{{#optional ".concat(thing.name, "}}");
  var whenSome = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
  var whenNone = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
  var next2 = '{{/optional}}';
  var result;
  if (whenNone) {
    var next3 = '{{else}}';
    result = [resultString(next1), resultString(whenSome), resultString(next3), resultString(whenNone), resultString(next2)];
  } else {
    result = [resultString(next1), resultString(whenSome), resultString(next2)];
  }
  resultSeq(parameters, result);
};
rules.WithDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var next1 = "{{#with ".concat(thing.name, "}}");
  var next2 = '{{/with}}';
  var result = [resultString(next1), children, resultString(next2)];
  resultSeq(parameters, result);
};
rules.JoinDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var sepAttr = thing.separator ? ' separator="' + thing.separator + '"' : '';
  var localeAttr = thing.locale ? ' locale="' + thing.locale + '"' : '';
  var typeAttr = thing.type ? ' type="' + thing.type + '"' : '';
  var styleAttr = thing.style ? ' style="' + thing.style + '"' : '';
  var next1 = "{{#join ".concat(thing.name).concat(sepAttr).concat(localeAttr).concat(typeAttr).concat(styleAttr, "}}");
  var next2 = '{{/join}}';
  var result = [resultString(next1), children, resultString(next2)];
  resultSeq(parameters, result);
};
// Container blocks
rules.ListBlockDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var listKind = thing.type === 'bullet' ? 'ulist' : 'olist';
  var prefix = CommonMarkUtils.mkPrefix(parameters, 1);
  var next1 = prefix;
  var next2 = "{{#".concat(listKind, " ").concat(thing.name, "}}\n");
  var next3 = prefix;
  var next4 = "{{/".concat(listKind, "}}");
  var result = [resultString(next1), resultString(next2), children, resultString(next3), resultString(next4)];
  resultSeq(parameters, result);
};
rules.ClauseDefinition = (visitor, thing, children, parameters, resultString, resultSeq) => {
  var next1 = CommonMarkUtils.mkPrefix(parameters, 2);
  var srcAttr = thing.src ? ' src="' + thing.src + '"' : '';
  var next2 = "{{#clause ".concat(thing.name).concat(srcAttr, "}}\n");
  var next3 = '\n{{/clause}}';
  var result = [resultString(next1), resultString(next2), children, resultString(next3)];
  resultSeq(parameters, result);
};
module.exports = rules;