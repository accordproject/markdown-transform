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

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class FormulaVisitor {

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @param {string} field where the children are
     */
    static visitChildren(visitor, thing, parameters, field = 'nodes') {
        if(thing[field]) {
            FormulaVisitor.visitNodes(visitor, thing[field], parameters);
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
        switch(thing.getType()) {
        case 'VariableDefinition':
        case 'FormattedVariableDefinition':
        case 'EnumVariableDefinition': {
            if (parameters.calculateDependencies) {
                parameters.variables.push(thing.name);
            }
        }
            break;
        case 'FormulaDefinition': {
            if (parameters.calculateDependencies) {
                thing.dependencies = parameters.variables;
            } else {
                parameters.result.push({ name : thing.name, code: thing.code });
            }
        }
            break;
        default:
            FormulaVisitor.visitChildren(this, thing, parameters);
        }
    }

    /**
     * Calculate dependencies
     * @param {*} serializer - the template mark serializer
     * @param {object} ast - the template AST
     * @returns {*} the formulas
     */
    calculateDependencies(serializer,ast) {
        const parameters = {
            calculateDependencies: true,
            variables: [],
            result: [],
        };
        const input = serializer.fromJSON(ast);
        input.accept(this, parameters);
        return serializer.toJSON(input);
    }

    /**
     * Process formulas and returns the list of those formulas from a TemplateMark DOM
     * @param {*} serializer - the template mark serializer
     * @param {object} ast - the template AST
     * @returns {*} the formulas
     */
    processFormulas(serializer,ast) {
        const parameters = {
            calculateDependencies: false,
            variables: [],
            result: [],
        };
        const input = serializer.fromJSON(ast);
        input.accept(this, parameters);
        return parameters.result;
    }
}

module.exports = FormulaVisitor;