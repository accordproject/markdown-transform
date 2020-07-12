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
        const json1 = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        const newMarkdown = ciceroMarkTransformer.toMarkdownCicero(json1);
        const json2 = ciceroMarkTransformer.fromMarkdownCicero(newMarkdown);
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
    it('transformer should have a serializer', () => {
        expect(ciceroMarkTransformer.getSerializer()).toBeTruthy();
    });

    getMarkdownFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText, 'json');
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});

describe('acceptance', () => {
    it('converts acceptance to markdown string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance to markdown string (unquoted)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json,{unquoteVariables:true});
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance to markdown string (plaintext)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdown(json,{removeFormatting:true});
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance to cicero markdown string', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const newMarkdown = ciceroMarkTransformer.toMarkdownCicero(json);
        expect(newMarkdown).toMatchSnapshot();
    });

    it('converts acceptance clause content to markdown string (getClauseText)', () => {
        const markdownText = fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8');
        const json = ciceroMarkTransformer.fromMarkdownCicero(markdownText);
        // console.log(JSON.stringify(json, null, 4));
        expect(json).toMatchSnapshot();
        const clauseText = ciceroMarkTransformer.getClauseText(json.nodes[2]);
        expect(clauseText).toMatchSnapshot();
        expect((() => ciceroMarkTransformer.getClauseText(json.nodes[1]))).toThrow('Cannot apply getClauseText to non-clause node');
    });

});
