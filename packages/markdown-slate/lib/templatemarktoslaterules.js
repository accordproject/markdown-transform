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

const toslateutil = require('./toslateutil');

const rules = {};

rules.ContractDefinition = (thing,processChildren,parameters) => {
    const data = {};
    data.name = thing.name;
    if (thing.src) {
        data.src = thing.src;
    }
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return {
        object: 'block',
        type: 'contract_definition',
        data: data,
        children: processChildren(thing,'nodes',parameters),
    };
};
rules.ClauseDefinition = (thing,processChildren,parameters) => {
    const data = {};
    data.name = thing.name;
    if (thing.src) {
        data.src = thing.src;
    }
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return {
        object: 'block',
        type: 'clause_definition',
        data: data,
        children: processChildren(thing,'nodes',parameters),
    };
};
rules.VariableDefinition = (thing,processChildren,parameters) => {
    const data = { name: thing.name };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    if (thing.identifiedBy) {
        data.identifiedBy = thing.identifiedBy;
    }
    return toslateutil.handleVariableDefinition('variable_definition', data, thing.name, parameters);
};
rules.FormattedVariableDefinition = (thing,processChildren,parameters) => {
    const data = { name: thing.name, format: thing.format };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleVariableDefinition('variable_definition', data, thing.name, parameters);
};
rules.EnumVariableDefinition = (thing,processChildren,parameters) => {
    const data = { name: thing.name, enumValues: thing.enumValues };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleVariableDefinition('variable_definition', data, thing.name, parameters);
};
rules.ConditionalDefinition = (thing,processChildren,parameters) => {
    const localParameters = Object.assign({},parameters);
    parameters.strong = false;
    parameters.italic = false;
    const nodes = [];
    const whenTrue = processChildren(thing,'whenTrue',parameters);
    const whenFalse = processChildren(thing,'whenFalse',parameters);
    const data = { name: thing.name, isTrue: thing.isTrue, whenTrue: whenTrue, whenFalse: whenFalse };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleBlockDefinition('conditional_definition', data, nodes, localParameters);
};
rules.OptionalDefinition = (thing,processChildren,parameters) => {
    const localParameters = Object.assign({},parameters);
    parameters.strong = false;
    parameters.italic = false;
    const nodes = [];
    const whenSome = processChildren(thing,'whenSome',parameters);
    const whenNone = processChildren(thing,'whenNone',parameters);
    const data = { name: thing.name, hasSome: thing.hasSome, whenSome: whenSome, whenNone: whenNone };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleBlockDefinition('optional_definition', data, nodes, localParameters);
};
rules.ListBlockDefinition = (thing,processChildren,parameters) => {
    const data = { name: thing.name, tight: thing.tight, start: thing.start, delimiter: thing.delimiter, type: 'variable' };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return {
        object: 'block',
        data: data,
        type: thing.type === 'ordered' ? 'ol_list_block_definition' : 'ul_list_block_definition',
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.FormulaDefinition = (thing,processChildren,parameters) => {
    const data = { name: thing.name };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.dependencies) {
        data.dependencies = thing.dependencies;
    }
    if (thing.code) {
        data.code = thing.code;
    }
    return toslateutil.handleFormula(data, thing.code, parameters);
};

module.exports = rules;