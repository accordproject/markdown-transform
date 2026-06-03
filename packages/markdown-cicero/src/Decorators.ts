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

import { ConcertoMetaModel } from '@accordproject/markdown-common';

/**
 * A class to retrieve decorators on CiceroMark nodes
 */
export class Decorators {
    data: Record<string, Record<string, any>>;

    /**
     * Construct an instance, based on a CiceroMark node
     * Note that decorator arguments must be specified as an
     * array of [name (string),value] pairs, even though this is
     * not enforced by the Concerto grammar.
     */
    constructor(node: any) {
        this.data = {};
        if (node.decorators) {
            node.decorators.forEach((d: any) => {
                if (d.arguments.length % 2 !== 0) {
                    throw new Error('Arguments must be [name, value] pairs');
                }
                const args: Record<string, any> = {};
                for (let n = 0; n < d.arguments.length - 1; n = n + 2) {
                    const arg = d.arguments[n];
                    if (arg.$class && arg.$class !== `${ConcertoMetaModel.NAMESPACE}.DecoratorString`) {
                        throw new Error(`Argument names must be strings. Found ${arg.$class}`);
                    }
                    const argValue = d.arguments[n + 1];
                    args[arg.value] = argValue.$class === `${ConcertoMetaModel.NAMESPACE}.DecoratorIdentifier` ? argValue.identifier : argValue.value;
                }
                this.data[d.name] = args;
            });
        }
    }

    /**
     * Returns true is the decorator is present
     */
    hasDecorator(decoratorName: string): boolean {
        return !!this.data[decoratorName];
    }

    /**
     * Get the arguments for a named decorator
     */
    getArguments(decoratorName: string): Record<string, any> | undefined {
        return this.data[decoratorName];
    }

    /**
     * Get the arguments for a named decorator
     */
    getDecoratorValue(decoratorName: string, argumentName: string): any {
        const args = this.getArguments(decoratorName);
        if (args) {
            return args[argumentName];
        }
        return null;
    }
}

export default Decorators;
