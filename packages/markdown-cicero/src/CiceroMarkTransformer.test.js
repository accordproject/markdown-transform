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
const diff = require('jest-diff');

const CiceroMarkTransformer = require('./CiceroMarkTransformer');

// eslint-disable-next-line no-unused-vars
let ciceroMarkTransformer = null;

expect.extend({
    toMarkdownRoundtrip(markdownText) {
        const json1 = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json1);
        const json2 = ciceroMarkTransformer.fromMarkdown(newMarkdown, 'json');
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

        return {actual: markdownText, message, pass};
    },
});

beforeAll(() => {
    ciceroMarkTransformer = new CiceroMarkTransformer();
});

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/ciceromark');

    files.forEach(function(file) {
        if(file.endsWith('.md')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('markdown', () => {
    getMarkdownFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});

describe('acceptance', () => {
    it('converts acceptance to CommonMark DOM', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json.nodes[2]).text;
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string (removeFormatting)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance-formatted.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { removeFormatting: true });
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string (no quoteVariables)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { quoteVariables: false });
        expect(newMarkdown).toMatchSnapshot();

    });

    it('converts acceptance clause content to CommonMark string (no quoteVariables 2)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { quoteVariables: false });
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json');
        expect(newMarkdown).toMatchSnapshot();

    });

    it('converts acceptance clause content to CommonMark string (removeFormatting & no quoteVariables)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { removeFormatting: true, quoteVariables: false });
        expect(newMarkdown).toMatchSnapshot();
    });
});
