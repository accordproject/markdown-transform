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

function template_inline_render(name) {
    return function renderDefault(tokens, idx, _options, env, slf) {

        // add a class to the opening tag
        if (tokens[idx].nesting === 1) {
            tokens[idx].attrJoin('class', name + '_inline');
        }

        return slf.renderToken(tokens, idx, _options, env, slf);
    }
}

module.exports = template_inline_render;
