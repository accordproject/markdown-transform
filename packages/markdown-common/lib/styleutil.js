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

const Parsimmon = require('parsimmon');
const string = Parsimmon.string;
const regex = Parsimmon.regex;
const seq = Parsimmon.seq;

const NS_PREFIX_CommonMarkModel = require('./externalModels/CommonMarkModel').NS_PREFIX_CommonMarkModel;

const ignore = regex(/\s*/m);
const lexeme = (p) => p.skip(ignore);
const startOfLine = lexeme(regex(/\n*/));
const property = seq(
    lexeme(regex(/([^:])+/i)), lexeme(string(':'))
).map((v) => v[0]);
const value = seq(
    lexeme(regex(/([^;])+/i)), lexeme(regex(/(;)?/))
).map((v) => v[0]);

const cfs = startOfLine.then(
    seq(property, value).many()
).map((v) => {
    return v.reduce((r, d) => {
        let key = d[0];
        let val = d[1];
        switch (key) {
        case 'z-index': val = parseInt(val); break;
        default: break;
        }
        r[key] = val;
        return r;
    }, {});
});

/**
 * Parse a HTML style attribute
 * @param {string} src - the style string
 * @return {*} the styles
 */
function parseStyle(src) {
    const r = cfs.parse(src);
    if (!r || !r.status) {
        return undefined;
    }

    const style = r.value;

    const styleNode = {
        $class: NS_PREFIX_CommonMarkModel + 'Style',
    };
    if (style['text-align']) {
        styleNode.align = style['text-align'];
    }
    if (style.width && parseFloat(style.width)) {
        styleNode.width = parseFloat(style.width);
    }
    if (style['line-height'] && parseFloat(style['line-height'])) {
        styleNode.lineHeight = parseFloat(style['line-height']);
    }
    if (style['font-size'] && parseFloat(style['font-size'])) {
        styleNode.fontSize = parseFloat(style['font-size']);
    }
    if (style.color) {
        styleNode.color = style.color;
    }
    if (style['background-color']) {
        styleNode.backgroundColor = style['background-color'];
    }
    if (Object.keys(styleNode).length === 1) {
        return undefined;
    }
    return styleNode;
}

/**
 * Print a style object into a CSS-conformant string
 * @param {*} style - the style object
 * @return {string} the CSS style string
 */
function printStyle(style) {
    let result = '';
    for (const key in style) {
        if (key === 'align') {
            result += `text-align:${style[key]};`;
        }
        if (key === 'width') {
            result += `width:${style[key]};`;
        }
        if (key === 'lineHeight') {
            result += `line-height:${style[key]};`;
        }
        if (key === 'fontSize') {
            result += `font-size:${style[key]};`;
        }
        if (key === 'color') {
            result += `color:${style[key]};`;
        }
        if (key === 'backgroundColor') {
            result += `background-color:${style[key]};`;
        }
    }
    return `{style="${result}"}`;
}

module.exports = { parseStyle, printStyle };
