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

const formulaName = require('./util').formulaName;
const { getAttr } = require('@accordproject/markdown-common').CommonMarkUtils;
const { TemplateMarkModel } = require('@accordproject/markdown-common');

// Inline rules
const variableRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.VariableDefinition`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const format = getAttr(token.attrs,'format',null);
        if (format) {
            node.$class = `${TemplateMarkModel.NAMESPACE}.FormattedVariableDefinition`;
            node.format = format;
        }
        node.name = getAttr(token.attrs,'name',null);
        node.format = getAttr(token.attrs,'format',null);
    },
    skipEmpty: false,
};
const thisRule = { // 'this' is a special variable for the current data in scope within the template
    tag: `${TemplateMarkModel.NAMESPACE}.VariableDefinition`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const format = getAttr(token.attrs,'format',null);
        if (format) {
            node.$class = `${TemplateMarkModel.NAMESPACE}.FormattedVariableDefinition`;
            node.format = format;
        }
        node.name = 'this';
        node.format = getAttr(token.attrs,'format',null);
    },
    skipEmpty: false,
};
const formulaRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.FormulaDefinition`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const code = token.content;
        node.name = formulaName(code);
        node.code = {
            $class:  `${TemplateMarkModel.NAMESPACE}.Code`,
            type: 'ES_2020',
            contents: code
        };
        node.dependencies = [];
    },
    skipEmpty: false,
};
const ifOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ConditionalDefinition`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        const condition = getAttr(token.attrs,'condition',null);
        if(condition) {
            node.condition = {
                $class:  `${TemplateMarkModel.NAMESPACE}.Code`,
                type: 'ES_2020',
                contents: condition
            };
        }
        node.whenTrue = null;
        node.whenFalse = null;
    },
    skipEmpty: false,
};
const ifCloseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ConditionalDefinition`,
    leaf: false,
    open: false,
    close: true,
    exit: (node,token,callback) => {
        if (node.whenTrue) {
            node.whenFalse = node.nodes ? node.nodes : [];
        } else {
            node.whenTrue = node.nodes ? node.nodes : [];
            node.whenFalse = [];
        }
        delete node.nodes; // Delete children (now in whenTrue or whenFalse)
    },
    skipEmpty: false,
};
const elseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ConditionalDefinition`,
    leaf: false,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        if (node.$class === `${TemplateMarkModel.NAMESPACE}.ConditionalDefinition`) {
            node.whenTrue = node.nodes ? node.nodes : [];
            node.nodes = []; // Reset children (now in whenTrue)
        } else { // Optional definition
            node.whenSome = node.nodes ? node.nodes : [];
            node.nodes = []; // Reset children (now in whenSome)
        }
    },
    skipEmpty: false,
};
const optionalOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.OptionalDefinition`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.whenSome = null;
        node.whenNone = null;
    },
    skipEmpty: false,
};
const optionalCloseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.OptionalDefinition`,
    leaf: false,
    open: false,
    close: true,
    exit: (node,token,callback) => {
        if (node.whenSome) {
            node.whenNone = node.nodes ? node.nodes : [];
        } else {
            node.whenSome = node.nodes ? node.nodes : [];
            node.whenNone = [];
        }
        delete node.nodes; // Delete children (now in whenSome or whenNone)
    },
    skipEmpty: false,
};
const withOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.WithDefinition`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => { node.name = getAttr(token.attrs,'name',null); },
    skipEmpty: false,
};
const withCloseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.WithDefinition`,
    leaf: false,
    open: false,
    close: true,
};
const joinOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.JoinDefinition`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        node.separator = getAttr(token.attrs,'separator',',');
        node.lastSeparator = getAttr(token.attrs,'lastSeparator',null);
    },
    skipEmpty: false,
};
const joinCloseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.JoinDefinition`,
    leaf: false,
    open: false,
    close: true,
};

// Block rules
const clauseOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.name = getAttr(token.attrs,'name',null);
        const condition = getAttr(token.attrs,'condition',null);
        if(condition) {
            node.condition = {
                $class:  `${TemplateMarkModel.NAMESPACE}.Code`,
                type: 'ES_2020',
                contents: condition
            };
        }
    },
};
const clauseCloseRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
    leaf: false,
    open: false,
    close: true,
};
const ulistOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`,
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
    tag: `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`,
    leaf: false,
    open: false,
    close: true,
};
const olistOpenRule = {
    tag: `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`,
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
    tag: `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`,
    leaf: false,
    open: false,
    close: true,
};

const rules = { inlines: {}, blocks: {}};
rules.inlines.variable = variableRule;
rules.inlines.this = thisRule;
rules.inlines.formula = formulaRule;
rules.inlines.inline_block_if_open = ifOpenRule;
rules.inlines.inline_block_if_close = ifCloseRule;
rules.inlines.inline_block_optional_open = optionalOpenRule;
rules.inlines.inline_block_optional_close = optionalCloseRule;
rules.inlines.inline_block_else = elseRule;
rules.inlines.inline_block_with_open = withOpenRule;
rules.inlines.inline_block_with_close = withCloseRule;
rules.inlines.inline_block_join_open = joinOpenRule;
rules.inlines.inline_block_join_close = joinCloseRule;

rules.blocks.block_clause_open = clauseOpenRule;
rules.blocks.block_clause_close = clauseCloseRule;
rules.blocks.block_ulist_open = ulistOpenRule;
rules.blocks.block_ulist_close = ulistCloseRule;
rules.blocks.block_olist_open = olistOpenRule;
rules.blocks.block_olist_close = olistCloseRule;

module.exports = rules;
