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

const { getAttr } = require('@accordproject/markdown-common').CommonMarkUtils;
const NS_PREFIX_CiceroMarkModel = require('./externalModels/CiceroMarkModel').NS_PREFIX_CiceroMarkModel;

// Inline rules
const formulaRule = {
    tag: NS_PREFIX_CiceroMarkModel + 'Formula',
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.value = token.content;
        node.dependencies = [];
    },
    skipEmpty: false,
};

// Block rules
const clauseOpenRule = {
    tag: NS_PREFIX_CiceroMarkModel + 'Clause',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.src = getAttr(token.attrs,'src',null);
    },
};
const clauseCloseRule = {
    tag: NS_PREFIX_CiceroMarkModel + 'Clause',
    leaf: false,
    open: false,
    close: true,
};

const rules = { inlines: {}, blocks: {} };
rules.inlines.formula = formulaRule;

rules.blocks.block_clause_open = clauseOpenRule;
rules.blocks.block_clause_close = clauseCloseRule;

module.exports = rules;
