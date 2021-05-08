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
    unquoteString,
} = require('./pdfmakeutil');

const rules = {};

// Inlines
rules.EnumVariable = (visitor, thing, children, parameters) => {
    const fixedText = thing.elementType === 'String' || thing.identifiedBy ? unquoteString(thing.value) : thing.value;
    parameters.result.text = fixedText;
};
rules.FormattedVariable = (visitor, thing, children, parameters) => {
    const fixedText = thing.elementType === 'String' || thing.identifiedBy ? unquoteString(thing.value) : thing.value;
    parameters.result.text = fixedText;
};
rules.Variable = (visitor, thing, children, parameters) => {
    const fixedText = thing.elementType === 'String' || thing.identifiedBy ? unquoteString(thing.value) : thing.value;
    parameters.result.text = fixedText;
};
rules.Formula = (visitor, thing, children, parameters) => {
    const fixedText = thing.elementType === 'String' || thing.identifiedBy ? unquoteString(thing.value) : thing.value;
    parameters.result.text = fixedText;
};
rules.Optional = (visitor, thing, children, parameters) => {
    // Result all children as an array
    parameters.result = children;
};
rules.Conditional = (visitor, thing, children, parameters) => {
    // Result all children as an array
    parameters.result = children;
};

// Blocks
rules.Clause = (visitor, thing, children, parameters) => {
    parameters.result.stack = children;
};

module.exports = rules;
