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

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

const fromslateutil = require('./fromslateutil');

const rules = {};

// CommonMark rules
rules.paragraph = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Paragraph`, nodes: []};
};
rules.softbreak = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Softbreak`};
};
rules.linebreak = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Linebreak`};
};
rules.horizontal_rule = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}ThematicBreak`};
};
rules.heading_one = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '1', nodes: []};
};
rules.heading_two = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '2', nodes: []};
};
rules.heading_three = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '3', nodes: []};
};
rules.heading_four = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '4', nodes: []};
};
rules.heading_five = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '5', nodes: []};
};
rules.heading_six = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Heading`, level : '6', nodes: []};
};
rules.block_quote = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}BlockQuote`, nodes: []};
};
rules.code_block = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}CodeBlock`, text: fromslateutil.getText(node)};
};
rules.html_block = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}HtmlBlock`, text: fromslateutil.getText(node)};
};
rules.html_inline = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}HtmlInline`, text: node.data.content};
};
rules.link = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Link`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.image = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Image`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.list_item = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}Item`, nodes: []};
};
rules.ol_list = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}List`, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
};
rules.ul_list = (node,processNodes) => {
    return {$class : `${NS_PREFIX_CommonMarkModel}List`, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
};

module.exports = rules;