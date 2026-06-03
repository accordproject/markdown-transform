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

import * as fs from 'fs';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { CommonMarkModel } from '@accordproject/markdown-common';
import { HtmlTransformer } from './HtmlTransformer';

let htmlTransformer: HtmlTransformer;
let ciceroTransformer: CiceroMarkTransformer;

function normalizeNLs(input: string): string {
    return input.replace(/\r/gm, '');
}

beforeAll(() => {
    htmlTransformer = new HtmlTransformer();
    ciceroTransformer = new CiceroMarkTransformer();
});

function getMarkdownFiles(): [string, string][] {
    const result: [string, string][] = [];
    const files = fs.readdirSync(__dirname + '/../test/data/markdown');

    files.forEach(function (file) {
        if (file.endsWith('.md')) {
            const contents = fs.readFileSync(__dirname + '/../test/data/markdown/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('markdown <-> html', () => {
    getMarkdownFiles().forEach(([file, markdownText]) => {
        it(`converts ${file} to html`, () => {
            const json = ciceroTransformer.fromMarkdown(markdownText);
            expect(json).toMatchSnapshot();
            const html = htmlTransformer.toHtml(json);
            expect(html).toMatchSnapshot();
            const ciceroMarkDom = htmlTransformer.toCiceroMark(html);
            expect(ciceroMarkDom).toEqual(json);
        });
    });

    it('converts unwrapped <li> to html', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark('<p>Hello</p><li>list item</li><p>World.</p>');
        expect(ciceroMarkDom).toMatchSnapshot();
        const md = ciceroTransformer.toMarkdown(ciceroMarkDom);
        expect(md).toMatchSnapshot();
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
                    nodes: [{ $class: `${commonmarkNamespace}.Text`, text: 'Employee Details' }],
                },
            ],
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
        strong.nodes.forEach((child: any) => {
            expect(child.$class).not.toBe(`${commonmarkNamespace}.Paragraph`);
        });
        expect(strong.nodes).toEqual([
            { $class: `${commonmarkNamespace}.Text`, text: 'See ' },
            {
                $class: `${commonmarkNamespace}.Emph`,
                nodes: [{ $class: `${commonmarkNamespace}.Text`, text: 'also' }],
            },
        ]);
        expect(ciceroMarkDom.nodes[1].$class).toBe(`${commonmarkNamespace}.Table`);
    });

    it('does not leak a caption node when it appears outside a table', () => {
        const ciceroMarkDom = htmlTransformer.toCiceroMark('<caption>Orphan caption</caption>');
        ciceroMarkDom.nodes.forEach((n: any) => expect(typeof n.$class).toBe('string'));
        expect(ciceroMarkDom.nodes.some((n: any) => n.type === 'caption')).toBe(false);
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
        expect(cellNodes).toEqual([{ $class: `${commonmarkNamespace}.Text`, text: 'First Second' }]);
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
        expect(table.nodes[0].nodes[0].nodes.map((cell: any) => cell.$class)).toEqual([
            `${commonmarkNamespace}.HeaderCell`,
            `${commonmarkNamespace}.HeaderCell`,
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

function getCiceroMarkFiles(): [string, string][] {
    const result: [string, string][] = [];
    const files = fs.readdirSync(__dirname + '/../test/data/ciceromark');

    files.forEach(function (file) {
        if (file.endsWith('.json')) {
            const contents = normalizeNLs(fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8'));
            result.push([file, contents]);
        }
    });

    return result;
}

describe('ciceromark <-> html', () => {
    getCiceroMarkFiles().forEach(([file, jsonText]) => {
        it(`converts ${file} to and from CiceroMark`, () => {
            const value = JSON.parse(jsonText);
            const html = htmlTransformer.toHtml(value);

            expect(html).toMatchSnapshot();

            const expectedHtml = normalizeNLs(fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file.replace(/.json$/, '.html'), 'utf8'));
            expect(expectedHtml).toMatchSnapshot();

            const expectedCiceroMarkValue = htmlTransformer.toCiceroMark(expectedHtml);
            expect(expectedCiceroMarkValue).toMatchSnapshot();

            expect(html).toEqual(expectedHtml);
            expect(expectedCiceroMarkValue).toEqual(value);
        });
    });
});

describe('renderVariableValue - relationship variables', () => {
    it('extracts identifier from a quoted resource URI value', () => {
        const ciceroMarkJson = {
            '$class': 'org.accordproject.commonmark@0.5.0.Document',
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': 'org.accordproject.commonmark@0.5.0.Paragraph',
                'nodes': [{
                    '$class': 'org.accordproject.ciceromark@0.6.0.Variable',
                    'value': '"resource:org.accordproject.organization@0.2.0.Organization#Party A"',
                    'identifiedBy': 'identifier',
                    'name': 'buyer',
                    'elementType': 'org.accordproject.organization@0.2.0.Organization',
                }],
            }],
        };
        const html = htmlTransformer.toHtml(ciceroMarkJson);
        expect(html).toContain('>Party A<');
        expect(html).not.toContain('resource:');
    });

    it('leaves primitive variable values unchanged', () => {
        const ciceroMarkJson = {
            '$class': 'org.accordproject.commonmark@0.5.0.Document',
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': 'org.accordproject.commonmark@0.5.0.Paragraph',
                'nodes': [{
                    '$class': 'org.accordproject.ciceromark@0.6.0.Variable',
                    'value': '"Widgets"',
                    'name': 'deliverable',
                    'elementType': 'String',
                }],
            }],
        };
        const html = htmlTransformer.toHtml(ciceroMarkJson);
        expect(html).toContain('>"Widgets"<');
    });

    it('handles bare (unquoted) resource URI values', () => {
        const ciceroMarkJson = {
            '$class': 'org.accordproject.commonmark@0.5.0.Document',
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': 'org.accordproject.commonmark@0.5.0.Paragraph',
                'nodes': [{
                    '$class': 'org.accordproject.ciceromark@0.6.0.Variable',
                    'value': 'resource:org.accordproject.organization@0.2.0.Organization#Party B',
                    'identifiedBy': 'identifier',
                    'name': 'seller',
                    'elementType': 'org.accordproject.organization@0.2.0.Organization',
                }],
            }],
        };
        const html = htmlTransformer.toHtml(ciceroMarkJson);
        expect(html).toContain('>Party B<');
        expect(html).not.toContain('resource:');
    });
});
