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

const { CiceroMarkModel } = require('@accordproject/markdown-common');

const fromslateutil = require('./fromslateutil');

const rules = {};

// CiceroMark rules
rules.ol_list_block = (node,processNodes) => {
    let result;
    result = {$class : `${CiceroMarkModel.NAMESPACE}.ListBlock`, name: node.data.name, type: 'ordered', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    return result;
};
rules.ul_list_block = (node,processNodes) => {
    let result;
    result = {$class : `${CiceroMarkModel.NAMESPACE}.ListBlock`, name: node.data.name, type: 'bullet', delimiter: node.data.delimiter, start: node.data.start, tight: node.data.tight, nodes: []};
    if (node.data.elementType) {
        result.elementType = node.data.elementType;
    }
    if (node.data.decorators) {
        result.decorators = node.data.decorators;
    }
    return result;
};

rules.clause = (node,processNodes) => {
    // console.log(JSON.stringify(node, null, 4));
    const result = {$class : `${CiceroMarkModel.NAMESPACE}.Clause`, name: node.data.name, nodes: []};
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
rules.conditional = (node,processNodes) => {
    const isTrue = node.data.isTrue;
    let whenTrueNodes = [];
    processNodes(whenTrueNodes, node.data.whenTrue);
    let whenFalseNodes = [];
    processNodes(whenFalseNodes, node.data.whenFalse);
    return fromslateutil.handleConditional(node,isTrue,whenTrueNodes,whenFalseNodes);
};
rules.optional = (node,processNodes) => {
    const hasSome = node.data.hasSome;
    let whenSomeNodes = [];
    processNodes(whenSomeNodes, node.data.whenSome);
    let whenNoneNodes = [];
    processNodes(whenNoneNodes, node.data.whenNone);
    return fromslateutil.handleOptional(node,hasSome,whenSomeNodes,whenNoneNodes);
};
rules.variable = (node,processNodes) => {
    return fromslateutil.handleVariable(node);
};
rules.formula = (node,processNodes) => {
    return fromslateutil.handleFormula(node);
};

module.exports = rules;