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
import { CommonMarkTransformer } from './CommonMarkTransformer';

let commonMark: CommonMarkTransformer;

expect.extend({
    toMarkdownRoundtrip(markdownText: string) {
        const json1 = commonMark.fromMarkdown(markdownText);
        const newMarkdown = commonMark.toMarkdown(json1);
        const json2 = commonMark.fromMarkdown(newMarkdown);
        const pass = JSON.stringify(json1) === JSON.stringify(json2);

        const message = pass
            ? () =>
                this.utils.matcherHint(`toMarkdownRoundtrip - ${markdownText} -> ${newMarkdown}`, undefined, undefined, undefined) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(json1)}\n` +
                `Received: ${this.utils.printReceived(json2)}`
            : () => {
                const diffString = diff(json1, json2, {
                    expand: true,
                });
                return (
                    this.utils.matcherHint(`toMarkdownRoundtrip - ${JSON.stringify(markdownText)} -> ${JSON.stringify(newMarkdown)}`, undefined, undefined, undefined) +
                    '\n\n' +
                    (diffString && diffString.includes('- Expect')
                        ? `Difference:\n\n${diffString}`
                        : `Expected: ${this.utils.printExpected(json1)}\n` +
                        `Received: ${this.utils.printReceived(json2)}`)
                );
            };

        return { actual: markdownText, message, pass };
    },
});

beforeAll(() => {
    commonMark = new CommonMarkTransformer();
});

/**
 * Get the name and contents of all markdown test files
 */
function getMarkdownFiles(): [string, string][] {
    const result: [string, string][] = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function (file) {
        if (file.endsWith('.md')) {
            const contents = fs.readFileSync(__dirname + '/../test/data/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('markdown', () => {
    getMarkdownFiles().forEach(([file, markdownText]) => {
        it(`converts ${file} to concerto JSON`, () => {
            const json = commonMark.fromMarkdown(markdownText);
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});

describe('to plain text', () => {
    getMarkdownFiles().forEach(([file, markdownText]) => {
        it(file, () => {
            const json = commonMark.fromMarkdown(markdownText);
            const unformat = commonMark.removeFormatting(json);
            const md = commonMark.toMarkdown(unformat);
            expect(md).toMatchSnapshot();
        });
    });
});

describe('readme', () => {
    it('transformer should have a serializer', () => {
        expect(commonMark.getSerializer()).toBeTruthy();
    });

    it('converts example1 to CommonMark DOM', () => {
        const json = commonMark.fromMarkdown('# Heading\n\nThis is some `code`.\n\nFin.');
        expect(json).toMatchSnapshot();
        json.nodes[0].nodes[0].text = 'My New Heading';
        const newMarkdown = commonMark.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });
});

describe('acceptance', () => {
    it('converts acceptance to CommonMark DOM', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/acceptance.md', 'utf8');
        const json = commonMark.fromMarkdown(markdownText);
        expect(json).toMatchSnapshot();
        const newMarkdown = commonMark.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });
});
