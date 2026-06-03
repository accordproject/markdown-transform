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
 * Converts a CiceroMark DOM to a CiceroMark unwrapped DOM
 */
export class ToCiceroMarkUnwrappedVisitor {
    /**
     * Visits a sub-tree and return the CommonMark DOM
     */
    static visitChildren(visitor: ToCiceroMarkUnwrappedVisitor, thing: any, parameters: any): void {
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
            case 'ListBlock': {
                ToCiceroMarkUnwrappedVisitor.visitChildren(this, thing, parameters);

                const ciceroMarkTag = `${CommonMarkModel.NAMESPACE}.List`;
                thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);

                delete thing.name;
                delete thing.elementType;
                delete thing.decorators;
                break;
            }
            case 'Variable':
            case 'EnumVariable':
            case 'FormattedVariable': {
                thing.$classDeclaration = parameters.modelManager.getType(`${CommonMarkModel.NAMESPACE}.Text`);
                thing.text = decodeURIComponent(thing.value);

                delete thing.elementType;
                delete thing.decorators;
                delete thing.name;
                delete thing.value;
                delete thing.format;
                delete thing.enumValues;
                delete thing.identifiedBy;
                break;
            }
            case 'Conditional':
            case 'Optional': {
                thing.$classDeclaration = parameters.modelManager.getType(`${CommonMarkModel.NAMESPACE}.Text`);
                ToCiceroMarkUnwrappedVisitor.visitChildren(this, thing, parameters);
                return thing.nodes;
            }
            default:
                ToCiceroMarkUnwrappedVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

export default ToCiceroMarkUnwrappedVisitor;
