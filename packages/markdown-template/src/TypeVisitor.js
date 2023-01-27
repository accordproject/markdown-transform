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
            '$class': 'concerto.metamodel.Decorator',
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
                    '$class': 'concerto.metamodel.DecoratorString',
                    'value': arg
                };
            } else if (typeof arg === 'number') {
                metaArgument = {
                    '$class': 'concerto.metamodel.DecoratorNumber',
                    'value': arg
                };
            } else if (typeof arg === 'boolean') {
                metaArgument = {
                    '$class': 'concerto.metamodel.DecoratorBoolean',
                    'value': arg
                };
            } else {
                metaArgument = {
                    '$class': 'concerto.metamodel.DecoratorTypeReference',
                    'type': {
                        '$class': 'concerto.metamodel.TypeIdentifier',
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
 * Converts a CommonMark DOM to a CiceroMark DOM
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
        try {
            things.forEach(node => {
                node.accept(visitor, parameters);
            });
        }
        catch(err) {
            console.log(err);
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
        case 'FormattedVariableDefinition': {
            if (!currentModel) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (thing.name === 'this') {
                const property = currentModel;
                if (property) {
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer,property);
                    if (property.isTypeEnum()) {
                        const enumVariableDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition');
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
            } else {
                if (!currentModel.getProperty) {
                    console.log('****' + currentModel + ' ' + currentModel.getProperty);
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                const property = currentModel.getProperty(thing.name);
                if (property) {
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer,property);
                    if (property.isTypeEnum()) {
                        const enumVariableDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition');
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
        case 'ListBlockDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (!property.isArray()) {
                _throwTemplateExceptionForElement('List template not on an array property: ' + thing.name, thing);
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
        case 'JoinDefinition': {
            const property = currentModel.getOwnProperty(thing.name);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (!property.isArray()) {
                _throwTemplateExceptionForElement('Join template not on an array property: ' + thing.name, thing);
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
            console.log(property);
            let nextModel;
            if (!property) {
                _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            // if (property.getType() !== 'Boolean') {
            //     _throwTemplateExceptionForElement('Conditional template not on a boolean property: ' + thing.name, thing);
            // }
            const serializer = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(serializer,property);
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