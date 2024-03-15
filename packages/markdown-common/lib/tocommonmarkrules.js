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

const { unescapeCodeBlock, parseHtmlBlock, headingLevel, getAttr, trimEndline } = require('./CommonMarkUtils');
const CommonMarkModel = require('./externalModels/CommonMarkModel');

// Inline rules
const textRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Text`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => { node.text = token.content; },
    skipEmpty: true,
};
const codeInlineRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Code`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => { node.text = token.content; },
    skipEmpty: false,
};
const softbreakRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Softbreak`,
    leaf: true,
    open: false,
    close: false,
    skipEmpty: false,
};
const hardbreakRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Linebreak`,
    leaf: true,
    open: false,
    close: false,
    skipEmpty: false,
};
const htmlInlineRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HtmlInline`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        node.text = token.content;
        node.tag = parseHtmlBlock(token.content);
    },
    skipEmpty: false,
};
const strongOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Strong`,
    leaf: false,
    open: true,
    close: false,
    skipEmpty: false,
};
const strongCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Strong`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const emphOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Emph`,
    leaf: false,
    open: true,
    close: false,
    skipEmpty: false,
};
const emphCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Emph`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const linkOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Link`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.destination = getAttr(token.attrs,'href','');
        node.title = getAttr(token.attrs,'title','');
    },
    skipEmpty: false,
};
const linkCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Link`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const imageRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Image`,
    leaf: false,
    open: true,
    close: true,
    enter: (node,token,callback) => {
        node.destination = getAttr(token.attrs,'src','');
        node.title = getAttr(token.attrs,'title','');
        node.nodes = callback(token.children);
    },
    skipEmpty: false,
};

// Block rules
const codeBlockRule = {
    tag: `${CommonMarkModel.NAMESPACE}.CodeBlock`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const info = token.info.trim();
        node.info = info ? info : null;
        node.tag = parseHtmlBlock(info);
        node.text = token.content ? unescapeCodeBlock(token.content) : '';
    },
};
const fenceRule = codeBlockRule;
const htmlBlockRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HtmlBlock`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
        const content = trimEndline(token.content);
        node.tag = parseHtmlBlock(content);
        node.text = content;
    },
};
const hrRule = {
    tag: `${CommonMarkModel.NAMESPACE}.ThematicBreak`,
    leaf: true,
    open: false,
    close: false,
    enter: (node,token,callback) => {
    },
};
const paragraphOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Paragraph`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
    },
};
const paragraphCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Paragraph`,
    leaf: false,
    open: false,
    close: true,
};
const headingOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Heading`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.level = headingLevel(token.tag);
    },
};
const headingCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Heading`,
    leaf: false,
    open: false,
    close: true,
};
const blockQuoteOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.BlockQuote`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
    },
};
const blockQuoteCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.BlockQuote`,
    leaf: false,
    open: false,
    close: true,
};
const bulletListOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.type = 'bullet';
        node.tight = 'true'; // XXX Default but can be overridden when closing the list tag
    },
};
const bulletListCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};
const orderedListOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.type = 'ordered';
        node.start = getAttr(token.attrs,'start','1');
        node.tight = 'true'; // XXX Default but can be overridden when closing the list tag
        node.delimiter = token.markup === ')' ? 'paren' : 'period';
    },
};
const orderedListCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};
const listItemOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Item`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
    },
};
const listItemCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};

const romanListOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: true,
    close: false,
    enter: (node,token,callback) => {
        node.type = 'roman';
        node.tight = 'true'; // XXX Default but can be overridden when closing the list tag
    },
};
const romanListCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};

const tableOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Table`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const tableCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Table`,
    leaf: false,
    open: false,
    close: true,
};

const tableHeadOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableHead`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const tableHeadCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableHead`,
    leaf: false,
    open: false,
    close: true,
};

const tableBodyOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableBody`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const tableBodyCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableBody`,
    leaf: false,
    open: false,
    close: true,
};

const tableRowOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableRow`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const tableRowCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableRow`,
    leaf: false,
    open: false,
    close: true,
};

const headerCellOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HeaderCell`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const headerCellCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HeaderCell`,
    leaf: false,
    open: false,
    close: true,
};

const tableCellOpenRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableCell`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token, callback) => {},
};

const tableCellCloseRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableCell`,
    leaf: false,
    open: false,
    close: true,
};

const rules = { inlines: {}, blocks: {}};
rules.inlines.text = textRule;
rules.inlines.code_inline = codeInlineRule;
rules.inlines.softbreak = softbreakRule;
rules.inlines.hardbreak = hardbreakRule;
rules.inlines.html_inline = htmlInlineRule;
rules.inlines.strong_open = strongOpenRule;
rules.inlines.strong_close = strongCloseRule;
rules.inlines.em_open = emphOpenRule;
rules.inlines.em_close = emphCloseRule;
rules.inlines.link_open = linkOpenRule;
rules.inlines.link_close = linkCloseRule;
rules.inlines.image = imageRule;

rules.blocks.code_block = codeBlockRule;
rules.blocks.fence = fenceRule;
rules.blocks.html_block = htmlBlockRule;
rules.blocks.hr = hrRule;
rules.blocks.paragraph_open = paragraphOpenRule;
rules.blocks.paragraph_close = paragraphCloseRule;
rules.blocks.heading_open = headingOpenRule;
rules.blocks.heading_close = headingCloseRule;
rules.blocks.blockquote_open = blockQuoteOpenRule;
rules.blocks.blockquote_close = blockQuoteCloseRule;
rules.blocks.bullet_list_open = bulletListOpenRule;
rules.blocks.bullet_list_close = bulletListCloseRule;
rules.blocks.ordered_list_open = orderedListOpenRule;
rules.blocks.ordered_list_close = orderedListCloseRule;
rules.blocks.roman_list_open = romanListOpenRule;
rules.blocks.roman_list_close = romanListCloseRule;
rules.blocks.roma_list = romanListOpenRule;
rules.blocks.list_item_open = listItemOpenRule;
rules.blocks.list_item_close = listItemCloseRule;
rules.blocks.table_open = tableOpenRule;
rules.blocks.table_close = tableCloseRule;
rules.blocks.thead_open = tableHeadOpenRule;
rules.blocks.thead_close = tableHeadCloseRule;
rules.blocks.tbody_open = tableBodyOpenRule;
rules.blocks.tbody_close = tableBodyCloseRule;
rules.blocks.tr_open = tableRowOpenRule;
rules.blocks.tr_close = tableRowCloseRule;
rules.blocks.th_open = headerCellOpenRule;
rules.blocks.th_close = headerCellCloseRule;
rules.blocks.td_open = tableCellOpenRule;
rules.blocks.td_close = tableCellCloseRule;

module.exports = rules;
