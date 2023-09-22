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
const DocxTransformer = require('../src/DocxTransformer');
let docxTransformer = null;

// @ts-ignore
beforeEach(() => {
    docxTransformer = new DocxTransformer();
});

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getDocxFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function (file) {
        if (file.endsWith('.docx')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file);
            result.push([file, contents]);
        }
    });

    return result;
}

describe('docx to ciceromark', () => {
    getDocxFiles().forEach(([file, docx], i) => {
        it(`converts ${file} to ciceromark`, async () => {
            const json = await docxTransformer.toCiceroMark(docx, 'json');
            expect(json).toMatchSnapshot(); // (1)
        });
    });
});