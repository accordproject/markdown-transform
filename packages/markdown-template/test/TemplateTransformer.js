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

const Fs = require('fs');

// Parser from template AST
const TemplateTransformer = require('../lib/TemplateTransformer').TemplateTransformer;
const normalizeText = require('../lib/TemplateTransformer').normalizeText;

const template4 = JSON.parse(Fs.readFileSync('./test/data/template4.json', 'utf8'));
const text4 = Fs.readFileSync('./test/data/text4.md', 'utf8');
const text4Err1 = Fs.readFileSync('./test/data/text4Err1.md', 'utf8');

const textPartLarge = normalizeText(Fs.readFileSync('./test/data/large.txt', 'utf8'));
const textLarge = Fs.readFileSync('./test/data/large.md', 'utf8');
const templateLarge = {
    'kind':'contract',
    'name':'contract4',
    'type':'org.test.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': textPartLarge },
            { 'kind': 'text', 'value': 'This is contract text, followed by a clause:' },
            {
                'kind':'wrappedClause',
                'name':'clause3',
                'type':'org.test.MyClause',
                'value': {
                    'kind':'sequence',
                    'value': [
                        { 'kind': 'text', 'value': 'This is a contract between ' },
                        { 'kind': 'variable', 'name': 'seller', 'type': 'String' },
                        { 'kind': 'text', 'value': ' and ' },
                        { 'kind': 'variable', 'name': 'buyer', 'type': 'String' },
                        { 'kind': 'text', 'value': ' for the amount of ' },
                        { 'kind': 'variable', 'name': 'amount', 'type': 'Double' },
                        { 'kind': 'text', 'value': ' ' },
                        { 'kind': 'variable', 'name': 'currency', 'type': 'Enum', 'value': ['USD','GBP','EUR'] },
                        { 'kind': 'block', 'name':'forceMajeure', 'type': 'conditional', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
                        { 'kind': 'text', 'value': '.' }
                    ]
                }
            },
            { 'kind': 'text', 'value': 'There is a penalty of ' },
            { 'kind': 'variable', 'name': 'penalty', 'type': 'Double' },
            { 'kind': 'text', 'value': '% for non compliance.' },
            { 'kind': 'text', 'value': textPartLarge }
        ]
    }
};

// Tests
describe('#parse', () => {
    describe('#template4', () => {
        it('should parse', async () => {
            (new TemplateTransformer()).parse(text4,template4).status.should.equal(true);
        });
    });

    describe('#template4Err', () => {
        it('should parse', async () => {
            (() => (new TemplateTransformer()).parse(text4Err1,template4)).should.throw('Parse error at line 5 column 49');
        });
    });

    describe('#templateLarge', () => {
        it('should parse', async () => {
            (new TemplateTransformer()).parse(textLarge,templateLarge).status.should.equal(true);
        });
    });
});
