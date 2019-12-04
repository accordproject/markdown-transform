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

describe.only('html', () => {
    getMarkdownFiles().forEach(([file, markdownText], i) => {
        it(`converts ${file} to html`, () => {
            const json = ciceroTransformer.fromMarkdown(markdownText, 'json');
            expect(json).toMatchSnapshot(); // (1)
            console.log('json', json);
            const html = htmlTransformer.toHtml(json);
            expect(html).toMatchSnapshot(); // (2)
            const ciceroMarkDom = htmlTransformer.toCiceroMark(html, 'json');
            expect(ciceroMarkDom).toEqual(json);
        });
    });
});

describe('markdown-spec', () => {
    getMarkdownSpecFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto JSON`, () => {
            const json = ciceroTransformer.fromMarkdown(markdownText, 'json');
            expect(json).toMatchSnapshot(); // (1)
            const html = htmlTransformer.toHtml(json);
            expect(html).toMatchSnapshot(); // (2)
        });
    });
});
