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
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;
const { NS_PREFIX_TemplateMarkModel } = require('@accordproject/markdown-template').TemplateMarkModel;

/**
 * Apply styling
 * @param {*} node - the current slate node
 * @param {*} result - the current ciceromark output
 */
function applyStyle(node, result) {
    if (node.data && node.data.style) {
        // console.log(`APPLYING STYLE ${JSON.stringify(node.data.style)} TO $(JSON.stringify(result))`);
        result.style = node.data.style;
        result.style.$class = `${NS_PREFIX_CommonMarkModel}Style`;
    }
}

/**
 * Removes nodes if they are an empty paragraph
 * @param {*} input - the current result of slateToCiceroMarkDom
 * @returns {*} the final result of slateToCiceroMarkDom
 */
function removeEmptyParagraphs(input) {
    let nodesWithoutBlankParagraphs = [];
    input.nodes.forEach(node => {
        if (node.$class === `${NS_PREFIX_CommonMarkModel}Paragraph` &&
            node.nodes.length === 1 &&
            node.nodes[0].$class === `${NS_PREFIX_CommonMarkModel}Text` &&
            node.nodes[0].text === '') {
            return;
        }
        nodesWithoutBlankParagraphs.push(node);
    });
    input.nodes = nodesWithoutBlankParagraphs;
    return input;
}

/**
 * Gather the text for the node
 * @param {*} input - the current slate node
 * @returns {string} the text contained in the slate node
 */
function getText(input) {
    let result = '';

    if (input.type === 'paragraph') {
        result += '\n';
    }

    if (input.text) {
        result += input.text;
    }
    if (input.children) {
        input.children.forEach(node => {
            result += getText(node);
        });
    }
    return result;
}

/**
 * Quote strings
 * @param {string} value - the string
 * @return {string} the quoted string
 */
function quoteString(value) {
    return '"' + value + '"';
}

/**
 * Handles marks
 * @param {*} slateNode the slate node
 * @param {*} newNode the new node
 * @returns {*} the final ast node
 */
function handleMarks(slateNode,newNode) {
    let strong = null;
    let emph = null;
    let strikethrough = null;
    let result = newNode;
    applyStyle(slateNode, newNode);

    const isBold = slateNode.bold;
    const isItalic = slateNode.italic;
    const isLineThrough = slateNode.lineThrough;

    if (isBold) {
        strong = {$class : `${NS_PREFIX_CommonMarkModel}Strong`, nodes: []};
    }
    if (isItalic) {
        emph  = {$class : `${NS_PREFIX_CommonMarkModel}Emph`, nodes: []};
    }
    if (isLineThrough) {
        strikethrough  = {$class : `${NS_PREFIX_CommonMarkModel}.Strikethrough`, nodes: []};
    }

    if(strikethrough) {
        strikethrough.nodes.push(result);
        result = strikethrough;
    }
    if(emph) {
        emph.nodes.push(result);
        result = emph;
    }
    if(strong) {
        strong.nodes.push(result);
        result = strong;
    }

    return result;
}

/**
 * Handles a text node
 * @param {*} node the slate text node
 * @returns {*} the ast node
 */
function handleText(node) {
    let result = null;
    const isCode = node.code;
    if (node.object === 'text' && node.text === '') { return null; }
    if (isCode) {
        result = {$class : `${NS_PREFIX_CommonMarkModel}Code`, text: node.text};
    } else {
        result = {$class : `${NS_PREFIX_CommonMarkModel}Text`, text : node.text};
    }

    return handleMarks(node,result);
}

/**
 * Handles a variable node
 * @param {*} node the slate variable node
 * @returns {*} the ast node
 */
