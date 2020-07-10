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

const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;

const rules = {};
// Inlines
rules.Formula = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('{{%'),resultString(thing.value),resultString('%}}')];
    resultSeq(parameters,result);
};
// Container blocks
rules.Clause = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    const srcAttr = thing.src ? ' src="' + thing.src + '"' : '';
    const next2 = `{{#clause ${thing.name}${srcAttr}}}\n`;
    const closeParameters = Object.assign({},parameters);
    closeParameters.stack = Object.assign({},parameters.stack);
    closeParameters.stack.first = false;
    const next3 = CommonMarkUtils.mkPrefix(closeParameters,1);
    const next4 = '{{/clause}}';
    const result = [resultString(next1),resultString(next2),children,resultString(next3),resultString(next4)];
    resultSeq(parameters,result);
};

module.exports = rules;