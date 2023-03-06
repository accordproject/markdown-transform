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

const acorn = require('acorn');
const walk = require('acorn-walk');

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
     * Calculates the dependencies for JS code
     * @param {string} jsCode the JS code to analyze
     * @returns {string[]} array of dependencies
     */
    static calculateDependencies(jsCode) {
        try {
            const deps = [];
            walk.simple(acorn.parse(jsCode, {ecmaVersion: 2020, allowReturnOutsideFunction: true}), {
                Identifier(node) {
                    deps.push(node.name);
                }
            });
            return deps;
        }
        catch(err) {
            console.log(`Failed to calculate dependencies in code '${jsCode}'. Error: ${err}`);
            return [];
        }
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        switch(thing.getType()) {
        case 'ConditionalDefinition':
            {
                if (parameters.calculateDependencies) {
                    thing.dependencies = FormulaVisitor.calculateDependencies(thing.condition);
                } else {
                    parameters.result.push({ name : thing.name, code: thing.condition });
                }
            }
            break;
        case 'FormulaDefinition': {
            if (parameters.calculateDependencies) {
                thing.dependencies = FormulaVisitor.calculateDependencies(thing.code);
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
     * @param {object} options - options
     * @param {number} [options.utcOffset] - UTC Offset for this execution
     * @returns {*} the formulas
     */
    calculateDependencies(serializer,ast,options) {
        const parameters = {
            calculateDependencies: true,
            variables: [],
            result: []
        };
        const input = serializer.fromJSON(ast,options);
        input.accept(this, parameters);
        return serializer.toJSON(input,options);
    }

    /**
     * Process formulas and returns the list of those formulas from a TemplateMark DOM
     * @param {*} serializer - the template mark serializer
     * @param {object} ast - the template AST
     * @param {object} options - options
     * @param {number} [options.utcOffset] - UTC Offset for this execution
     * @returns {*} the formulas
     */
    processFormulas(serializer,ast,options) {
        const parameters = {
            calculateDependencies: false,
            variables: [],
            result: [],
        };
        const input = serializer.fromJSON(ast,options);
        input.accept(this, parameters);
        return parameters.result;
    }
}

module.exports = FormulaVisitor;