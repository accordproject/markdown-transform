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

rules.Clause = (thing,processChildren,parameters) => {
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
        type: 'clause',
        data: data,
        children: processChildren(thing,'nodes',parameters),
    };
};
rules.Variable = (thing,processChildren,parameters) => {
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
    return toslateutil.handleVariable('variable', data, thing.value, parameters);
};
rules.FormattedVariable = (thing,processChildren,parameters) => {
    const data = { name: thing.name, format: thing.format };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleVariable('variable', data, thing.value, parameters);
};
rules.EnumVariable = (thing,processChildren,parameters) => {
    const data = { name: thing.name, enumValues: thing.enumValues };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleVariable('variable', data, thing.value, parameters);
};
rules.Conditional = (thing,processChildren,parameters) => {
    const localParameters = Object.assign({},parameters);
    parameters.strong = false;
    parameters.italic = false;
    const nodes = processChildren(thing,'nodes',parameters);
    const whenTrue = processChildren(thing,'whenTrue',parameters);
    const whenFalse = processChildren(thing,'whenFalse',parameters);
    const data = { name: thing.name, isTrue: thing.isTrue, whenTrue: whenTrue, whenFalse: whenFalse };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleBlockDefinition('conditional', data, nodes, localParameters);
};
rules.Optional = (thing,processChildren,parameters) => {
    const localParameters = Object.assign({},parameters);
    parameters.strong = false;
    parameters.italic = false;
    const nodes = processChildren(thing,'nodes',parameters);
    const whenSome = processChildren(thing,'whenSome',parameters);
    const whenNone = processChildren(thing,'whenNone',parameters);
    const data = { name: thing.name, hasSome: thing.hasSome, whenSome: whenSome, whenNone: whenNone };
    if (thing.elementType) {
        data.elementType = thing.elementType;
    }
    if (thing.decorators) {
        data.decorators = thing.decorators.map(x => parameters.serializer.toJSON(x));
    }
    return toslateutil.handleBlockDefinition('optional', data, nodes, localParameters);
};
rules.ListBlock = (thing,processChildren,parameters) => {
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
        type: thing.type === 'ordered' ? 'ol_list_block' : 'ul_list_block',
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.Formula = (thing,processChildren,parameters) => {
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
    return toslateutil.handleFormula(data, thing.value, parameters);
};

module.exports = rules;