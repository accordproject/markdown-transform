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
const { CiceroMarkModel, NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;

function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Drafts a CiceroMark DOM from a TemplateMark DOM
 */
class ToCiceroMarkVisitor {
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
        const currentModel = parameters.model;
        switch(thing.getType()) {
        case 'VariableDefinition':
        case 'FormattedVariableDefinition':
        case 'EnumVariableDefinition': {
            const ciceroMarkTag = ToCiceroMarkVisitor.matchTag(thing.getType());
            thing.$classDeclaration = parameters.templateMarkModelManager.getType(ciceroMarkTag);
            thing.value = '' + parameters.data[thing.name]; // TO FIX
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
                templateMarkModelManager: parameters.templateMarkModelManager,
                data: (parameters.kind === 'contract' ? parameters.data[thing.name] : parameters.data),
                kind: parameters.kind,
            };
            ToCiceroMarkVisitor.visitChildren(this, thing, childrenParameters);
        }
            break;
        case 'WithDefinition': {
            const childrenParameters = {
                templateMarkModelManager: parameters.templateMarkModelManager,
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
        default:
            ToCiceroMarkVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

module.exports = ToCiceroMarkVisitor;