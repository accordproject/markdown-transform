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

const CommonMark = require('@accordproject/markdown-common').CommonMark;
const CiceroMark = require('./CiceroMark');

let commonMark = null;
let ciceroMark = null;
let serializer = null;

expect.extend({
    toMarkdownRoundtrip(markdownText) {
        let concertoObject1 = commonMark.fromString(markdownText);
        concertoObject1 = ciceroMark.toCommonMark(ciceroMark.fromCommonMark(concertoObject1));
        const json1 = serializer.toJSON(concertoObject1);
        const newMarkdown = commonMark.toString(concertoObject1);
        let concertoObject2 = commonMark.fromString(newMarkdown);
        concertoObject2 = ciceroMark.toCommonMark(ciceroMark.fromCommonMark(concertoObject2));
        const json2 = serializer.toJSON(concertoObject2);
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

// @ts-ignore
beforeAll(() => {
    commonMark = new CommonMark({ tagInfo: true });
    ciceroMark = new CiceroMark();
    serializer = ciceroMark.getSerializer();
});

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function(file) {
        if(file.endsWith('.md')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

/**
 * Get the name and contents of all markdown snippets
 * used in a commonmark spec file
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownSpecFiles() {
    const result = [];
    const specExamples = extractSpecTests(__dirname + '/../test/data/spec.txt');
    specExamples.forEach(function(example) {
        result.push([`${example.section}-${example.number}`, example.markdown]);
    });

    return result;
}

/**
 * Extracts all the test md snippets from a commonmark spec file
 * @param {string} testfile the file to use
 * @return {*} the examples
 */
function extractSpecTests(testfile) {
    let data = fs.readFileSync(testfile, 'utf8');
    let examples = [];
    let current_section = '';
    let example_number = 0;
    let tests = data
        .replace(/\r\n?/g, '\n') // Normalize newlines for platform independence
        .replace(/^<!-- END TESTS -->(.|[\n])*/m, '');

    tests.replace(/^`{32} example\n([\s\S]*?)^\.\n([\s\S]*?)^`{32}$|^#{1,6} *(.*)$/gm,
        function(_, markdownSubmatch, htmlSubmatch, sectionSubmatch){
            if (sectionSubmatch) {
                current_section = sectionSubmatch;
            } else {
                example_number++;
                examples.push({markdown: markdownSubmatch,
                    html: htmlSubmatch,
                    section: current_section,
                    number: example_number});
            }
        });
    return examples;
}

describe('markdown', () => {
    getMarkdownFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const concertoObject = commonMark.fromString(markdownText);
            const json = serializer.toJSON(concertoObject);
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});

describe('markdown-spec', () => {
    getMarkdownSpecFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const concertoObject = commonMark.fromString(markdownText);
            const json = serializer.toJSON(concertoObject);
            expect(json).toMatchSnapshot();
        });

        // currently skipped because not all examples roundtrip
        // needs more investigation!!
        it.skip(`roundtrips ${file}`, () => {
            expect(markdownText).toMarkdownRoundtrip();
        });
    });
});
