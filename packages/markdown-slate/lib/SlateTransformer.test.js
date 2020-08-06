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

'use strict';

const fs = require('fs');
const path = require('path');
const SlateTransformer = require('./SlateTransformer');

let slateTransformer = null;

/* eslint-disable no-undef */
// @ts-nocheck

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text for the clause
 * @return {string} - the normalized text for the clause
 */
function normalizeNLs(input) {
    // we replace all \r and \n with \n
    let text =  input.replace(/\r/gm,'');
    return text;
}

// @ts-ignore
// eslint-disable-next-line no-undef
beforeAll(() => {
    slateTransformer = new SlateTransformer();
});

/**
 * Get the name and contents of all slate test files for Markdown
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownSlateFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/markdown/');

    files.forEach(function(file) {
        if(file.endsWith('.json')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/markdown/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('markdown <-> slate', () => {
    getMarkdownSlateFiles().forEach( ([file, jsonText], index) => {
        it(`converts ${file} to and from Markdown`, () => {
            const value = JSON.parse(jsonText);
            const ciceroMark = slateTransformer.toCiceroMark(value, 'json');

            // check no changes to cicero mark
            expect(ciceroMark).toMatchSnapshot(); // (1)

            // load expected markdown
            const extension = path.extname(file);
            const mdFile = path.basename(file,extension);
            const expectedMarkdown = fs.readFileSync(__dirname + '/../test/data/markdown/' + mdFile + '.md', 'utf8');
            expect(expectedMarkdown).toMatchSnapshot(); // (2)

            // convert the expected markdown to cicero mark and compare
            const expectedSlateValue = slateTransformer.fromMarkdown(expectedMarkdown);
            expect(expectedSlateValue).toMatchSnapshot(); // (3)
            // if(mdFile === 'image') {
            //     console.log(JSON.stringify(expectedSlateValue, null, 4));
            // }

            const expectedCiceroMark = slateTransformer.toCiceroMark(expectedSlateValue, 'json');
            expect(expectedCiceroMark).toMatchSnapshot(); // (4)
            // if(mdFile === 'image') {
            //     console.log('Expected expectedCiceroMark', JSON.stringify(expectedCiceroMark, null, 4));
            // }

            // check that ast created from slate and from the expected md is the same
            expect(ciceroMark).toEqual(expectedCiceroMark);

            // check roundtrip
            expect(expectedSlateValue).toEqual(value);
        });
    });
});

/**
 * Get the name and contents of all slate test files for CiceroMark
 * @returns {*} an array of name/contents tuples
 */
function getCiceroMarkSlateFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/ciceromark/');

    files.forEach(function(file) {
        if(file.endsWith('_slate.json')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('ciceromark <-> slate', () => {
    getCiceroMarkSlateFiles().forEach( ([file, jsonText], index) => {
        it(`converts ${file} to and from CiceroMark`, () => {
            const value = JSON.parse(jsonText);
            const ciceroMark = slateTransformer.toCiceroMark(value, 'json');

            // check no changes to cicero mark
            expect(ciceroMark).toMatchSnapshot(); // (1)

            // load expected ciceromark
            const expectedCiceroMark = JSON.parse(fs.readFileSync(__dirname + '/../test/data/ciceromark/' + file.replace(/_slate.json$/,'_ciceromark.json'), 'utf8'));
            expect(expectedCiceroMark).toMatchSnapshot(); // (2)

            // convert the expected markdown to cicero mark and compare
            const expectedSlateValue = slateTransformer.fromCiceroMark(expectedCiceroMark);
            expect(expectedSlateValue).toMatchSnapshot(); // (3)
            // if(mdFile === 'image') {
            //     console.log(JSON.stringify(expectedSlateValue, null, 4));
            // }

            // check that ast created from slate and from the expected md is the same
            expect(ciceroMark).toEqual(expectedCiceroMark);

            // check roundtrip
            expect(expectedSlateValue).toEqual(value);
        });
    });
});

describe('slate -> markdown_cicero', () => {
    it('converts acceptance from slate to markdown cicero', () => {
        // load slate DOM
        const slateDom = JSON.parse(fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance_slate.json', 'utf8'));
        // load expected markdown cicero
        const expectedMarkdownCicero = normalizeNLs(fs.readFileSync(__dirname + '/../test/data/ciceromark/acceptance.md', 'utf8'));

        // convert the slate to markdown cicero and compare
        const actualMarkdownCicero = slateTransformer.toMarkdownCicero(slateDom);
        expect(actualMarkdownCicero).toMatchSnapshot(); // (3)

        // check roundtrip
        expect(actualMarkdownCicero).toEqual(expectedMarkdownCicero);
    });
});