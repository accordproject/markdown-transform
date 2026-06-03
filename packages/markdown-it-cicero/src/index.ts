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

import { cicero_inline } from './cicero_inline';
import { cicero_block } from './cicero_block';
import { cicero_block_render } from './cicero_block_render';

const formula_inline = function (tokens: any[], idx: number): string {
    const token = tokens[idx];
    return `<span class="formula">${token.content}</span>`;
};

function cicero_plugin(md: any): void {
    md.renderer.rules['formula'] = formula_inline;

    md.inline.ruler.before('emphasis', 'cicero', cicero_inline);

    md.block.ruler.before('fence', 'cicero_block', cicero_block, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.renderer.rules['block_clause_open'] = cicero_block_render('clause');
    md.renderer.rules['block_clause_close'] = cicero_block_render('clause');
}

export = cicero_plugin;
