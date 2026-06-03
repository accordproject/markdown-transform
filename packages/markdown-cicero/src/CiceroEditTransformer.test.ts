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
import { diff } from 'jest-diff';
import { CiceroMarkTransformer } from './CiceroMarkTransformer';

let ciceroMarkTransformer: CiceroMarkTransformer;

expect.extend({
    toMarkdownRoundtrip(ciceroEditText: string, markdownText: string, _testName?: string) {
        const jsonEdit = ciceroMarkTransformer.fromCiceroEdit(ciceroEditText);
        const jsonEditUnwrapped = ciceroMarkTransformer.toCiceroMarkUnwrapped(jsonEdit);
        const newMarkdownEdit = ciceroMarkTransformer.toMarkdownCicero(jsonEditUnwrapped);
        const jsonMark = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        const json1 = ciceroMarkTransformer.fromMarkdownCicero(newMarkdownEdit);
        const json2 = jsonMark;
        const pass = JSON.stringify(json1) === JSON.stringify(json2);

        const message = pass
            ? () =>
                this.utils.matcherHint(`toMarkdownRoundtrip - ${newMarkdownEdit} <-> ${markdownText}`, undefined, undefined, undefined) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(json1)}\n` +
                `Received: ${this.utils.printReceived(json2)}`
            : () => {
                const diffString = diff(json1, json2, { expand: true });
                return (
                    this.utils.matcherHint(`toMarkdownRoundtrip - ${JSON.stringify(newMarkdownEdit)}`, undefined, undefined, undefined) +
                    '\n\n' +
                    (diffString && diffString.includes('- Expect')
                        ? `Difference:\n\n${diffString}`
                        : `Expected: ${this.utils.printExpected(json1)}\n` +
                        `Received: ${this.utils.printReceived(json2)}`)
                );
            };

        return { actual: ciceroEditText, message, pass };
    },
});

beforeAll(() => {
    ciceroMarkTransformer = new CiceroMarkTransformer();
});

function getMarkdownFiles(): [string, string, string][] {
    const result: [string, string, string][] = [];
    const files = fs.readdirSync(__dirname + '/../test/data/ciceroedit');

    files.forEach(function (file) {
        if (file.endsWith('.md')) {
            const contentsEdit = fs.readFileSync(__dirname + '/../test/data/ciceroedit/' + file, 'utf8');
            const contentsMark = fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8');
            result.push([file, contentsEdit, contentsMark]);
        }
    });

    return result;
}

describe('markdown', () => {
    getMarkdownFiles().forEach(([file, ciceroEditText, markdownText]) => {
        it(`converts ${file} to ciceromark`, () => {
            const json = ciceroMarkTransformer.fromCiceroEdit(ciceroEditText);
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(ciceroEditText).toMarkdownRoundtrip(markdownText, file);
        });
    });
});

describe('acceptance', () => {
    it('converts acceptance to CommonMark DOM', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromCiceroEdit(markdownText);
        expect(json).toMatchSnapshot();
        const jsonUnwrapped = ciceroMarkTransformer.toCiceroMarkUnwrapped(json);
        const newMarkdown = ciceroMarkTransformer.toMarkdownCicero(jsonUnwrapped);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance to markdown string (unquoted)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromCiceroEdit(markdownText);
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json, { unquoteVariables: true });
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance-formula to markdown string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromCiceroEdit(markdownText);
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance-formula to markdown string (unquoted)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromCiceroEdit(markdownText);
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json, { unquoteVariables: true });
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance-notclause2 to markdown string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-notclause2.md', 'utf8');
        const json = ciceroMarkTransformer.fromCiceroEdit(markdownText);
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json, { unquoteVariables: true });
        expect(newMarkdown).toMatchSnapshot();
    });
});
