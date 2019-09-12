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
const path = require('path');
const Value = require('slate').Value;
const CommonMark = require('@accordproject/markdown-common').CommonMark;
const SlateMark = require('./SlateMark');

let commonMark = null;
let slateMark = null;

// @ts-ignore
beforeAll(() => {
    commonMark = new CommonMark();
    slateMark = new SlateMark();
});

/**
 * Get the name and contents of all slate test files
 * @returns {*} an array of name/contents tuples
 */
function getSlateFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data/');

    files.forEach(function(file) {
        if(file.endsWith('.json')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

describe('slate', () => {
    getSlateFiles().forEach( ([file, jsonText], index) => {
        it(`converts ${file} to concerto`, () => {
            const slateDom = JSON.parse(jsonText);
            const value = Value.fromJSON(slateDom);
            const concertoObject = slateMark.toCommonMark(value.document);
            const json = commonMark.getSerializer().toJSON(concertoObject);
            console.log('From slate', JSON.stringify(json, null, 4));

            // check no changes to the concerto
            expect(json).toMatchSnapshot();

            // load expected markdown
            const extension = path.extname(file);
            const mdFile = path.basename(file,extension);
            const expectedMarkdown = fs.readFileSync(__dirname + '/../test/data/' + mdFile + '.md', 'utf8');

            // convert the expected markdown to concerto and compare
            const expectedConcertoObject = commonMark.fromString(expectedMarkdown);
            const expectedJson = commonMark.getSerializer().toJSON(expectedConcertoObject);
            console.log('Expected JSON', JSON.stringify(expectedJson, null, 4));

            // check that ast created from slate and from the expected md is the same
            expect(json).toEqual(expectedJson);

            // now convert the expected ast back to slate and compare
            const expectedSlate = slateMark.fromCommonMark(expectedConcertoObject);
            console.log('Expected Slate', JSON.stringify(expectedSlate, null, 4));

            // check roundtrip
            expect(expectedSlate).toEqual(slateDom.document);
        });
    });
});