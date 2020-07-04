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
const PdfTransformer = require('./PdfTransformer');
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

let pdfTransformer = null;

// @ts-ignore
beforeAll(() => {
    pdfTransformer = new PdfTransformer();
});

/**
 * Get the name and contents of all pdf test files
 * @returns {*} an array of name/contents tuples
 */
function getPdfFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function(file) {
        if(file.endsWith('.pdf')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file);
            result.push([file, contents]);
        }
    });

    return result;
}

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

describe('pdf import', () => {
    getPdfFiles().forEach(([file, pdfContent], i) => {
        it(`converts ${file} to cicero mark`, async () => {
            const ciceroMarkDom = await pdfTransformer.toCiceroMark(pdfContent, 'json');
            //console.log(JSON.stringify(ciceroMarkDom, null, 4));
            expect(ciceroMarkDom).toMatchSnapshot(); // (1)
        });
    });
});

describe('pdf generation', () => {
    getMarkdownFiles().forEach(([file, markdownContent], i) => {
        it(`converts ${file} to pdf`, async () => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            const ciceroMarkDom = ciceroMarkTransformer.fromMarkdown(markdownContent, 'json');
            console.log(JSON.stringify(ciceroMarkDom, null, 2));
            fs.mkdirSync('./output', { recursive: true });

            const promise = new Promise( (resolve) => {
                const outputStream = fs.createWriteStream(`./output/${file}.pdf`);
                outputStream.on('finish', () => {
                    resolve(true);
                });
                pdfTransformer.toPdf(ciceroMarkDom, outputStream );
            });

            return promise;
        });
    });
});