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

export function cicero_block_render(name: string) {
    return function renderDefault(tokens: any[], idx: number, _options: any, env: any, slf: any): string {
        if (tokens[idx].nesting === 1) {
            tokens[idx].attrJoin('class', name + '_block');
        }
        return slf.renderToken(tokens, idx, _options, env, slf);
    };
}

export default cicero_block_render;
