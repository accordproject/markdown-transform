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
const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const NS_PREFIX_TemplateMarkModel = require('./externalModels/TemplateMarkModel').NS_PREFIX_TemplateMarkModel;

const commonMark = new CommonMarkTransformer({tagInfo: true});

// Inline rules
const variableRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'VariableDefinition',
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const format = getAttr(token.attrs,'format',null);;
        if (format) {
            node.$class = NS_PREFIX_TemplateMarkModel + 'FormattedVariableDefinition';
            node.format = format;
        }
        node.name = getAttr(token.attrs,'name',null);
        node.format = getAttr(token.attrs,'format',null);
    },
    skipEmpty: false,
};
const formulaRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'FormulaDefinition',
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.code = token.content;
        node.dependencies = [];
    },
    skipEmpty: false,
};
const ifOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ConditionalDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.whenTrue = null;
        node.whenFalse = null;
    },
    skipEmpty: false,
};
const ifElseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ConditionalDefinition',
    leaf: false,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        node.whenTrue = node.nodes ? node.nodes : [];
        node.nodes = []; // Reset children (now in whenTrue)
    },
    skipEmpty: false,
};
const ifCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ConditionalDefinition',
    leaf: false,
    open: false,
    close: true,
    exit: (node,token,callback) => {
        if (node.whenTrue) {
            node.whenTrue = node.whenTrue;
            node.whenFalse = node.nodes ? node.nodes : [];
        } else {
            node.whenTrue = node.nodes ? node.nodes : [];
            node.whenFalse = [];
        }
        delete node.nodes; // Delete children (now in whenTrue or whenFalse)
    },
    skipEmpty: false,
};
const withOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'WithDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => { node.name = getAttr(token.attrs,'name',null); },
    skipEmpty: false,
};
const withCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'WithDefinition',
    leaf: false,
    open: false,
    close: true,
};

// Block rules
const clauseOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ClauseDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
    },
};
const clauseCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ClauseDefinition',
    leaf: false,
    open: false,
    close: true,
};
const ulistOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ListBlockDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.type = 'bullet';
        node.tight = 'true';
    },
};
const ulistCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ListBlockDefinition',
    leaf: false,
    open: false,
    close: true,
};
const olistOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ListBlockDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.type = 'ordered';
        node.tight = 'true';
        node.start = '1';
        node.delimiter = 'period';
    },
};
const olistCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ListBlockDefinition',
    leaf: false,
    open: false,
    close: true,
};

const rules = { inlines: {}, blocks: {}};
rules.inlines.variable = variableRule;
rules.inlines.formula = formulaRule;
rules.inlines.inline_block_if_open = ifOpenRule;
rules.inlines.inline_block_if_else = ifElseRule;
rules.inlines.inline_block_if_close = ifCloseRule;
rules.inlines.inline_block_with_open = withOpenRule;
rules.inlines.inline_block_with_close = withCloseRule;

rules.blocks.block_clause_open = clauseOpenRule;
rules.blocks.block_clause_close = clauseCloseRule;
rules.blocks.block_ulist_open = ulistOpenRule;
rules.blocks.block_ulist_close = ulistCloseRule;
rules.blocks.block_olist_open = olistOpenRule;
rules.blocks.block_olist_close = olistCloseRule;

module.exports = rules;
