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
const CommonmarkParser = require('./CommonmarkParser');
const commonmarkToString = require('./commonmarkToString');
let parser = null;

// @ts-ignore
beforeAll(() => {
    parser = new CommonmarkParser();
});

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/test/');

    files.forEach(function(file) {
        let contents = fs.readFileSync(__dirname + '/test/' + file, 'utf8');
        result.push([file, contents]);
    });

    return result;
}

// const currencyFormatter = input => `£${Number(input).toFixed(2)}`;
describe('markdown', () => {
    getMarkdownFiles().forEach( ([file, markdownText]) => {
        it(`converts ${file} to concerto`, () => {
            const concertoObject = parser.parse(markdownText);
            const json = parser.getSerializer().toJSON(concertoObject);
            expect(json).toMatchSnapshot();
        });

        it(`roundtrips ${file}`, () => {
            const concertoObject = parser.parse(markdownText);
            const roundtrip = commonmarkToString(concertoObject).trim();
            expect(roundtrip).toEqual(markdownText);
        });
    });
});


test.each( getMarkdownFiles(), '%s', (file, markdownText) => {
    const concertoObject = parser.parse(markdownText);
    const json = parser.getSerializer().toJSON(concertoObject);
    expect(json).toMatchSnapshot();
    const roundtrip = commonmarkToString(concertoObject).trim();
    expect(roundtrip).toEqual(markdownText);
});