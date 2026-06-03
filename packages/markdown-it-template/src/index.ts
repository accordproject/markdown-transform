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

import { template_inline } from './template_inline';
import { template_inline_render } from './template_inline_render';
import { template_block } from './template_block';
import { template_block_render } from './template_block_render';

/**
 * Get an attribute value
 */
function getAttr(attrs: any[], name: string, def: any): string | null {
    const startAttrs = attrs.filter((x) => x[0] === name);
    if (startAttrs[0]) {
        return '' + startAttrs[0][1];
    } else {
        return def;
    }
}

const variable_inline = function (tokens: any[], idx: number /*, options, env */): string {
    const token = tokens[idx];
    const name = getAttr(token.attrs, 'name', null);
    const format = getAttr(token.attrs, 'format', null);
    let attrs = `name="${name}"`;
    if (format) {
        attrs += ` format="${format}"`;
    }
    return `<span class="variable" ${attrs}>${name}</span>`;
};

const this_inline = function (): string {
    return `<span class="variable" name="this">this</span>`;
};

const else_inline = function (): string {
    return `</span><span class="else_inline">`;
};

const formula_inline = function (tokens: any[], idx: number): string {
    const token = tokens[idx];
    return `<span class="formula">${token.content}</span>`;
};

function template_plugin(md: any): void {
    md.inline.ruler.before('emphasis', 'template', template_inline);
    md.renderer.rules['inline_block_if_open'] = template_inline_render('if');
    md.renderer.rules['inline_block_if_close'] = template_inline_render('if');
    md.renderer.rules['inline_block_optional_close'] = template_inline_render('optional');
    md.renderer.rules['inline_block_optional_open'] = template_inline_render('optional');
    md.renderer.rules['inline_block_with_open'] = template_inline_render('with');
    md.renderer.rules['inline_block_with_close'] = template_inline_render('with');
    md.renderer.rules['inline_block_join_open'] = template_inline_render('join');
    md.renderer.rules['inline_block_join_close'] = template_inline_render('join');
    md.renderer.rules['inline_block_else'] = else_inline;
    md.renderer.rules['variable'] = variable_inline;
    md.renderer.rules['this'] = this_inline;
    md.renderer.rules['formula'] = formula_inline;

    md.block.ruler.before('fence', 'template_block', template_block, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.renderer.rules['block_clause_open'] = template_block_render('clause');
    md.renderer.rules['block_clause_close'] = template_block_render('clause');
    md.renderer.rules['block_ulist_open'] = template_block_render('ulist');
    md.renderer.rules['block_ulist_close'] = template_block_render('ulist');
    md.renderer.rules['block_olist_open'] = template_block_render('olist');
    md.renderer.rules['block_olist_close'] = template_block_render('olist');
}

export = template_plugin;
