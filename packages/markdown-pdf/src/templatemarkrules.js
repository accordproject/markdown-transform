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
const defaultInlineRule = (visitor, thing, children, parameters) => {
    parameters.result = children;
};
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
rules.WithDefinition = defaultInlineRule;
rules.JoinDefinition = defaultInlineRule;
rules.ForeachDefinition = defaultInlineRule;
rules.WithBlockDefinition = defaultInlineRule;
rules.OptionalDefinition = (visitor, thing, children, parameters) => {
    const whenSomeChildren = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
    const whenNoneChildren = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
    const allChildren = whenSomeChildren.concat(whenNoneChildren);
    allChildren.forEach((x) => {
        if (!x.color) {
            x.color = '#A4BBE7';
        }
    });
    parameters.result = allChildren;
};
rules.OptionalBlockDefinition = (visitor, thing, children, parameters) => {
    const whenSomeChildren = visitor.visitChildren(visitor, thing, parameters, 'whenSome');
    const whenNoneChildren = visitor.visitChildren(visitor, thing, parameters, 'whenNone');
    const allChildren = whenSomeChildren.concat(whenNoneChildren);
    allChildren.forEach((x) => {
        if (!x.color) {
            x.color = '#A4BBE7';
        }
    });
    parameters.result = allChildren;
};
rules.ConditionalDefinition = (visitor, thing, children, parameters) => {
    const whenTrueChildren = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
    const whenFalseChildren = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
    const allChildren = whenTrueChildren.concat(whenFalseChildren);
    allChildren.forEach((x) => {
        if (!x.color) {
            x.color = '#A4BBE7';
        }
    });
    parameters.result = allChildren;
};
rules.ConditionalBlockDefinition = (visitor, thing, children, parameters) => {
    const whenTrueChildren = visitor.visitChildren(visitor, thing, parameters, 'whenTrue');
    const whenFalseChildren = visitor.visitChildren(visitor, thing, parameters, 'whenFalse');
    const allChildren = whenTrueChildren.concat(whenFalseChildren);
    allChildren.forEach((x) => {
        if (!x.color) {
            x.color = '#A4BBE7';
        }
    });
    parameters.result = allChildren;
};

// Blocks
const defaultBlockRule = (visitor, thing, children, parameters) => {
    parameters.result.stack = children;
};
rules.ClauseDefinition = defaultBlockRule;
rules.ContractDefinition = defaultBlockRule;
rules.ListBlockDefinition = defaultBlockRule;

module.exports = rules;
