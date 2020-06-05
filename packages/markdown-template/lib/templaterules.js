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
const ifOpenRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ConditionalDefinition',
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => { node.name = getAttr(token.attrs,'name',null); },
    skipEmpty: false,
};
const ifCloseRule = {
    tag: NS_PREFIX_TemplateMarkModel + 'ConditionalDefinition',
    leaf: false,
    open: false,
    close: true,
    exit: (node,token,callback) => {
        // Recover text from commonmark content
        const jsonSource = {};
        jsonSource.$class = NS_PREFIX_CommonMarkModel + 'Document';
        jsonSource.xmlns = 'http://commonmark.org/xml/1.0';
        jsonSource.nodes = node.nodes;
        const whenTrue = commonMark.toMarkdown(jsonSource);
        node.whenTrue = whenTrue; node.whenFalse = '';
    },
    skipEmpty: false,
};

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
    exit: null,
};

const rules = { inlines: {}, blocks: {}};
rules.inlines.variable = variableRule;
rules.inlines.inline_block_if_open = ifOpenRule;
rules.inlines.inline_block_if_close = ifCloseRule;

rules.blocks.block_clause_open = clauseOpenRule;
rules.blocks.block_clause_close = clauseCloseRule;

module.exports = rules;