function handleVariable(node) {
    let result = null;

    const textNode = node.children[0]; // inlines always contain a single text node
    node.children = []; // Reset the children for the inline to avoid recursion

    const data = node.data;

    const baseName = Object.prototype.hasOwnProperty.call(data,'format') ? 'FormattedVariable' : (Object.prototype.hasOwnProperty.call(data,'enumValues') ? 'EnumVariable' : 'Variable');
    const className = `${NS_PREFIX_CiceroMarkModel}${baseName}`;

    result = {
        $class : className,
        name : data.name,
        value : textNode.text
    };

    if (Object.prototype.hasOwnProperty.call(data,'format')) {
        result.format = data.format;
    }
    if (node.data.identifiedBy) {
        result.identifiedBy = node.data.identifiedBy;
        result.value = quoteString(result.value); // XXX Is this safe?
    }
    if (Object.prototype.hasOwnProperty.call(data,'enumValues')) {
        result.enumValues = data.enumValues;
    }
    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
        if (result.elementType === 'String') {
            result.value = quoteString(result.value);
        }
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a variable definition node
 * @param {*} node the slate variable node
 * @returns {*} the ast node
 */
function handleVariableDefinition(node) {
    let result = null;

    node.children = []; // Reset the children for the inline to avoid recursion

    const data = node.data;

    const baseName = Object.prototype.hasOwnProperty.call(data,'format') ? 'FormattedVariableDefinition' : (Object.prototype.hasOwnProperty.call(data,'enumValues') ? 'EnumVariableDefinition' : 'VariableDefinition');
    const className = `${NS_PREFIX_TemplateMarkModel}${baseName}`;

    result = {
        $class : className,
        name : data.name,
    };

    if (Object.prototype.hasOwnProperty.call(data,'format')) {
        result.format = data.format;
    }
    if (node.data.identifiedBy) {
        result.identifiedBy = node.data.identifiedBy;
    }
    if (Object.prototype.hasOwnProperty.call(data,'enumValues')) {
        result.enumValues = data.enumValues;
    }
    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a conditional node
 * @param {*} node the slate variable node
 * @param {*} isTrue is this conditional true
 * @param {*} whenTrue the nodes when true
 * @param {*} whenFalse the nodes when false
 * @returns {*} the ast node
 */
function handleConditional(node, isTrue, whenTrue, whenFalse) {
    const data = node.data;

    let result = {
        $class : `${NS_PREFIX_CiceroMarkModel}Conditional`,
        name : data.name,
        nodes: [],
    };

    result.isTrue = isTrue;
    result.whenTrue = whenTrue;
    result.whenFalse = whenFalse;

    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a conditional definition node
 * @param {*} node the slate variable node
 * @param {*} whenTrue the nodes when true
 * @param {*} whenFalse the nodes when false
 * @returns {*} the ast node
 */
function handleConditionalDefinition(node, whenTrue, whenFalse) {
    const data = node.data;

    let result = {
        $class : `${NS_PREFIX_TemplateMarkModel}ConditionalDefinition`,
        name : data.name,
    };

    result.whenTrue = whenTrue;
    result.whenFalse = whenFalse;

    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a optional node
 * @param {*} node the slate variable node
 * @param {*} hasSome is this optional is present
 * @param {*} whenSome the nodes when present
 * @param {*} whenNone the nodes when absent
 * @returns {*} the ast node
 */
function handleOptional(node, hasSome, whenSome, whenNone) {
    const data = node.data;

    let result = {
        $class : `${NS_PREFIX_CiceroMarkModel}Optional`,
        name : data.name,
        nodes: [],
    };

    result.hasSome = hasSome;
    result.whenSome = whenSome;
    result.whenNone = whenNone;

    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a optional definition node
 * @param {*} node the slate variable node
 * @param {*} whenSome the nodes when true
 * @param {*} whenNone the nodes when false
 * @returns {*} the ast node
 */
function handleOptionalDefinition(node, whenSome, whenNone) {
    const data = node.data;

    let result = {
        $class : `${NS_PREFIX_TemplateMarkModel}OptionalDefinition`,
        name : data.name,
    };

    result.whenSome = whenSome;
    result.whenNone = whenNone;

    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }

    return handleMarks(node,result);
}

/**
 * Handles a formula
 * @param {*} node the slate formula node
 * @returns {*} the ast node
 */
function handleFormula(node) {
    let result = null;

    const textNode = node.children[0]; // inlines always contain a single text node
    node.children = []; // Reset the children for the inline to avoid recursion

    const className = `${NS_PREFIX_CiceroMarkModel}Formula`;

    result = {
        $class : className,
        value : textNode.text
    };

    const data = node.data;
    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }
    if (Object.prototype.hasOwnProperty.call(data,'dependencies')) {
        result.dependencies = data.dependencies;
    }
    if (Object.prototype.hasOwnProperty.call(data,'code')) {
        result.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data,'name')) {
        result.name = data.name;
    }

    return handleMarks(node,result);
}

/**
 * Handles a formula definition
 * @param {*} node the slate formula node
 * @returns {*} the ast node
 */
function handleFormulaDefinition(node) {
    let result = null;

    node.children = []; // Reset the children for the inline to avoid recursion

    const className = `${NS_PREFIX_CiceroMarkModel}Formula`;

    result = {
        $class : className,
    };

    const data = node.data;
    if (Object.prototype.hasOwnProperty.call(data,'elementType')) {
        result.elementType = data.elementType;
    }
    if (Object.prototype.hasOwnProperty.call(data,'decorators')) {
        result.decorators = data.decorators;
    }
    if (Object.prototype.hasOwnProperty.call(data,'dependencies')) {
        result.dependencies = data.dependencies;
    }
    if (Object.prototype.hasOwnProperty.call(data,'code')) {
        result.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data,'name')) {
        result.name = data.name;
    }

    return handleMarks(node,result);
}

module.exports = {
    removeEmptyParagraphs,
    getText,
    quoteString,
    handleMarks,
    handleText,
    handleVariable,
    handleVariableDefinition,
    handleConditional,
    handleConditionalDefinition,
    handleOptional,
    handleOptionalDefinition,
    handleFormula,
    handleFormulaDefinition,
    applyStyle,
};