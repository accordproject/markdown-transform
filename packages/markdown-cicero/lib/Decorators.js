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
 * A class to retrieve decorators on CiceroMark nodes
 */
class Decorators {
    /**
     * Construct an instance, based on a CiceroMark node
     * Note that decorator arguments must be specified as an
     * array of [name (string),value] pairs, even though this is
     * not enforced by the Concerto grammar.
     * @param {object} node the CiceroMark node
     */
    constructor(node) {
        this.data = {};
        if(node.decorators) {
            node.decorators.forEach( (d) => {
                if(d.arguments.length % 2 !==0) {
                    throw new Error('Arguments must be [name, value] pairs');
                }
                const args = {};
                for( let n=0; n < d.arguments.length-1; n=n+2) {
                    const arg = d.arguments[n];
                    if(arg.$class && arg.$class !== 'concerto.metamodel.DecoratorString') {
                        throw new Error(`Argument names must be strings. Found ${arg.$class}`);
                    }
                    const argValue = d.arguments[n+1];
                    args[arg.value] = argValue.$class === 'concerto.metamodel.DecoratorIdentifier' ? argValue.identifier : argValue.value;
                }
                this.data[d.name] = args;
            });
        }
    }

    /**
     * Returns true is the decorator is present
     * @param {string} decoratorName the name of the decorator
     * @returns {boolean} true is the decorator is present
     */
    hasDecorator(decoratorName) {
        return !!this.data[decoratorName];
    }

    /**
     * Get the arguments for a named decorator
     * @param {string} decoratorName the name of the decorator
     * @returns {array} an array of arguments, or null
     */
    getArguments(decoratorName) {
        return this.data[decoratorName];
    }

    /**
     * Get the arguments for a named decorator
     * @param {string} decoratorName the name of the decorator
     * @param {string} argumentName the name of the decorator argument
     * @returns {object} the value of the argument or null if the decorator
     * is missing or undefined if the argument is missing
     */
    getDecoratorValue(decoratorName, argumentName) {
        const args = this.getArguments(decoratorName);
        if(args) {
            return args[argumentName];
        }
        return null;
    }
}

module.exports = Decorators;