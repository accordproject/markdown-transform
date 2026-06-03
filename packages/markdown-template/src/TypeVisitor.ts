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

import { TemplateMarkModel, ConcertoMetaModel } from '@accordproject/markdown-common';
import { _throwTemplateExceptionForElement } from './errorutil';

/**
 * Process the decorators on a model element
 */
function processDecorators(serializer: any, decorated: any): any[] | null {
    const result: any[] = [];
    const decorators = decorated.getDecorators();

    decorators.forEach((decorator: any) => {
        const metaDecorator: any = {
            '$class': `${ConcertoMetaModel.NAMESPACE}.Decorator`,
        };

        const name = decorator.getName();
        metaDecorator.name = name;
        metaDecorator.arguments = [];

        const args = decorator.getArguments();
        args.forEach((arg: any) => {
            let metaArgument;
            if (typeof arg === 'string') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorString`,
                    'value': arg,
                };
            } else if (typeof arg === 'number') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorNumber`,
                    'value': arg,
                };
            } else if (typeof arg === 'boolean') {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorBoolean`,
                    'value': arg,
                };
            } else {
                metaArgument = {
                    '$class': `${ConcertoMetaModel.NAMESPACE}.DecoratorTypeReference`,
                    'type': {
                        '$class': `${ConcertoMetaModel.NAMESPACE}.TypeIdentifier`,
                        'name': arg.name,
                    },
                    'isArray': arg.array,
                };
            }
            metaDecorator.arguments.push(metaArgument);
        });

        result.push(serializer.fromJSON(metaDecorator));
    });

    return result.length === 0 ? null : result;
}

/**
 * Adds the elementType property to a TemplateMark DOM
 */
export class TypeVisitor {
    static visitChildren(visitor: TypeVisitor, thing: any, parameters: any, field = 'nodes'): void {
        if (thing[field]) {
            TypeVisitor.visitNodes(visitor, thing[field], parameters);
        }
    }

    static visitNodes(visitor: TypeVisitor, things: any[], parameters: any): void {
        things.forEach((node) => {
            node.accept(visitor, parameters);
        });
    }

    static nextModel(property: any, parameters: any): any {
        const declaration = property.isPrimitive() ? null : parameters.introspector.getClassDeclaration(property.getFullyQualifiedTypeName());
        return {
            property: property.isPrimitive() ? property : null,
            declaration,
            typeIdentifier: property.isPrimitive() ? property.getFullyQualifiedTypeName() : declaration.getFullyQualifiedName(),
            decorated: property.isPrimitive() ? property : declaration,
        };
    }

    visit(thing: any, parameters: any): void {
        const currentModel = parameters.model;
        switch (thing.getType()) {
            case 'VariableDefinition':
            case 'FormattedVariableDefinition': {
                if (!currentModel) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }
                if (thing.name === 'this') {
                    const property = currentModel;

                    if (property && property.getType) {
                        const serializer = parameters.templateMarkModelManager.getSerializer();
                        thing.decorators = processDecorators(serializer, property);
                        if (property.isTypeEnum && property.isTypeEnum()) {
                            const enumVariableDeclaration = parameters.templateMarkModelManager.getType(`${TemplateMarkModel.NAMESPACE}.EnumVariableDefinition`);
                            const enumType = property.getParent().getModelFile().getType(property.getType());
                            thing.elementType = property.getFullyQualifiedTypeName();
                            thing.$classDeclaration = enumVariableDeclaration;
                            thing.enumValues = enumType.getOwnProperties().map((x: any) => x.getName());
                        } else if (property.isPrimitive()) {
                            thing.elementType = property.getFullyQualifiedTypeName();
                        } else if (property.isRelationship?.()) {
                            const elementType = property.getFullyQualifiedTypeName();
                            thing.elementType = elementType;
                            const nestedTemplateModel = parameters.introspector.getClassDeclaration(elementType);
                            const identifier = nestedTemplateModel.getIdentifierFieldName();
                            thing.identifiedBy = identifier ? identifier : '$identifier';
                        } else {
                            thing.elementType = property.getFullyQualifiedTypeName();
                        }
                    } else {
                        thing.elementType = property.getFullyQualifiedName();
                    }
                } else {
                    if (!currentModel.getProperty) {
                        _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                    }
                    const property = currentModel.getProperty(thing.name);
                    if (property) {
                        const serializer = parameters.templateMarkModelManager.getSerializer();
                        thing.decorators = processDecorators(serializer, property);
                        if (property.isTypeEnum && property.isTypeEnum()) {
                            const enumVariableDeclaration = parameters.templateMarkModelManager.getType(`${TemplateMarkModel.NAMESPACE}.EnumVariableDefinition`);
                            const enumType = property.getParent().getModelFile().getType(property.getType());
                            thing.elementType = property.getFullyQualifiedTypeName();
                            thing.$classDeclaration = enumVariableDeclaration;
                            thing.enumValues = enumType.getOwnProperties().map((x: any) => x.getName());
                        } else if (property.isPrimitive()) {
                            thing.elementType = property.getFullyQualifiedTypeName();
                        } else if (property.isRelationship?.()) {
                            const elementType = property.getFullyQualifiedTypeName();
                            thing.elementType = elementType;
                            const nestedTemplateModel = parameters.introspector.getClassDeclaration(elementType);
                            const identifier = nestedTemplateModel.getIdentifierFieldName();
                            thing.identifiedBy = identifier ? identifier : '$identifier';
                        } else {
                            thing.elementType = property.getFullyQualifiedTypeName();
                        }
                    } else {
                        _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                    }
                }
                break;
            }
            case 'ClauseDefinition': {
                if (parameters.kind === 'contract') {
                    if (!currentModel) {
                        _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                    }
                    const property = currentModel.getOwnProperty(thing.name);
                    if (!property) {
                        _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                    }
                    const { typeIdentifier, decorated } = TypeVisitor.nextModel(property, parameters);
                    thing.elementType = typeIdentifier;
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer, decorated);
                    TypeVisitor.visitChildren(this, thing, {
                        templateMarkModelManager: parameters.templateMarkModelManager,
                        introspector: parameters.introspector,
                        model: decorated,
                        kind: parameters.kind,
                    });
                } else {
                    if (!currentModel) {
                        _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                    }
                    const serializer = parameters.templateMarkModelManager.getSerializer();
                    thing.decorators = processDecorators(serializer, currentModel);
                    thing.elementType = currentModel.getFullyQualifiedName();
                    TypeVisitor.visitChildren(this, thing, parameters);
                }
                break;
            }
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
                thing.decorators = processDecorators(serializer, nextModel);
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: nextModel,
                    kind: parameters.kind,
                });
                break;
            }
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
                thing.decorators = processDecorators(serializer, property);
                if (property.isPrimitive()) {
                    nextModel = property;
                } else {
                    thing.elementType = property.getFullyQualifiedTypeName();
                    nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
                }
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: nextModel,
                    kind: parameters.kind,
                });
                break;
            }
            case 'ConditionalDefinition': {
                const property = currentModel.getOwnProperty(thing.name);
                if (thing.name !== 'if' && !property) {
                    _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
                }

                const serializer = parameters.templateMarkModelManager.getSerializer();
                thing.decorators = property ? processDecorators(serializer, property) : null;
                const nextModel = property;
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: nextModel,
                    kind: parameters.kind,
                }, 'whenTrue');
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: null,
                    kind: parameters.kind,
                }, 'whenFalse');
                break;
            }
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
                thing.decorators = processDecorators(serializer, property);
                if (property.isPrimitive()) {
                    thing.elementType = property.getFullyQualifiedTypeName();
                    nextModel = property;
                } else {
                    thing.elementType = property.getFullyQualifiedTypeName();
                    nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
                }
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: nextModel,
                    kind: parameters.kind,
                }, 'whenSome');
                TypeVisitor.visitChildren(this, thing, {
                    templateMarkModelManager: parameters.templateMarkModelManager,
                    introspector: parameters.introspector,
                    model: null,
                    kind: parameters.kind,
                }, 'whenNone');
                break;
            }
            case 'ContractDefinition':
                thing.elementType = currentModel.getFullyQualifiedName();
                TypeVisitor.visitChildren(this, thing, parameters);
                break;
            default:
                TypeVisitor.visitChildren(this, thing, parameters);
        }
    }
}

export default TypeVisitor;
