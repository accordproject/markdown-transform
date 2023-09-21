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

// @ts-nocheck
/* eslint-disable no-undef */
'use strict';

const getAttr = require('./CommonMarkUtils').getAttr;
const FromMarkdownIt = require('./FromMarkdownIt');
const CommonMarkModel = require('../lib/externalModels/CommonMarkModel');

const inlines = [{
    'type': 'text',
    'tag': '',
    'attrs': null,
    'map': null,
    'nesting': 0,
    'level': 0,
    'children': null,
    'content': 'This is some text.',
    'markup': '',
    'info': '',
    'meta': null,
    'block': false,
    'hidden': false
}];
const tokens = (inlines) => [{
    'type': 'paragraph_open',
    'tag': 'p',
    'attrs': null,
    'map': [0, 1],
    'nesting': 1,
    'level': 0,
    'children': null,
    'content': '',
    'markup': '',
    'info': '',
    'meta': null,
    'block': true,
    'hidden': false
},{
    'type': 'inline',
    'tag': '',
    'attrs': null,
    'map': [0, 1],
    'nesting': 0,
    'level': 1,
    'children': inlines,
    'content': 'This is some text.',
    'markup': '',
    'info': '',
    'meta': null,
    'block': true,
    'hidden': false
},{
    'type': 'paragraph_close',
    'tag': 'p',
    'attrs': null,
    'map': null,
    'nesting': -1,
    'level': 0,
    'children': null,
    'content': '',
    'markup': '',
    'info': '',
    'meta': null,
    'block': true,
    'hidden': false
}];
const expected = {
    '$class':`${CommonMarkModel.NAMESPACE}.Document`,
    'xmlns':'http://commonmark.org/xml/1.0',
    'nodes':[{
        '$class':`${CommonMarkModel.NAMESPACE}.Paragraph`,
        'nodes':[{
            '$class':`${CommonMarkModel.NAMESPACE}.Text`,
            'text':'This is some text.'
        }]
    }]
};

const rules = { inlines: {}, blocks: {}};
const ifOpenRule = {
    tag: 'ConditionalDefinition',
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
const ifCloseRule = {
    tag: 'ConditionalDefinition',
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
rules.inlines.inline_block_if_open = ifOpenRule;
rules.inlines.inline_block_if_close = ifCloseRule;

describe('FromMarkdownIt', () => {
    it('#constructor', () => {
        const fromMarkdownIt = new FromMarkdownIt(rules);
        expect(fromMarkdownIt).toBeTruthy();
    });

    it('#toCommonMark', () => {
        const fromMarkdownIt = new FromMarkdownIt(rules);
        const commonMark = fromMarkdownIt.toCommonMark(tokens(inlines));
        expect(commonMark).toEqual(expected);
    });

    it('#toCommonMark (wrong block)', () => {
        const fromMarkdownIt = new FromMarkdownIt(rules);
        const wrongToken = {
            'type': 'foo',
            'tag': 'p',
            'attrs': null,
            'map': [0, 1],
            'nesting': 1,
            'level': 0,
            'children': null,
            'content': '',
            'markup': '',
            'info': '',
            'meta': null,
            'block': true,
            'hidden': false
        };
        expect(() => {
            return fromMarkdownIt.toCommonMark(tokens(inlines).concat([wrongToken]));
        }).toThrow('Unknown block type foo');
    });

    it('#toCommonMark (wrong inline)', () => {
        const fromMarkdownIt = new FromMarkdownIt(rules);
        const wrongToken = {
            'type': 'foo',
            'tag': 'p',
            'attrs': null,
            'map': [0, 1],
            'nesting': 1,
            'level': 0,
            'children': null,
            'content': '',
            'markup': '',
            'info': '',
            'meta': null,
            'block': true,
            'hidden': false
        };
        expect(() => {
            return fromMarkdownIt.toCommonMark(tokens(inlines.concat([wrongToken])));
        }).toThrow('Unknown inline type foo');
    });

    it('#toCommonMark (malformed token stream)', () => {
        const fromMarkdownIt = new FromMarkdownIt(rules);
        expect(() => {
            const partialTokens = tokens(inlines).slice(1);
            return fromMarkdownIt.toCommonMark(partialTokens.concat(partialTokens));
        }).toThrow('Malformed token stream: no current node');
    });
});
