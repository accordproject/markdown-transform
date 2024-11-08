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

const {TemplateMarkModel, ConcertoMetaModel} = require('@accordproject/markdown-common');

const _throwTemplateExceptionForElement = require('./errorutil')._throwTemplateExceptionForElement;

/**
 * @param {*} serializer - the serializer
 * @param {object} decorated - the property
 * @return {object} the array of decorators compliant with the Concerto metamodel (JSON)
 */
function processDecorators(serializer,decorated) {
    const result = [];
    const decorators = decorated.getDecorators();

    decorators.forEach((decorator) => {
        const metaDecorator = {
            '$class': `${ConcertoMetaModel.NAMESPACE}.Decorator`,
        };

        // The decorator's name
        const name = decorator.getName();
        metaDecorator.name = name;
        metaDecorator.arguments = [];

        // The decorator's arguments
        const args = decorator.getArguments();
        args.forEach((arg) => {
            let metaArgument;
            if (typeof arg === 'string') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorString`,
                    'value': arg
                };
            } else if (typeof arg === 'number') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorNumber`,
                    'value': arg
                };
            } else if (typeof arg === 'boolean') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorBoolean`,
                    'value': arg
                };
            } else {
                metaArgument = {
                    '$class':`${ConcertoMetaModel.NAMESPACE}.DecoratorTypeReference`,
                    'type': {
                        '$class': `${ConcertoMetaModel.NAMESPACE}.TypeIdentifier`,
                        'name': arg.name
                    },
                    'isArray': arg.array
                };
            }
            metaDecorator.arguments.push(metaArgument);
        });

        // Validate individual arguments here
        //console.log('DECORATE ' + JSON.stringify(metaDecorator));
        result.push(serializer.fromJSON(metaDecorator));
    });

    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

/**
 * Adds the elementType property to a TemplateMark DOM
 * along with type specific metadata. This visitor verifies
 * the structure of a template with respect to an associated
 * template model and annotates the TemplateMark DOM with model
 * information for use in downstream tools.
 */
class TypeVisitor {
    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @param {string} field where the children are
     */
    static visitChildren(visitor, thing, parameters, field = 'nodes') {
        if(thing[field]) {
            TypeVisitor.visitNodes(visitor, thing[field], parameters);
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
     * Get the type information for a property
     * @param {*} property the propety
     * @param {*} parameters the configuration parameters
     * @returns {*} the information about the next model element (property or declaration)
     */
    static nextModel(property, parameters) {
        const declaration = property.isPrimitive() ? null : parameters.introspector.getClassDeclaration(property.getFullyQualifiedTypeName());
        return {
            property: property.isPrimitive() ? property : null,
            declaration,
            typeIdentifier: property.isPrimitive() ? property.getFullyQualifiedTypeName() : declaration.getFullyQualifiedName(),
            decorated: property.isPrimitive() ? property : declaration
        };
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
        case 'FormattedVariableDefinition': {
            if (!currentModel) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (thing.name === 'this') {
                const property = currentModel; // BUG... if we are iterating over an array
                // of complex types using a {{this}}, then thing will be a ClassDeclaration or an
                // EnumDeclaration!!

                if (property && property.getType) {
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer,property);
                    if (property.isTypeEnum && property.isTypeEnum()) {
                        const enumVariableDeclaration = parameters.templateMarkModelManager.getType(`${TemplateMarkModel.NAMESPACE}.EnumVariableDefinition`);
                        const enumType = property.getParent().getModelFile().getType(property.getType());
                        thing.elementType = property.getFullyQualifiedTypeName();
                        thing.$classDeclaration = enumVariableDeclaration;
                        thing.enumValues = enumType.getOwnProperties().map(x => x.getName());
                    } else if (property.isPrimitive()) {
                        thing.elementType = property.getFullyQualifiedTypeName();
                    } else if (property.isRelationship?.()) {
                        const elementType = property.getFullyQualifiedTypeName();
                        thing.elementType = elementType;
                        const nestedTemplateModel = parameters.introspector.getClassDeclaration(elementType);
                        const identifier = nestedTemplateModel.getIdentifierFieldName();
                        thing.identifiedBy = identifier ? identifier : '$identifier'; // Consistent with Concerto 1.0 semantics
                    } else {
                        const elementType = property.getFullyQualifiedTypeName();
                        thing.elementType = elementType;
                    }
                }
                else {
                    // it is a class
                    const elementType = property.getFullyQualifiedName();
                    thing.elementType = elementType;
                }
            } else {
                if (!currentModel.getProperty) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                const property = currentModel.getProperty(thing.name);
                if (property) {
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer,property);
                    if (property.isTypeEnum && property.isTypeEnum()) {
                        const enumVariableDeclaration = parameters.templateMarkModelManager.getType(`${TemplateMarkModel.NAMESPACE}.EnumVariableDefinition`);
                        const enumType = property.getParent().getModelFile().getType(property.getType());
                        thing.elementType = property.getFullyQualifiedTypeName();
                        thing.$classDeclaration = enumVariableDeclaration;
                        thing.enumValues = enumType.getOwnProperties().map(x => x.getName());
                    } else if (property.isPrimitive()) {
                        thing.elementType = property.getFullyQualifiedTypeName();
                    } else if (property.isRelationship?.()) {
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
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
            }
        }
            break;
        case 'ClauseDefinition': {
            if (parameters.kind === 'contract') {
                if (!currentModel) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                const property = currentModel.getOwnProperty(thing.name);
                if (!property) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                const {typeIdentifier, decorated} = TypeVisitor.nextModel(property, parameters);
                thing.elementType = typeIdentifier;
                const serializer = parameters.templateMarkModelManager.getSerializer();
                thing.decorators = processDecorators(serializer,decorated);
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager:parameters.templateMarkModelManager,
                    introspector:parameters.introspector,
                    model:decorated,
                    kind:parameters.kind
                });
            } else {
                if (!currentModel) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                const serializer = parameters.templateMarkModelManager.getSerializer();
                thing.decorators = processDecorators(serializer,currentModel);
                thing.elementType = currentModel.getFullyQualifiedName();
                TypeVisitor.visitChildren(this, thing, parameters);
            }
        }
            break;
        case 'WithDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (property.isPrimitive()) {
                nextModel = property;
            } else {
                thing.elementType = property.getFullyQualifiedTypeName();
                nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
            }
            const serializer = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(serializer,nextModel);
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:nextModel,
                kind:parameters.kind
            });
        }
            break;
        case 'ForeachDefinition':
        case 'JoinDefinition':
        case 'ListBlockDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (!property.isArray()) {
                _throwTemplateExceptionForElement(`${thing.getType()} template not on an array property: ${thing.name}`, thing);
            }
            const serializer = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(serializer,property);
            if (property.isPrimitive()) {
                nextModel = property;
            } else {
                thing.elementType = property.getFullyQualifiedTypeName();
                nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
            }
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:nextModel,
                kind:parameters.kind
            });
        }
            break;
        case 'ConditionalDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (thing.name !== 'if' && !property) { // hack, allow the node to have the name 'if'
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }

            // if (property.getType() !== 'Boolean') {
            //     _throwTemplateExceptionForElement('Conditional template not on a boolean property: ' + thing.name, thing);
            // }
            const serializer = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = property ? processDecorators(serializer,property) : null;
            nextModel = property;
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:nextModel,
                kind:parameters.kind
            }, 'whenTrue');
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:null,
                kind:parameters.kind
            }, 'whenFalse');
        }
            break;
        case 'OptionalDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (!property.isOptional()) {
                _throwTemplateExceptionForElement('Optional template not on an optional property: ' + thing.name, thing);
            }
            const serializer = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(serializer,property);
            if (property.isPrimitive()) {
                thing.elementType = property.getFullyQualifiedTypeName();
                nextModel = property;
            } else {
                thing.elementType = property.getFullyQualifiedTypeName();
                nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
            }
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:nextModel,
                kind:parameters.kind
            }, 'whenSome');
            TypeVisitor.visitChildren(this, thing, {
                templateMarkModelManager:parameters.templateMarkModelManager,
                introspector:parameters.introspector,
                model:null,
                kind:parameters.kind
            }, 'whenNone');
        }
            break;
        case 'ContractDefinition': {
            thing.elementType = currentModel.getFullyQualifiedName();
            TypeVisitor.visitChildren(this, thing, parameters);
        }
            break;
        default:
            TypeVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = TypeVisitor;