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
const { CommonMarkModel } = require('@accordproject/markdown-common');
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

describe('html table deserialization', () => {
    const commonmarkNamespace = CommonMarkModel.NAMESPACE;

    it('deserializes a table caption before the table', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark(`
            <table>
                <caption>Employee Details</caption>
                <thead>
                    <tr><th>Name</th><th>Role</th></tr>
                </thead>
                <tbody>
                    <tr><td>Ada</td><td>Engineer</td></tr>
                </tbody>
            </table>
        `);

        expect(ciceroMarkDom.nodes).toHaveLength(2);
        expect(ciceroMarkDom.nodes[0]).toEqual({
            $class: `${commonmarkNamespace}.Paragraph`,
            nodes: [
                {
                    $class: `${commonmarkNamespace}.Strong`,
                    nodes: [
                        {
                            $class: `${commonmarkNamespace}.Text`,
                            text: 'Employee Details'
                        }
                    ]
                }
            ]
        });
        expect(ciceroMarkDom.nodes[1].$class).toBe(`${commonmarkNamespace}.Table`);
    });

    it('flattens block content in a caption to inline-only Strong children', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark(`
            <table>
                <caption><p>See <em>also</em></p></caption>
                <thead>
                    <tr><th>Name</th></tr>
                </thead>
                <tbody>
                    <tr><td>Ada</td></tr>
                </tbody>
            </table>
        `);

        expect(ciceroMarkDom.nodes).toHaveLength(2);
        const strong = ciceroMarkDom.nodes[0].nodes[0];
        expect(strong.$class).toBe(`${commonmarkNamespace}.Strong`);
        // every child of Strong must be inline (no Paragraph leaked in)
        strong.nodes.forEach(child => {
            expect(child.$class).not.toBe(`${commonmarkNamespace}.Paragraph`);
        });
        expect(strong.nodes).toEqual([
            { $class: `${commonmarkNamespace}.Text`, text: 'See ' },
            {
                $class: `${commonmarkNamespace}.Emph`,
                nodes: [{ $class: `${commonmarkNamespace}.Text`, text: 'also' }]
            }
        ]);
        expect(ciceroMarkDom.nodes[1].$class).toBe(`${commonmarkNamespace}.Table`);
    });

    it('does not leak a caption node when it appears outside a table', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark('<caption>Orphan caption</caption>');

        // the old caption rule produced a node with no $class; ensure none leak
        ciceroMarkDom.nodes.forEach(n => expect(typeof n.$class).toBe('string'));
        expect(ciceroMarkDom.nodes.some(n => n.type === 'caption')).toBe(false);
    });

    it('normalizes whitespace in table cells', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark(`
            <table>
                <tbody>
                    <tr>
                        <td>
                            First
                            Second
                        </td>
                    </tr>
                </tbody>
            </table>
        `);

        const cellNodes = ciceroMarkDom.nodes[0].nodes[0].nodes[0].nodes[0].nodes;
        expect(cellNodes).toEqual([
            {
                $class: `${commonmarkNamespace}.Text`,
                text: 'First Second'
            }
        ]);
    });

    it('promotes tbody rows with header cells to table head when thead is missing', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark(`
            <table>
                <tbody>
                    <tr><th>Name</th><th>Role</th></tr>
                    <tr><td>Ada</td><td>Engineer</td></tr>
                </tbody>
            </table>
        `);

        const table = ciceroMarkDom.nodes[0];
        expect(table.nodes).toHaveLength(2);
        expect(table.nodes[0].$class).toBe(`${commonmarkNamespace}.TableHead`);
        expect(table.nodes[0].nodes[0].nodes.map(cell => cell.$class)).toEqual([
            `${commonmarkNamespace}.HeaderCell`,
            `${commonmarkNamespace}.HeaderCell`
        ]);
        expect(table.nodes[1].$class).toBe(`${commonmarkNamespace}.TableBody`);
        expect(table.nodes[1].nodes).toHaveLength(1);
    });

    it('keeps tables without captions as a single table node', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark(`
            <table>
                <thead>
                    <tr><th>Name</th><th>Role</th></tr>
                </thead>
                <tbody>
                    <tr><td>Ada</td><td>Engineer</td></tr>
                </tbody>
            </table>
        `);

        expect(ciceroMarkDom.nodes).toHaveLength(1);
        expect(ciceroMarkDom.nodes[0].$class).toBe(`${commonmarkNamespace}.Table`);
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
