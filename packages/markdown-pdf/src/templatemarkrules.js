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

const rules = {};

// Inlines
rules.EnumVariableDefinition = (visitor, thing, children, parameters) => {
    const fixedText = thing.name;
    parameters.result.text = fixedText;
    parameters.result.color = '#A4BBE7';
};
rules.VariableDefinition = (visitor, thing, children, parameters) => {
    const fixedText = thing.name;
    parameters.result.text = fixedText;
    parameters.result.color = '#A4BBE7';
};
rules.FormulaDefinition = (visitor, thing, children, parameters) => {
    const fixedText = thing.code;
    parameters.result.text = fixedText;
    parameters.result.color = '#AF54C4';
};

// Blocks
const defaultStackRule = (visitor, thing, children, parameters) => {
    parameters.result.stack = children;
};
rules.ClauseDefinition = defaultStackRule;
rules.ContractDefinition = defaultStackRule;
rules.WithDefinition = defaultStackRule;
rules.JoinDefinition = defaultStackRule;
rules.ListBlockDefinition = defaultStackRule;
rules.ForeachDefinition = defaultStackRule;
rules.WithBlockDefinition = defaultStackRule;
rules.OptionalDefinition = (visitor, thing, children, parameters) => {
    const whenSomeChildren = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
    // const whenNoneParser = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
    parameters.result.stack = whenSomeChildren;
};
rules.OptionalBlockDefinition = (visitor, thing, children, parameters) => {
    const whenSomeChildren = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
    // const whenNoneParser = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
    parameters.result.stack = whenSomeChildren;
};
rules.ConditionalDefinition = (visitor, thing, children, parameters) => {
    const whenTrueChildren = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
    // const whenFalseParser = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
    parameters.result.stack = whenTrueChildren;
};
rules.ConditionalBlockDefinition = (visitor, thing, children, parameters) => {
    const whenTrueChildren = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
    // const whenFalseParser = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
    parameters.result.stack = whenTrueChildren;
};

module.exports = rules;
