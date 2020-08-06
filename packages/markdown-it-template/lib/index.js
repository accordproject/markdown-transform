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

const template_inline = require('./template_inline');
const template_inline_render = require('./template_inline_render');
const template_block = require('./template_block');
const template_block_render = require('./template_block_render');

/**
 * Get an attribute value
 *
 * @param {*} attrs open ordered list attributes
 * @param {string} name attribute name
 * @param {*} def a default value
 * @returns {string} the initial index
 */
function getAttr(attrs,name,def) {
    const startAttrs = attrs.filter((x) => x[0] === name);
    if (startAttrs[0]) {
        return '' + startAttrs[0][1];
    } else {
        return def;
    }
}

const variable_inline = function (tokens, idx /*, options, env */) {
  const token = tokens[idx];
  const name = getAttr(token.attrs,'name',null);
  const format = getAttr(token.attrs,'format',null);
  let attrs = `name="${name}"`;
  if(format) {
    attrs += ` format="${format}"`;
  }
  return `<span class="variable" ${attrs}>${name}</span>`;
};

const else_inline = function (tokens, idx /*, options, env */) {
  return `</span><span class="else">`;
};

const formula_inline = function (tokens, idx /*, options, env */) {
  const token = tokens[idx];
  return `<span class="formula">${token.content}</span>`;
};

function template_plugin(md) {
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
    md.renderer.rules['formula'] = formula_inline;

    md.block.ruler.before('fence', 'template_block', template_block, {
        alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
    });
    md.renderer.rules['block_clause_open'] = template_block_render('clause');
    md.renderer.rules['block_clause_close'] = template_block_render('clause');
    md.renderer.rules['block_ulist_open'] = template_block_render('ulist');
    md.renderer.rules['block_ulist_close'] = template_block_render('ulist');
    md.renderer.rules['block_olist_open'] = template_block_render('olist');
    md.renderer.rules['block_olist_close'] = template_block_render('olist');
}

module.exports = template_plugin;
