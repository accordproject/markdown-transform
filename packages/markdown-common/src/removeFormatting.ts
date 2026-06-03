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

import { Stack } from './Stack';
import * as CommonMarkModel from './externalModels/CommonMarkModel';

/**
 * Maps the keys in an object
 */
function mapObject(obj: any, stack: Stack): void {
    switch (obj.$class) {
        // remove these, visit children
        case `${CommonMarkModel.NAMESPACE}.Emph`:
        case `${CommonMarkModel.NAMESPACE}.Strong`:
        case `${CommonMarkModel.NAMESPACE}.Document`:
        case `${CommonMarkModel.NAMESPACE}.BlockQuote`:
            obj.nodes.forEach((element: any) => {
                mapObject(element, stack);
            });
            break;
        // wrap in a para and process child nodes
        case `${CommonMarkModel.NAMESPACE}.Paragraph`:
        case `${CommonMarkModel.NAMESPACE}.Heading`: {
            stack.push({
                $class: `${CommonMarkModel.NAMESPACE}.Paragraph`,
                nodes: [],
            });
            if (obj.nodes) {
                obj.nodes.forEach((element: any) => {
                    mapObject(element, stack);
                });
            }
            stack.pop();
            break;
        }
        // wrap in a para and grab text
        case `${CommonMarkModel.NAMESPACE}.CodeBlock`:
        case `${CommonMarkModel.NAMESPACE}.HtmlBlock`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Paragraph`,
                nodes: [
                    {
                        $class: `${CommonMarkModel.NAMESPACE}.Text`,
                        text: obj.text,
                    },
                ],
            });
            break;
        // inline text
        case `${CommonMarkModel.NAMESPACE}.Code`:
        case `${CommonMarkModel.NAMESPACE}.HtmlInline`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Text`,
                text: obj.text,
            });
            break;
        // get destination
        case `${CommonMarkModel.NAMESPACE}.Link`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Text`,
                text: obj.destination,
            });
            break;
        // get title
        case `${CommonMarkModel.NAMESPACE}.Image`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Text`,
                text: obj.title,
            });
            break;
        // do not insert a \ for linebreaks
        case `${CommonMarkModel.NAMESPACE}.Linebreak`:
            stack.append({
                $class: `${CommonMarkModel.NAMESPACE}.Text`,
                text: '\n',
            });
            break;
        // copy
        default:
            stack.append(obj);
            break;
    }
}

/**
 * Removes rich text formatting nodes.
 */
export function removeFormatting(obj: any): any {
    const root = {
        $class: `${CommonMarkModel.NAMESPACE}.Document`,
        xmlns: obj.xmlns,
        nodes: [],
    };
    const stack = new Stack();
    stack.push(root, false);
    mapObject(obj, stack);
    return root;
}

export default removeFormatting;
