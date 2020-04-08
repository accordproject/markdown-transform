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

// @ts-ignore
// eslint-disable-next-line no-undef
beforeAll(() => {
    slateTransformer = new SlateTransformer();
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
        it(`converts ${file} to and from CiceroMark`, () => {
            const value = JSON.parse(jsonText);
            const ciceroMark = slateTransformer.toCiceroMark(value, 'json');

            // check no changes to cicero mark
            expect(ciceroMark).toMatchSnapshot(); // (1)

            // load expected markdown
            const extension = path.extname(file);
            const mdFile = path.basename(file,extension);
            const expectedMarkdown = fs.readFileSync(__dirname + '/../test/data/' + mdFile + '.md', 'utf8');
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

        it('converts variable to and from CiceroMark', () => {
            const slateValue = slateTransformer.fromMarkdown('test <variable id="foo" value="bar"/>');
            const expectedSlateValue = {
                'object': 'value',
                'document': {
                    'object': 'document',
                    'data': {},
                    'children': [
                        {
                            'object': 'block',
                            'type': 'paragraph',
                            'data': {},
                            'children': [
                                {
                                    'object': 'text',
                                    'text': 'test ',
                                    'marks': []
                                },
                                {
                                    'object': 'inline',
                                    'type': 'variable',
                                    'data': {
                                        'id': 'foo'
                                    },
                                    'children': [{
                                        'marks': [],
                                        'object': 'text',
                                        'text': 'bar'
                                    }]
                                }
                            ]
                        }
                    ]
                }
            };

            expect(slateValue).toEqual(expectedSlateValue);
        });

        it('converts computed to and from CiceroMark', () => {
            const slateValue = slateTransformer.fromMarkdown('test <computed value="bar"/>');
            //console.log(JSON.stringify(slateValue, null, 4));
            const expectedSlateValue = {
                'object': 'value',
                'document': {
                    'object': 'document',
                    'data': {},
                    'children': [
                        {
                            'object': 'block',
                            'type': 'paragraph',
                            'data': {},
                            'children': [
                                {
                                    'object': 'text',
                                    'text': 'test ',
                                    'marks': []
                                },
                                {
                                    'object': 'inline',
                                    'type': 'computed',
                                    'data': {},
                                    'children': [{
                                        'marks': [],
                                        'object': 'text',
                                        'text': 'bar'
                                    }]
                                }
                            ]
                        }
                    ]
                }
            };

            expect(slateValue).toEqual(expectedSlateValue);
        });
    });
});