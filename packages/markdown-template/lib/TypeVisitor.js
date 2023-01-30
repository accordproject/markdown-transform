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

var NS_PREFIX_TemplateMarkModel = require('./externalModels/TemplateMarkModel').NS_PREFIX_TemplateMarkModel;
var _throwTemplateExceptionForElement = require('./errorutil')._throwTemplateExceptionForElement;

/**
 * @param {*} serializer - the serializer
 * @param {object} decorated - the property
 * @return {object} the array of decorators compliant with the Concerto metamodel (JSON)
 */
function processDecorators(serializer, decorated) {
  var result = [];
  var decorators = decorated.getDecorators();
  decorators.forEach(decorator => {
    var metaDecorator = {
      '$class': 'concerto.metamodel.Decorator'
    };

    // The decorator's name
    var name = decorator.getName();
    metaDecorator.name = name;
    metaDecorator.arguments = [];

    // The decorator's arguments
    var args = decorator.getArguments();
    args.forEach(arg => {
      var metaArgument;
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
  static visitChildren(visitor, thing, parameters) {
    var field = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'nodes';
    if (thing[field]) {
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
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Visit a node
   * @param {*} thing the object being visited
   * @param {*} parameters the parameters
   */
  visit(thing, parameters) {
    var currentModel = parameters.model;
    switch (thing.getType()) {
      case 'VariableDefinition':
      case 'FormattedVariableDefinition':
        {
          if (!currentModel) {
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          if (thing.name === 'this') {
            var property = currentModel;
            if (property) {
              var _property$isRelations;
              var serializer = parameters.templateMarkModelManager.getSerializer();
              thing.decorators = processDecorators(serializer, property);
              if (property.isTypeEnum()) {
                var enumVariableDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition');
                var enumType = property.getParent().getModelFile().getType(property.getType());
                thing.elementType = property.getFullyQualifiedTypeName();
                thing.$classDeclaration = enumVariableDeclaration;
                thing.enumValues = enumType.getOwnProperties().map(x => x.getName());
              } else if (property.isPrimitive()) {
                thing.elementType = property.getFullyQualifiedTypeName();
              } else if ((_property$isRelations = property.isRelationship) !== null && _property$isRelations !== void 0 && _property$isRelations.call(property)) {
                var elementType = property.getFullyQualifiedTypeName();
                thing.elementType = elementType;
                var nestedTemplateModel = parameters.introspector.getClassDeclaration(elementType);
                var identifier = nestedTemplateModel.getIdentifierFieldName();
                thing.identifiedBy = identifier ? identifier : '$identifier'; // Consistent with Concerto 1.0 semantics
              } else {
                var _elementType = property.getFullyQualifiedTypeName();
                thing.elementType = _elementType;
              }
            }
          } else {
            if (!currentModel.getProperty) {
              console.log('****' + currentModel + ' ' + currentModel.getProperty);
              _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            var _property = currentModel.getProperty(thing.name);
            if (_property) {
              var _property$isRelations2;
              var _serializer = parameters.templateMarkModelManager.getSerializer();
              thing.decorators = processDecorators(_serializer, _property);
              if (_property.isTypeEnum()) {
                var _enumVariableDeclaration = parameters.templateMarkModelManager.getType(NS_PREFIX_TemplateMarkModel + 'EnumVariableDefinition');
                var _enumType = _property.getParent().getModelFile().getType(_property.getType());
                thing.elementType = _property.getFullyQualifiedTypeName();
                thing.$classDeclaration = _enumVariableDeclaration;
                thing.enumValues = _enumType.getOwnProperties().map(x => x.getName());
              } else if (_property.isPrimitive()) {
                thing.elementType = _property.getFullyQualifiedTypeName();
              } else if ((_property$isRelations2 = _property.isRelationship) !== null && _property$isRelations2 !== void 0 && _property$isRelations2.call(_property)) {
                var _elementType2 = _property.getFullyQualifiedTypeName();
                thing.elementType = _elementType2;
                var _nestedTemplateModel = parameters.introspector.getClassDeclaration(_elementType2);
                var _identifier = _nestedTemplateModel.getIdentifierFieldName();
                thing.identifiedBy = _identifier ? _identifier : '$identifier'; // Consistent with Concerto 1.0 semantics
              } else {
                var _elementType3 = _property.getFullyQualifiedTypeName();
                thing.elementType = _elementType3;
              }
            } else {
              _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
          }
        }
        break;
      case 'ClauseDefinition':
        {
          if (parameters.kind === 'contract') {
            if (!currentModel) {
              _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            var _property2 = currentModel.getOwnProperty(thing.name);
            var nextModel;
            if (!_property2) {
              _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            if (_property2.isPrimitive()) {
              nextModel = _property2;
            } else {
              thing.elementType = _property2.getFullyQualifiedTypeName();
              nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
            }
            var _serializer2 = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(_serializer2, nextModel);
            TypeVisitor.visitChildren(this, thing, {
              templateMarkModelManager: parameters.templateMarkModelManager,
              introspector: parameters.introspector,
              model: nextModel,
              kind: parameters.kind
            });
          } else {
            if (!currentModel) {
              _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
            }
            var _serializer3 = parameters.templateMarkModelManager.getSerializer();
            thing.decorators = processDecorators(_serializer3, currentModel);
            thing.elementType = currentModel.getFullyQualifiedName();
            TypeVisitor.visitChildren(this, thing, parameters);
          }
        }
        break;
      case 'WithDefinition':
        {
          var _property3 = currentModel.getOwnProperty(thing.name);
          var _nextModel;
          if (!_property3) {
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          if (_property3.isPrimitive()) {
            _nextModel = _property3;
          } else {
            thing.elementType = _property3.getFullyQualifiedTypeName();
            _nextModel = parameters.introspector.getClassDeclaration(thing.elementType);
          }
          var _serializer4 = parameters.templateMarkModelManager.getSerializer();
          thing.decorators = processDecorators(_serializer4, _nextModel);
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: _nextModel,
            kind: parameters.kind
          });
        }
        break;
      case 'ListBlockDefinition':
        {
          var _property4 = currentModel.getOwnProperty(thing.name);
          var _nextModel2;
          if (!_property4) {
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          if (!_property4.isArray()) {
            _throwTemplateExceptionForElement('List template not on an array property: ' + thing.name, thing);
          }
          var _serializer5 = parameters.templateMarkModelManager.getSerializer();
          thing.decorators = processDecorators(_serializer5, _property4);
          if (_property4.isPrimitive()) {
            _nextModel2 = _property4;
          } else {
            thing.elementType = _property4.getFullyQualifiedTypeName();
            _nextModel2 = parameters.introspector.getClassDeclaration(thing.elementType);
          }
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: _nextModel2,
            kind: parameters.kind
          });
        }
        break;
      case 'JoinDefinition':
        {
          var _property5 = currentModel.getOwnProperty(thing.name);
          var _nextModel3;
          if (!_property5) {
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          if (!_property5.isArray()) {
            _throwTemplateExceptionForElement('Join template not on an array property: ' + thing.name, thing);
          }
          var _serializer6 = parameters.templateMarkModelManager.getSerializer();
          thing.decorators = processDecorators(_serializer6, _property5);
          if (_property5.isPrimitive()) {
            _nextModel3 = _property5;
          } else {
            thing.elementType = _property5.getFullyQualifiedTypeName();
            _nextModel3 = parameters.introspector.getClassDeclaration(thing.elementType);
          }
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: _nextModel3,
            kind: parameters.kind
          });
        }
        break;
      case 'ConditionalDefinition':
        {
          var _property6 = currentModel.getOwnProperty(thing.name);
          console.log(_property6);
          var _nextModel4;
          if (thing.name !== 'if' && !_property6) {
            // hack, allow the node to have the name 'if'
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          // if (property.getType() !== 'Boolean') {
          //     _throwTemplateExceptionForElement('Conditional template not on a boolean property: ' + thing.name, thing);
          // }
          var _serializer7 = parameters.templateMarkModelManager.getSerializer();
          thing.decorators = processDecorators(_serializer7, _property6);
          _nextModel4 = _property6;
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: _nextModel4,
            kind: parameters.kind
          }, 'whenTrue');
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: null,
            kind: parameters.kind
          }, 'whenFalse');
        }
        break;
      case 'OptionalDefinition':
        {
          var _property7 = currentModel.getOwnProperty(thing.name);
          var _nextModel5;
          if (!_property7) {
            _throwTemplateExceptionForElement('Unknown property: ' + thing.name, thing);
          }
          if (!_property7.isOptional()) {
            _throwTemplateExceptionForElement('Optional template not on an optional property: ' + thing.name, thing);
          }
          var _serializer8 = parameters.templateMarkModelManager.getSerializer();
          thing.decorators = processDecorators(_serializer8, _property7);
          if (_property7.isPrimitive()) {
            thing.elementType = _property7.getFullyQualifiedTypeName();
            _nextModel5 = _property7;
          } else {
            thing.elementType = _property7.getFullyQualifiedTypeName();
            _nextModel5 = parameters.introspector.getClassDeclaration(thing.elementType);
          }
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: _nextModel5,
            kind: parameters.kind
          }, 'whenSome');
          TypeVisitor.visitChildren(this, thing, {
            templateMarkModelManager: parameters.templateMarkModelManager,
            introspector: parameters.introspector,
            model: null,
            kind: parameters.kind
          }, 'whenNone');
        }
        break;
      case 'ContractDefinition':
        {
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