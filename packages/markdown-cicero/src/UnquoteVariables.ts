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

import { Stack, CiceroMarkModel, CommonMarkModel } from '@accordproject/markdown-common';

/**
 * Maps the keys in an object
 */
function mapObject(obj: any, stack: Stack): void {
    switch (obj.$class) {
        case `${CiceroMarkModel.NAMESPACE}.Formula`:
        case `${CiceroMarkModel.NAMESPACE}.Variable`:
        case `${CiceroMarkModel.NAMESPACE}.FormattedVariable`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Text`,
                text: obj.value.replace(/^"/, '').replace(/"$/, ''),
            });
            break;

        case `${CommonMarkModel.NAMESPACE}.Document`:
            obj.nodes.forEach((element: any) => {
                mapObject(element, stack);
            });
            break;

        default:
            if (obj.nodes) {
                const resObj = Object.assign({}, obj);
                resObj.nodes = [];
                stack.push(resObj);
                obj.nodes.forEach((element: any) => {
                    mapObject(element, stack);
                });
                stack.pop();
            } else {
                stack.append(obj);
            }
            break;
    }
}

/**
 * Replaces variable and formulas with text nodes
 */
export function unquoteVariables(input: any): any {
    const root = {
        $class: `${CommonMarkModel.NAMESPACE}.Document`,
        xmlns: input.xmlns,
        nodes: [],
    };
    const stack = new Stack();
    stack.push(root, false);
    mapObject(input, stack);
    return root;
}

export default unquoteVariables;
