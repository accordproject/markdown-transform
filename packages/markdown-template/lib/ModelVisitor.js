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

const util = require('util');

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const NS_PREFIX_TemplateMarkModel = require('./externalModels/TemplateMarkModel').NS_PREFIX_TemplateMarkModel;

/**
 * Converts concerto models to TemplateMark
 *
 * @private
 * @class
 */
class ModelVisitor {
    /**
     * Visitor design pattern
     * @param {Object} thing - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visit(thing, parameters) {
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
            throw new Error('Unrecognised type: ' + typeof thing + ', value: ' + util.inspect(thing, {
                showHidden: true,
                depth: 2
            }));
        }
    }

    /**
     * Visitor design pattern
     * @param {EnumDeclaration} enumDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitEnumDeclaration(enumDeclaration, parameters) {
        let result = {};
        result.$class = NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition';
        result.name = parameters.type;
        return result;
    }

    /**
     * Visitor design pattern
     * @param {ClassDeclaration} classDeclaration - the object being visited
     * @param {Object} parameters - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitClassDeclaration(classDeclaration, parameters) {
        let result = {};
        result.$class = NS_PREFIX_TemplateMarkModel + 'WithDefinition';
        result.name = parameters.name;
        result.nodes = [];

        let first = true;
        classDeclaration.getProperties().forEach((property,index) => {
            if (!first) {
                let textNode = {};
                textNode.$class = NS_PREFIX_CommonMarkModel + 'Text';
                textNode.text = ' ';
                result.nodes.push(textNode);
            }
            result.nodes.push(property.accept(this, parameters));
            first = false;
        });

        return result;
    }

    /**
     * Visitor design pattern
     * @param {Field} field - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitField(field, parameters) {
        const fieldName = field.getName();

        let result = {};
        result.$class = NS_PREFIX_TemplateMarkModel + 'VariableDefinition';
        result.name = fieldName;
        if(field.isArray()) {
            if (field.isPrimitive()) {
                result.name = 'this';
            }
            const arrayResult = {};
            arrayResult.$class = NS_PREFIX_TemplateMarkModel + 'JoinDefinition';
            arrayResult.separator = ' '; // XXX {{#join }}
            arrayResult.name = fieldName;
            arrayResult.nodes = [result];
            result = arrayResult;
        }
        if(field.isOptional()) {
            if (field.isPrimitive()) {
                result.name = 'this';
            }
            const optionalResult = {};
            optionalResult.$class = NS_PREFIX_TemplateMarkModel + 'OptionalDefinition';
            optionalResult.name = fieldName;
            optionalResult.whenSome = [result];
            optionalResult.whenNone = [];
            result = optionalResult;
        }

        return result;
    }

    /**
     * Visitor design pattern
     * @param {EnumValueDeclaration} enumValueDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @private
     */
    visitEnumValueDeclaration(enumValueDeclaration, parameters) {
        throw new Error('visitEnumValueDeclaration not handled');
    }

    /**
     * Visitor design pattern
     * @param {Relationship} relationship - the object being visited
     * @param {Object} parameters  - the parameter
     * @private
     */
    visitRelationshipDeclaration(relationship, parameters) {
        throw new Error('visitRelationshipDeclaration');
    }
}

module.exports = ModelVisitor;
