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

const { TemplateMarkModel } = require('@accordproject/markdown-common');

const fromslateutil = require('./fromslateutil');

const rules = {};

// CiceroMark rules
rules.contract_definition = (node,processNodes) => {
    // console.log(JSON.stringify(node, null, 4));
    const result = {$class : `${TemplateMarkModel.NAMESPACE}.ContractDefinition`, name: node.data.name, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    if (node.data.src) {
        result.src = node.data.src;
    }
    return result;
};
rules.clause_definition = (node,processNodes) => {
    // console.log(JSON.stringify(node, null, 4));
    const result = {$class : `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`, name: node.data.name, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    if (node.data.src) {
        result.src = node.data.src;
    }
    return result;
};
rules.variable_definition = (node,processNodes) => {
    return fromslateutil.handleVariableDefinition(node);
};
rules.conditional_definition = (node,processNodes) => {
    let whenTrueNodes = [];
    processNodes(whenTrueNodes, node.data.whenTrue);
    let whenFalseNodes = [];
    processNodes(whenFalseNodes, node.data.whenFalse);
    return fromslateutil.handleConditionalDefinition(node,whenTrueNodes,whenFalseNodes);
};
rules.optional_definition = (node,processNodes) => {
    let whenSomeNodes = [];
    processNodes(whenSomeNodes, node.data.whenSome);
    let whenNoneNodes = [];
    processNodes(whenNoneNodes, node.data.whenNone);
    return fromslateutil.handleOptionalDefinition(node,whenSomeNodes,whenNoneNodes);
};
rules.ol_list_block_definition = (node,processNodes) => {
    let result;
    result = {$class : `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`, name: node.data.name, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    return result;
};
rules.ul_list_block_definition = (node,processNodes) => {
    let result;
    result = {$class : `${TemplateMarkModel.NAMESPACE}.ListBlockDefinition`, name: node.data.name, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    return result;
};
rules.formula_definition = (node,processNodes) => {
    return fromslateutil.handleFormulaDefinition(node);
};

module.exports = rules;