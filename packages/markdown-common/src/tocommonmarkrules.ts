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

import { unescapeCodeBlock, parseHtmlBlock, headingLevel, getAttr, trimEndline } from './CommonMarkUtils';
import * as CommonMarkModel from './externalModels/CommonMarkModel';

export interface MarkdownItRule {
    tag: string;
    leaf: boolean;
    open: boolean;
    close: boolean;
    skipEmpty?: boolean;
    enter?: (node: any, token: any, callback: (tokens: any[]) => any[]) => void;
    exit?: (node: any, token: any, callback: (tokens: any[]) => any[]) => void;
}

export interface MarkdownItRules {
    inlines: Record<string, MarkdownItRule>;
    blocks: Record<string, MarkdownItRule>;
}

// Inline rules
const textRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Text`,
    leaf: true,
    open: false,
    close: false,
    enter: (node, token) => { node.text = token.content; },
    skipEmpty: true,
};
const codeInlineRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Code`,
    leaf: true,
    open: false,
    close: false,
    enter: (node, token) => { node.text = token.content; },
    skipEmpty: false,
};
const softbreakRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Softbreak`,
    leaf: true,
    open: false,
    close: false,
    skipEmpty: false,
};
const hardbreakRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Linebreak`,
    leaf: true,
    open: false,
    close: false,
    skipEmpty: false,
};
const htmlInlineRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HtmlInline`,
    leaf: true,
    open: false,
    close: false,
    enter: (node, token) => {
        node.text = token.content;
        node.tag = parseHtmlBlock(token.content);
    },
    skipEmpty: false,
};
const strongOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Strong`,
    leaf: false,
    open: true,
    close: false,
    skipEmpty: false,
};
const strongCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Strong`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const emphOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Emph`,
    leaf: false,
    open: true,
    close: false,
    skipEmpty: false,
};
const emphCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Emph`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const linkOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Link`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token) => {
        node.destination = getAttr(token.attrs, 'href', '');
        node.title = getAttr(token.attrs, 'title', '');
    },
    skipEmpty: false,
};
const linkCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Link`,
    leaf: false,
    open: false,
    close: true,
    skipEmpty: false,
};
const imageRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Image`,
    leaf: false,
    open: true,
    close: true,
    enter: (node, token, callback) => {
        node.destination = getAttr(token.attrs, 'src', '');
        node.title = getAttr(token.attrs, 'title', '');
        node.nodes = callback(token.children);
    },
    skipEmpty: false,
};

// Block rules
const codeBlockRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.CodeBlock`,
    leaf: true,
    open: false,
    close: false,
    enter: (node, token) => {
        const info = token.info.trim();
        node.info = info ? info : null;
        node.tag = parseHtmlBlock(info);
        node.text = token.content ? unescapeCodeBlock(token.content) : '';
    },
};
const fenceRule = codeBlockRule;
const htmlBlockRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HtmlBlock`,
    leaf: true,
    open: false,
    close: false,
    enter: (node, token) => {
        const content = trimEndline(token.content);
        node.tag = parseHtmlBlock(content);
        node.text = content;
    },
};
const hrRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.ThematicBreak`,
    leaf: true,
    open: false,
    close: false,
    enter: () => { /* no-op */ },
};
const paragraphOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Paragraph`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};
const paragraphCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Paragraph`,
    leaf: false,
    open: false,
    close: true,
};
const headingOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Heading`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token) => {
        node.level = headingLevel(token.tag);
    },
};
const headingCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Heading`,
    leaf: false,
    open: false,
    close: true,
};
const blockQuoteOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.BlockQuote`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};
const blockQuoteCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.BlockQuote`,
    leaf: false,
    open: false,
    close: true,
};
const bulletListOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: true,
    close: false,
    enter: (node) => {
        node.type = 'bullet';
        node.tight = 'true';
    },
};
const bulletListCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};
const orderedListOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: true,
    close: false,
    enter: (node, token) => {
        node.type = 'ordered';
        node.start = getAttr(token.attrs, 'start', '1');
        node.tight = 'true';
        node.delimiter = token.markup === ')' ? 'paren' : 'period';
    },
};
const orderedListCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};
const listItemOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Item`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};
const listItemCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.List`,
    leaf: false,
    open: false,
    close: true,
};

const tableOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Table`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const tableCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.Table`,
    leaf: false,
    open: false,
    close: true,
};

const tableHeadOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableHead`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const tableHeadCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableHead`,
    leaf: false,
    open: false,
    close: true,
};

const tableBodyOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableBody`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const tableBodyCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableBody`,
    leaf: false,
    open: false,
    close: true,
};

const tableRowOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableRow`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const tableRowCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableRow`,
    leaf: false,
    open: false,
    close: true,
};

const headerCellOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HeaderCell`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const headerCellCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.HeaderCell`,
    leaf: false,
    open: false,
    close: true,
};

const tableCellOpenRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableCell`,
    leaf: false,
    open: true,
    close: false,
    enter: () => { /* no-op */ },
};

const tableCellCloseRule: MarkdownItRule = {
    tag: `${CommonMarkModel.NAMESPACE}.TableCell`,
    leaf: false,
    open: false,
    close: true,
};

const rules: MarkdownItRules = { inlines: {}, blocks: {} };
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

export default rules;
