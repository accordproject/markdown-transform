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

var {
  CommonMarkModel,
  TemplateMarkModel
} = require('@accordproject/markdown-common');

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
    var _thing$isEnum, _thing$isClassDeclara, _thing$isField, _thing$isRelationship, _thing$isEnumValue;
    if ((_thing$isEnum = thing.isEnum) !== null && _thing$isEnum !== void 0 && _thing$isEnum.call(thing)) {
      return this.visitEnumDeclaration(thing, parameters);
    } else if ((_thing$isClassDeclara = thing.isClassDeclaration) !== null && _thing$isClassDeclara !== void 0 && _thing$isClassDeclara.call(thing)) {
      return this.visitClassDeclaration(thing, parameters);
    } else if ((_thing$isField = thing.isField) !== null && _thing$isField !== void 0 && _thing$isField.call(thing)) {
      return this.visitField(thing, parameters);
    } else if ((_thing$isRelationship = thing.isRelationship) !== null && _thing$isRelationship !== void 0 && _thing$isRelationship.call(thing)) {
      return this.visitRelationship(thing, parameters);
    } else if ((_thing$isEnumValue = thing.isEnumValue) !== null && _thing$isEnumValue !== void 0 && _thing$isEnumValue.call(thing)) {
      return this.visitEnumValueDeclaration(thing, parameters);
    } else {
      throw new Error('Unrecognised type: ' + typeof thing + ', value: ' + thing);
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
    var result = {};
    result.$class = "".concat(TemplateMarkModel.NAMESPACE, ".EnumVariableDefinition");
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
    var result = {};
    result.$class = "".concat(TemplateMarkModel.NAMESPACE, ".WithDefinition");
    result.name = parameters.name;
    result.nodes = [];
    var first = true;
    classDeclaration.getProperties().forEach((property, index) => {
      if (!first) {
        var textNode = {};
        textNode.$class = "".concat(CommonMarkModel.NAMESPACE, ".Text");
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
    var fieldName = field.getName();
    var result = {};
    result.$class = "".concat(TemplateMarkModel.NAMESPACE, ".VariableDefinition");
    result.name = fieldName;
    if (field.isArray()) {
      if (field.isPrimitive()) {
        result.name = 'this';
      }
      var arrayResult = {};
      arrayResult.$class = "".concat(TemplateMarkModel.NAMESPACE, ".JoinDefinition");
      arrayResult.separator = ' '; // XXX {{#join }}
      arrayResult.name = fieldName;
      arrayResult.nodes = [result];
      result = arrayResult;
    }
    if (field.isOptional()) {
      if (field.isPrimitive()) {
        result.name = 'this';
      }
      var optionalResult = {};
      optionalResult.$class = "".concat(TemplateMarkModel.NAMESPACE, ".OptionalDefinition");
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