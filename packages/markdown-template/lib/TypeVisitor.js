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

const RelationshipDeclaration = require('@accordproject/concerto-core').RelationshipDeclaration;

const NS_PREFIX_TemplateMarkModel = require('./externalModels/TemplateMarkModel').NS_PREFIX_TemplateMarkModel;

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class TypeVisitor {

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            TypeVisitor.visitNodes(visitor, thing.nodes, parameters);
        }
    }

    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor, things, parameters) {
        things.forEach(node => {
            node.accept(visitor, parameters);
        });
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        const currentModel = parameters.model;
        const that = this;
        switch(thing.getType()) {
        case 'VariableDefinition':
        case 'FormattedVariableDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                if (property.isTypeEnum()) {
                    const enumVariableDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition');
                    const enumType = property.getParent().getModelFile().getType(property.getType());
                    thing.$classDeclaration = enumVariableDeclaration;
                    thing.enumValues = enumType.getOwnProperties().map(x => x.getName());
                } else if (property.isPrimitive()) {
                    thing.elementType = property.getFullyQualifiedTypeName();
                } else if (property instanceof RelationshipDeclaration) {
                    const elementType = property.getFullyQualifiedTypeName();
                    thing.elementType = elementType;
                    const nestedTemplateModel = parameters.introspector.getClassDeclaration(elementType);
                    const identifier = nestedTemplateModel.getIdentifierFieldName();
                    thing.identifiedBy = identifier ? identifier : '$identifier'; // Consistent with Concerto 1.0 semantics
                } else {
                    const elementType = property.getFullyQualifiedTypeName();
                    thing.elementType = elementType;
                }
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
        }
            break;
        case 'ClauseDefinition': {
            if (parameters.kind === 'contract') {
                const property = currentModel.getOwnProperty(thing.name);
                if (property) {
                    thing.elementType = property.getFullyQualifiedTypeName();
                } else {
                    throw new Error('Unknown property ' + thing.name);
                }
                const clauseModel = parameters.introspector.getClassDeclaration(thing.elementType);
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager:parameters.templateMarkModelManager,
                    introspector:parameters.introspector,
                    model:clauseModel,
                    kind:parameters.kind
                });
            } else {
                thing.elementType = parameters.model.getFullyQualifiedName();
                TypeVisitor.visitChildren(this, thing, parameters);
            }
        }
            break;
        case 'WithDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                thing.elementType = property.getFullyQualifiedTypeName();
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
            const withModel = parameters.introspector.getClassDeclaration(thing.elementType);
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:withModel,
                kind:parameters.kind
            });
        }
            break;
        case 'ListBlockDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                thing.elementType = property.getFullyQualifiedTypeName();
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
            const listModel = parameters.introspector.getClassDeclaration(thing.elementType);
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:listModel,
                kind:parameters.kind
            });
        }
            break;
        case 'JoinDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                thing.elementType = property.getFullyQualifiedTypeName();
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
            const listModel = parameters.introspector.getClassDeclaration(thing.elementType);
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:listModel,
                kind:parameters.kind
            });
        }
            break;
        case 'ContractDefinition': {
            thing.elementType = parameters.model.getFullyQualifiedName();
            TypeVisitor.visitChildren(this, thing, parameters);
        }
            break;
        default:
            TypeVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = TypeVisitor;