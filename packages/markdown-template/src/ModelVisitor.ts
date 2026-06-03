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

import { CommonMarkModel, TemplateMarkModel } from '@accordproject/markdown-common';

/**
 * Converts concerto models to TemplateMark
 */
export class ModelVisitor {
    visit(thing: any, parameters: any): any {
        if (thing.isEnum?.()) {
            return this.visitEnumDeclaration(thing, parameters);
        } else if (thing.isClassDeclaration?.()) {
            return this.visitClassDeclaration(thing, parameters);
        } else if (thing.isField?.()) {
            return this.visitField(thing, parameters);
        } else if (thing.isRelationship?.()) {
            return this.visitRelationship(thing, parameters);
        } else if (thing.isEnumValue?.()) {
            return this.visitEnumValueDeclaration(thing, parameters);
        } else {
            throw new Error('Unrecognised type: ' + typeof thing + ', value: ' + thing);
        }
    }

    visitEnumDeclaration(_enumDeclaration: any, parameters: any): any {
        const result: any = {};
        result.$class = `${TemplateMarkModel.NAMESPACE}.EnumVariableDefinition`;
        result.name = parameters.type;
        return result;
    }

    visitClassDeclaration(classDeclaration: any, parameters: any): any {
        const result: any = {};
        result.$class = `${TemplateMarkModel.NAMESPACE}.WithDefinition`;
        result.name = parameters.name;
        result.nodes = [];

        let first = true;
        classDeclaration.getProperties().forEach((property: any) => {
            if (!first) {
                const textNode: any = {};
                textNode.$class = `${CommonMarkModel.NAMESPACE}.Text`;
                textNode.text = ' ';
                result.nodes.push(textNode);
            }
            result.nodes.push(property.accept(this, parameters));
            first = false;
        });

        return result;
    }

    visitField(field: any, _parameters: any): any {
        const fieldName = field.getName();

        let result: any = {};
        result.$class = `${TemplateMarkModel.NAMESPACE}.VariableDefinition`;
        result.name = fieldName;
        if (field.isArray()) {
            if (field.isPrimitive()) {
                result.name = 'this';
            }
            const arrayResult: any = {};
            arrayResult.$class = `${TemplateMarkModel.NAMESPACE}.JoinDefinition`;
            arrayResult.separator = ' ';
            arrayResult.name = fieldName;
            arrayResult.nodes = [result];
            result = arrayResult;
        }
        if (field.isOptional()) {
            if (field.isPrimitive()) {
                result.name = 'this';
            }
            const optionalResult: any = {};
            optionalResult.$class = `${TemplateMarkModel.NAMESPACE}.OptionalDefinition`;
            optionalResult.name = fieldName;
            optionalResult.whenSome = [result];
            optionalResult.whenNone = [];
            result = optionalResult;
        }

        return result;
    }

    visitEnumValueDeclaration(_enumValueDeclaration: any, _parameters: any): never {
        throw new Error('visitEnumValueDeclaration not handled');
    }

    visitRelationship(_relationship: any, _parameters: any): never {
        throw new Error('visitRelationship not handled');
    }

    visitRelationshipDeclaration(_relationship: any, _parameters: any): never {
        throw new Error('visitRelationshipDeclaration');
    }
}

export default ModelVisitor;
