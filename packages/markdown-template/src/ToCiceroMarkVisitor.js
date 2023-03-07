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
const dayjs = require('dayjs');
const flatten = require('./util').flatten;
const generateJSON = require('./templatemarkutil').generateJSON;
const { CommonMarkModel, CiceroMarkModel } = require('@accordproject/markdown-common');

/**
 * Drafts a CiceroMark DOM from a TemplateMark DOM
 */
class ToCiceroMarkVisitor {
    /**
     * Clone a CiceroMark node
     * @param {*} serializer the serializer
     * @param {*} node the node to visit
     * @param {*} [parameters] optional parameters
     * @return {*} the cloned node
     */
    static cloneNode(serializer, node) {
        return serializer.fromJSON(serializer.toJSON(node));
    }

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            thing.nodes = ToCiceroMarkVisitor.visitNodes(visitor, thing.nodes, parameters);
        }
    }

    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     * @return {*} the visited nodes
     */
    static visitNodes(visitor, things, parameters) {
        return flatten(things.map(node => {
            return node.accept(visitor, parameters);
        }));
    }

    /**
     * Match template tag to instance tag
     * @param {string} tag the template tag
     * @return {string} the corresponding instance tag
     */
    static matchTag(tag) {
        if (tag === 'VariableDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.Variable`;
        } else if (tag === 'FormattedVariableDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.FormattedVariable`;
        } else if (tag === 'EnumVariableDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.EnumVariable`;
        } else if (tag === 'FormulaDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.Formula`;
        } else if (tag === 'ClauseDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.Clause`;
        } else if (tag === 'ConditionalDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.Conditional`;
        } else if (tag === 'OptionalDefinition') {
            return `${CiceroMarkModel.NAMESPACE}.Optional`;
        } else if (tag === 'ListBlockDefinition') {
            return`${CiceroMarkModel.NAMESPACE}.ListBlock`;
        } else {
            return tag;
        }
    }

    /**
     * Evaluates a JS expression
     * @param {*} data the contract data
     * @param {string} expression the JS expression
     * @param {Date} now the current value for now
     * @returns {Boolean} the result of evaluating the expression against the data
     */
    static eval(data, expression, now) {
        data.now = now ? now : dayjs();
        const args = Object.keys(data);
        const values = Object.values(data);
        // const types = values.map( v => typeof v);
        // console.log('**** ' + JSON.stringify(data, null, 2));
        // console.log('**** ' + expression);
        // console.log('**** ' + args);
        // console.log('**** ' + values);
        // console.log('**** ' + types);
        const fun = new Function(...args, expression); // SECURITY!
        const result = fun(...values);
        // console.log('**** ' + result);
        return result;
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     * @return {*} the visited nodes
     */
    visit(thing, parameters) {
        const that = this;
        switch(thing.getType()) {
        case 'EnumVariableDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            thing.value = '' + parameters.data[thing.name];
        }
            break;
        case 'VariableDefinition':
        case 'FormattedVariableDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            const data = thing.name === 'this' ? parameters.data : parameters.data[thing.name];
            const elementType = thing.identifiedBy ? 'Resource' : thing.elementType;
            parameters.visitor = that;
            const draftFun = parameters.parserManager.getParsingTable().getDrafter(thing.name,elementType,thing.format,parameters);
            const draftedTo = draftFun(data,thing.format);
            if (typeof draftedTo === 'string') {
                thing.value = '' + draftedTo;
            } else {
                return draftedTo;
            }
        }
            break;
        case 'ContractDefinition': {
            return ToCiceroMarkVisitor.visitNodes(this, thing.nodes, parameters);
        }
        case 'FormulaDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            // thing.value = parameters.parserManager.getFormulaEval(thing.name)(thing.code,parameters.fullData,parameters.currentTime);
            thing.value = JSON.stringify(ToCiceroMarkVisitor.eval(parameters.fullData, thing.code, parameters.currentTime));
        }
            break;
        case 'ClauseDefinition': {
            if (parameters.kind === 'contract') {
                const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
                thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
                const childrenParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: parameters.data[thing.name],
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                ToCiceroMarkVisitor.visitChildren(this, thing, childrenParameters);
            } else {
                ToCiceroMarkVisitor.visitChildren(this, thing, parameters);
            }
        }
            break;
        case 'WithDefinition': {
            const childrenParameters = {
                parserManager: parameters.parserManager,
                templateMarkModelManager: parameters.templateMarkModelManager,
                templateMarkSerializer: parameters.templateMarkSerializer,
                fullData: parameters.fullData,
                data: parameters.data[thing.name],
                kind: parameters.kind,
                currentTime: parameters.currentTime,
            };
            return ToCiceroMarkVisitor.visitNodes(this, thing.nodes, childrenParameters);
        }
        case 'ConditionalDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            ToCiceroMarkVisitor.visitNodes(this, thing.whenTrue, parameters);
            ToCiceroMarkVisitor.visitNodes(this, thing.whenFalse, parameters);
            const conditionTrue = thing.condition ? ToCiceroMarkVisitor.eval(parameters.data, `return !!${thing.condition}`, parameters.currentTime) : parameters.data[thing.name];
            delete thing.condition;
            delete thing.dependencies;

            if (conditionTrue) {
                thing.isTrue = true;
                thing.nodes = thing.whenTrue;
            } else {
                thing.isTrue = false;
                thing.nodes = thing.whenFalse;
            }
        }
            break;
        case 'OptionalDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            if (parameters.data[thing.name]) {
                thing.hasSome = true;
                thing.nodes = thing.whenSome;
                const someParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: parameters.data[thing.name],
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                ToCiceroMarkVisitor.visitNodes(this, thing.whenSome, someParameters);
                const noneParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: {},
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                ToCiceroMarkVisitor.visitNodes(this, thing.whenNone, noneParameters);
            } else {
                thing.hasSome = false;
                thing.nodes = thing.whenNone;
                const invented = generateJSON(parameters.parserManager.getModelManager(),thing.elementType);
                const someParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: invented, // Need to invent some data here!
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                ToCiceroMarkVisitor.visitNodes(this, thing.whenSome, someParameters);
                const noneParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: {},
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                ToCiceroMarkVisitor.visitNodes(this, thing.whenNone, noneParameters);
            }
        }
            break;
        case 'ListBlockDefinition': {
            // Clone the thing and create an item blueprint
            const itemNode = ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,thing);
            itemNode.$classDeclaration = parameters.templateMarkModelManager.getType(`${CommonMarkModel.NAMESPACE}.Item`);
            delete itemNode.elementType;
            delete itemNode.decorators;
            delete itemNode.name;
            delete itemNode.type;
            delete itemNode.start;
            delete itemNode.tight;
            delete itemNode.delimiter;

            const dataItems = parameters.data[thing.name];
            const mapItems = function(item) {
                const itemParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: item,
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                return ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,itemNode)
                    .accept(that, itemParameters);
            };

            // Result List node
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            thing.nodes = flatten(dataItems.map(mapItems));

            delete thing.elementType;
        }
            break;
        case 'JoinDefinition': {
            // Clone the thing and create an item blueprint
            const itemNode = ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,thing);
            itemNode.$classDeclaration = parameters.templateMarkModelManager.getType(`${CommonMarkModel.NAMESPACE}.Item`);
            delete itemNode.elementType;
            delete itemNode.decorators;
            delete itemNode.name;
            delete itemNode.separator;
            const dataItems = parameters.data[thing.name];
            const mapItems = function(item,index) {
                const itemParameters = {
                    parserManager: parameters.parserManager,
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    templateMarkSerializer: parameters.templateMarkSerializer,
                    fullData: parameters.fullData,
                    data: item,
                    kind: parameters.kind,
                    currentTime: parameters.currentTime,
                };
                const resultNodes = ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,itemNode)
                    .accept(that, itemParameters)[0].nodes;
                if (index > 0) {
                    resultNodes.unshift(parameters.templateMarkSerializer.fromJSON({
                        '$class': `${CommonMarkModel.NAMESPACE}.Text`,
                        'text': thing.separator
                    }));
                }
                return resultNodes;
            };

            // Result List node
            return flatten(dataItems.map(mapItems));
        }
        case 'Document': {
            ToCiceroMarkVisitor.visitChildren(this, thing.nodes[0], parameters);
            thing.nodes = thing.nodes[0].nodes;
        }
            break;
        default:
            ToCiceroMarkVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

module.exports = ToCiceroMarkVisitor;