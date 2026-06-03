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
    toMarkdownRoundtrip(markdownText: string) {
        const json1 = ciceroMarkTransformer.fromMarkdown(markdownText);
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json1);
        const json2 = ciceroMarkTransformer.fromMarkdown(newMarkdown);
        const pass = JSON.stringify(json1) === JSON.stringify(json2);

        const message = pass
            ? () =>
                this.utils.matcherHint(`toMarkdownRoundtrip - ${markdownText} -> ${newMarkdown}`, undefined, undefined, undefined) +
                '\n\n' +
                `Expected: ${this.utils.printExpected(json1)}\n` +
                `Received: ${this.utils.printReceived(json2)}`
            : () => {
                const diffString = diff(json1, json2, { expand: true });
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
    ciceroMarkTransformer = new CiceroMarkTransformer();
});

interface SpecExample {
    markdown: string;
    html: string;
    section: string;
    number: number;
}

function extractSpecTests(testfile: string): SpecExample[] {
    const data = fs.readFileSync(testfile, 'utf8');
    const examples: SpecExample[] = [];
    let current_section = '';
    let example_number = 0;
    const tests = data
        .replace(/\r\n?/g, '\n')
        .replace(/^<!-- END TESTS -->(.|[\n])*/m, '');

    tests.replace(/^`{32} example\n([\s\S]*?)^\.\n([\s\S]*?)^`{32}$|^#{1,6} *(.*)$/gm,
        function (_, markdownSubmatch, htmlSubmatch, sectionSubmatch) {
            if (sectionSubmatch) {
                current_section = sectionSubmatch;
            } else {
                example_number++;
                examples.push({ markdown: markdownSubmatch, html: htmlSubmatch, section: current_section, number: example_number });
            }
            return '';
        });
    return examples;
}

function getMarkdownSpecFiles(): [string, string][] {
    const result: [string, string][] = [];
    const specExamples = extractSpecTests(__dirname + '/../test/data/spec.txt');
    specExamples.forEach(function (example) {
        result.push([`${example.section}-${example.number}`, example.markdown]);
    });

    return result;
}

describe('markdown-spec', () => {
    getMarkdownSpecFiles().forEach(([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const json = ciceroMarkTransformer.fromMarkdown(markdownText);
            expect(json).toMatchSnapshot();
        });

        it.skip(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});
