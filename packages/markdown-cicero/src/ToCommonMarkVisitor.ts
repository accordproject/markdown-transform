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

import { CommonMarkModel } from '@accordproject/markdown-common';

/**
 * Utility: flattening array of arrays
 */
function flatten<T>(arr: T[][]): T[] {
    return arr.reduce<T[]>((acc, val) => acc.concat(val), []);
}

/**
 * Converts a CiceroMark DOM to a CommonMark DOM
 */
export class ToCommonMarkVisitor {
    options: any;

    constructor(options?: any) {
        this.options = options;
    }

    /**
     * Visits a sub-tree and return the CommonMark DOM
     */
    static visitChildren(visitor: ToCommonMarkVisitor, thing: any, parameters: any): void {
        if (thing.nodes) {
            const result = thing.nodes.map((node: any) => node.accept(visitor, parameters));
            thing.nodes = flatten(result);
        }
    }

    /**
     * Visit a node
     */
    visit(thing: any, parameters: any): any[] {
        const thingType = thing.getType();
        switch (thingType) {
            case 'Clause': {
                ToCommonMarkVisitor.visitChildren(this, thing, parameters);
                return thing.nodes;
            }
            case 'Formula': {
                thing.$classDeclaration = parameters.modelManager.getType(`${CommonMarkModel.NAMESPACE}.Text`);
                thing.text = decodeURIComponent(thing.value);

                delete thing.elementType;
                delete thing.name;
                delete thing.value;
                delete thing.code;
                delete thing.dependencies;
                break;
            }
            default:
                ToCommonMarkVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

export default ToCommonMarkVisitor;
