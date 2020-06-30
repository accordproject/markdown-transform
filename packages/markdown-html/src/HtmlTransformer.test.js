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

// @ts-nocheck
/* eslint-disable no-undef */
'use strict';

const fs = require('fs');
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const HtmlTransformer = require('./HtmlTransformer');

let htmlTransformer = null;
let ciceroTransformer = null;

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text for the clause
 * @return {string} - the normalized text for the clause
 */
function normalizeNLs(input) {
    // we replace all \r and \n with \n
    let text =  input.replace(/\r/gm,'');
    return text;
}

// @ts-ignore
beforeAll(() => {
    htmlTransformer = new HtmlTransformer();
    ciceroTransformer = new CiceroMarkTransformer();
});

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/markdown');

    files.forEach(function(file) {
        if(file.endsWith('.md')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/markdown/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('markdown <-> html', () => {
    getMarkdownFiles().forEach(([file, markdownText], i) => {
        it(`converts ${file} to html`, () => {
            const json = ciceroTransformer.fromMarkdown(markdownText, 'json');
            expect(json).toMatchSnapshot(); // (1)
            const html = htmlTransformer.toHtml(json);
            expect(html).toMatchSnapshot(); // (2)
            const ciceroMarkDom = htmlTransformer.toCiceroMark(html, 'json');
            expect(ciceroMarkDom).toEqual(json);
        });
    });

    it('converts unwrapped <li> to html', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark('<p>Hello</p><li>list item</li><p>World.</p>', 'json');
        expect(ciceroMarkDom).toMatchSnapshot(); // (1)
        const md = ciceroTransformer.toMarkdown(ciceroMarkDom);
        expect(md).toMatchSnapshot(); // (2)
    });
});

/**
 * Get the name and contents of all ciceromark test files
 * @returns {*} an array of name/contents tuples
 */
function getCiceroMarkFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/ciceromark');

    files.forEach(function(file) {
        if(file.endsWith('.json')) {
            let contents = normalizeNLs(fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8'));
            result.push([file, contents]);
        }
    });

    return result;
}

describe('ciceromark <-> html', () => {
    getCiceroMarkFiles().forEach( ([file, jsonText], index) => {
        it(`converts ${file} to and from CiceroMark`, () => {
            const value = JSON.parse(jsonText);
            const html = htmlTransformer.toHtml(value);

            // check no changes to html
            expect(html).toMatchSnapshot(); // (1)

            // load expected html
            const expectedHtml = normalizeNLs(fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file.replace(/.json$/,'.html'), 'utf8'));
            expect(expectedHtml).toMatchSnapshot(); // (2)

            // convert the expected html and compare
            const expectedCiceroMarkValue = htmlTransformer.toCiceroMark(expectedHtml);
            expect(expectedCiceroMarkValue).toMatchSnapshot(); // (3)

            // check that html created from ciceromark and from the expected html is the same
            expect(html).toEqual(expectedHtml);

            // check roundtrip
            expect(expectedCiceroMarkValue).toEqual(value);
        });
    });
});
