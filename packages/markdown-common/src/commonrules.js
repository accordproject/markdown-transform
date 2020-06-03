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

const { parseHtmlBlock, getAttr } = require('./CommonMarkUtils');
const NS_PREFIX_CommonMarkModel = require('./externalModels/CommonMarkModel').NS_PREFIX_CommonMarkModel;

// Inline rules
const textRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Text',
    leaf: true,
    open: false,
    close: false,
    build: (token,callback) => { return { text: token.content }; },
    skipEmpty: true,
};
const codeInlineRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Code',
    leaf: true,
    open: false,
    close: false,
    build: (token,callback) => { return { text: token.content }; },
    skipEmpty: false,
};
const softbreakRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Softbreak',
    leaf: true,
    open: false,
    close: false,
    build: (token,callback) => { return {}; },
    skipEmpty: false,
};
const hardbreakRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Linebreak',
    leaf: true,
    open: false,
    close: false,
    build: (token,callback) => { return {}; },
    skipEmpty: false,
};
const htmlInlineRule = {
    tag: NS_PREFIX_CommonMarkModel + 'HtmlInline',
    leaf: true,
    open: false,
    close: false,
    build: (token,callback) => { return { text: token.content, tag: parseHtmlBlock(token.content) }; },
    skipEmpty: false,
};
const strongOpenRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Strong',
    leaf: false,
    open: true,
    close: false,
    build: (token,callback) => { return {}; },
    skipEmpty: false,
};
const strongCloseRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Strong',
    leaf: false,
    open: false,
    close: true,
    build: null,
    skipEmpty: false,
};
const emphOpenRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Emph',
    leaf: false,
    open: true,
    close: false,
    build: (token,callback) => { return {}; },
    skipEmpty: false,
};
const emphCloseRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Emph',
    leaf: false,
    open: false,
    close: true,
    build: null,
    skipEmpty: false,
};
const linkOpenRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Link',
    leaf: false,
    open: true,
    close: false,
    build: (token,callback) => { return {
        destination: getAttr(token.attrs,'href',''),
        title : getAttr(token.attrs,'title',''),
    }; },
    skipEmpty: false,
};
const linkCloseRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Link',
    leaf: false,
    open: false,
    close: true,
    build: null,
    skipEmpty: false,
};
const imageRule = {
    tag: NS_PREFIX_CommonMarkModel + 'Image',
    leaf: false,
    open: true,
    close: true,
    build: (token,callback) => { return {
        destination: getAttr(token.attrs,'src',''),
        title: getAttr(token.attrs,'title',''),
        nodes: callback(token.children),
    }; },
    skipEmpty: false,
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

module.exports = rules;
