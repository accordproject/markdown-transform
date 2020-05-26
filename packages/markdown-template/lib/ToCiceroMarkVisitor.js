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

const NS_PREFIX_TemplateMarkModel = require('./externalModels/TemplateMarkModel').NS_PREFIX_TemplateMarkModel;
const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;

function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Drafts a CiceroMark DOM from a TemplateMark DOM
 */
class ToCiceroMarkVisitor {
    /**
     * Clone a CiceroMark node
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
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
            return NS_PREFIX_CiceroMarkModel + 'Variable';
        } else if (tag === 'FormattedVariableDefinition') {
            return NS_PREFIX_CiceroMarkModel + 'FormattedVariable';
        } else if (tag === 'EnumVariableDefinition') {
            return NS_PREFIX_CiceroMarkModel + 'EnumVariable';
        } else if (tag === 'ClauseDefinition') {
            return NS_PREFIX_CiceroMarkModel + 'Clause';
        } else if (tag === 'ConditionalDefinition') {
            return NS_PREFIX_CiceroMarkModel + 'Conditional';
        } else if (tag === 'ListBlockDefinition') {
            return NS_PREFIX_CiceroMarkModel + 'ListBlock';
        } else {
            return tag;
        }
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        const that = this;
        const currentModel = parameters.model;
        switch(thing.getType()) {
        case 'VariableDefinition':
        case 'FormattedVariableDefinition':
        case 'EnumVariableDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            const data = parameters.data[thing.name];
            const typeFun = parameters.parserManager.getParsingTable()[thing.elementType];
            if (typeFun) {
                thing.value = '' + typeFun.draft(data);
            } else {
                thing.value = '' + parameters.data[thing.name]; // XXX should that ever happen ??
            }
        }
            break;
        case 'ContractDefinition': {
            return ToCiceroMarkVisitor.visitNodes(this, thing.nodes, parameters);
        }
            break;
        case 'ClauseDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            const childrenParameters = {
                parserManager: parameters.parserManager,
                templateMarkModelManager: parameters.templateMarkModelManager,
                templateMarkSerializer: parameters.templateMarkSerializer,
                data: (parameters.kind === 'contract' ? parameters.data[thing.name] : parameters.data),
                kind: parameters.kind,
            };
            ToCiceroMarkVisitor.visitChildren(this, thing, childrenParameters);
        }
            break;
        case 'WithDefinition': {
            const childrenParameters = {
                parserManager: parameters.parserManager,
                templateMarkModelManager: parameters.templateMarkModelManager,
                templateMarkSerializer: parameters.templateMarkSerializer,
                data: parameters.data[thing.name],
                kind: parameters.kind,
            };
            return ToCiceroMarkVisitor.visitNodes(this, thing.nodes, childrenParameters);
        }
            break;
        case 'ConditionalDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            if (parameters.data[thing.name]) {
                thing.value = thing.whenTrue;
            } else {
                thing.value = thing.whenFalse;
            }
        }
            break;
        case 'ListBlockDefinition': {
            // Clone the thing and create an item blueprint
            const itemNode = ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,thing);
            itemNode.$classDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_CommonMarkModel + 'Item');
            delete itemNode.elementType;
            delete itemNode.name;
            delete itemNode.type;
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
                    data: item,
                    kind: parameters.kind,
                };
                return ToCiceroMarkVisitor.cloneNode(parameters.templateMarkSerializer,itemNode).accept(that, itemParameters);
            };
            
            // Result List node
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            thing.nodes = flatten(dataItems.map(mapItems));

            delete thing.elementType;
        }
            break;
        default:
            ToCiceroMarkVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

module.exports = ToCiceroMarkVisitor;