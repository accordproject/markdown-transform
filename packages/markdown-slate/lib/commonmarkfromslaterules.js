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

const { CommonMarkModel } = require('@accordproject/markdown-common');

const fromslateutil = require('./fromslateutil');

const rules = {};

// CommonMark rules
rules.paragraph = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Paragraph`, nodes: []};
};
rules.softbreak = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Softbreak`};
};
rules.linebreak = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Linebreak`};
};
rules.horizontal_rule = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.ThematicBreak`};
};
rules.heading_one = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '1', nodes: []};
};
rules.heading_two = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '2', nodes: []};
};
rules.heading_three = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '3', nodes: []};
};
rules.heading_four = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '4', nodes: []};
};
rules.heading_five = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '5', nodes: []};
};
rules.heading_six = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Heading`, level : '6', nodes: []};
};
rules.block_quote = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.BlockQuote`, nodes: []};
};
rules.code_block = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.CodeBlock`, text: fromslateutil.getText(node)};
};
rules.html_block = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.HtmlBlock`, text: fromslateutil.getText(node)};
};
rules.html_inline = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.HtmlInline`, text: node.data.content};
};
rules.link = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Link`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.image = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Image`, destination: node.data.href, title: node.data.title ? node.data.title : '', nodes: []};
};
rules.list_item = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.Item`, nodes: []};
};
rules.ol_list = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.List`, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
};
rules.ul_list = (node,processNodes) => {
    return {$class : `${CommonMarkModel.NAMESPACE}.List`, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
};
rules.table = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.Table`, nodes: [] };
};
rules.table_head = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.TableHead`, nodes: [] };
};
rules.table_body = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.TableBody`, nodes: [] };
};
rules.table_row = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.TableRow`, nodes: [] };
};
rules.table_cell = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.TableCell`, nodes: [] };
};
rules.header_cell = (node, processNodes) => {
    return { $class: `${CommonMarkModel.NAMESPACE}.HeaderCell`, nodes: [] };
};

module.exports = rules;