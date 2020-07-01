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
    toMarkdownRoundtrip(ciceroEditText,markdownText,testName) {
        const jsonEdit = ciceroMarkTransformer.fromMarkdown(ciceroEditText, 'json', { ciceroEdit:true });
        const newMarkdownEdit = ciceroMarkTransformer.toMarkdown(jsonEdit);
        const jsonMark = ciceroMarkTransformer.fromMarkdown(markdownText, 'json');
        const newMarkdownMark = ciceroMarkTransformer.toMarkdown(jsonMark);
        const json1 = ciceroMarkTransformer.fromMarkdown(newMarkdownEdit, 'json');
        const json2 = jsonMark;
        const pass = JSON.stringify(json1) === JSON.stringify(json2);

        const message = pass
            ? () =>
                this.utils.matcherHint(`toMarkdownRoundtrip - ${newMarkdownEdit} <-> ${newMarkdownMark}`, undefined, undefined, undefined) +
          '\n\n' +
          `Expected: ${this.utils.printExpected(json1)}\n` +
          `Received: ${this.utils.printReceived(json2)}`
            : () => {
                const diffString = diff(json1, json2, {
                    expand: true,
                });
                return (
                    this.utils.matcherHint(`toMarkdownRoundtrip - ${JSON.stringify(newMarkdownEdit)} -> ${JSON.stringify(newMarkdownMark)}`, undefined, undefined, undefined) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
                ? `Difference:\n\n${diffString}`
                : `Expected: ${this.utils.printExpected(json1)}\n` +
                `Received: ${this.utils.printReceived(json2)}`)
                );
            };

        return {actual: ciceroEditText, message, pass};
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
    const files = fs.readdirSync(__dirname + '/../test/data/ciceroedit');

    files.forEach(function(file) {
        if(file.endsWith('.md')) {
            let contentsEdit = fs.readFileSync(__dirname + '/../test/data/ciceroedit/' + file, 'utf8');
            let contentsMark = fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8');
            result.push([file, contentsEdit, contentsMark]);
        }
    });

    return result;
}

describe('markdown', () => {
    getMarkdownFiles().forEach( ([file, ciceroEditText, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const json = ciceroMarkTransformer.fromMarkdown(ciceroEditText, 'json', { ciceroEdit:true });
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(ciceroEditText).toMarkdownRoundtrip(markdownText,file);
        });
    });
});

describe('acceptance', () => {
    it('converts acceptance to CommonMark DOM', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit:true });
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit:true });
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json.nodes[2]).text;
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string (removeFormatting)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formatted.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit:true });
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { removeFormatting: true });
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to CommonMark string (no quoteVariables)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit:true });
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { quoteVariables: false });
        expect(newMarkdown).toMatchSnapshot();

    });

    it('converts acceptance clause content to CommonMark string (no quoteVariables 2)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit: true, quoteVariables: false });
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json');
        expect(newMarkdown).toMatchSnapshot();

    });

    it('converts acceptance clause content to CommonMark string (removeFormatting & no quoteVariables)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceroedit/acceptance-formula.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdown(markdownText, 'json', { ciceroEdit:true });
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toCommonMark(json, 'json', { removeFormatting: true, quoteVariables: false });
        expect(newMarkdown).toMatchSnapshot();
    });
});
