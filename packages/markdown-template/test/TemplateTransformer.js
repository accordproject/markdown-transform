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
const ModelLoader = require('@accordproject/concerto-core').ModelLoader;
const TemplateTransformer = require('../lib/TemplateTransformer').TemplateTransformer;
const normalizeText = require('../lib/TemplateTransformer').normalizeText;

const template4 = JSON.parse(Fs.readFileSync('./test/data/grammar4.json', 'utf8'));
const text4 = Fs.readFileSync('./test/data/text4.md', 'utf8');
const text4Err1 = Fs.readFileSync('./test/data/text4Err1.md', 'utf8');
const text4Err2 = Fs.readFileSync('./test/data/text4Err2.md', 'utf8');

const textPartLarge = normalizeText(Fs.readFileSync('./test/data/large.txt', 'utf8'));
const textLarge = Fs.readFileSync('./test/data/large.md', 'utf8');
const templateLarge = {
    '$class':'org.accordproject.ciceromark.template.Contract',
    'name':'myContract',
    'id':'contract1',
    'type':'org.test.MyContract',
    'nodes': [
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': textPartLarge },
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': 'This is contract text, followed by a clause:' },
        {
            '$class':'org.accordproject.ciceromark.template.Clause',
            'name':'agreement',
            'id':'clause1',
            'type':'org.test.MyClause',
            'nodes': [
                { '$class': 'org.accordproject.ciceromark.template.Text', 'value': 'This is a contract between ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'seller', 'type': 'String' },
                { '$class': 'org.accordproject.ciceromark.template.Text', 'value': ' and ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'buyer', 'type': 'String' },
                { '$class': 'org.accordproject.ciceromark.template.Text', 'value': ' for the amount of ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'amount', 'type': 'Double' },
                { '$class': 'org.accordproject.ciceromark.template.Text', 'value': ' ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'currency', 'type': 'Enum', 'value': ['USD','GBP','EUR'] },
                { '$class': 'org.accordproject.ciceromark.template.ConditionalBlock', 'name':'forceMajeure', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
                { '$class': 'org.accordproject.ciceromark.template.Text', 'value': '.' }
            ]
        },
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': 'There is a penalty of ' },
        { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'penalty', 'type': 'Double' },
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': '% for non compliance.' },
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': textPartLarge }
    ]
};

const model4 = './test/data/model4.cto';

// Tests
describe('#parse', () => {
    describe('#template4', () => {
        it('should parse', async () => {
            (new TemplateTransformer()).parse(text4,template4).penalty.should.equal(10.99);
        });
        it('should parse (validate)', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[model4]);
            (new TemplateTransformer()).parse(text4,template4,modelManager).penalty.should.equal(10.99);
        });
    });

    describe('#template4Err', () => {
        it('should fail parsing (extra text)', async () => {
            (() => (new TemplateTransformer()).parse(text4Err1,template4)).should.throw('Parse error at line 5 column 49\nThere is a penalty of 10.99% for non compliance.X');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(text4Err2,template4)).should.throw('Parse error at line 3 column 77\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of forcemajeure.');
        });
    });

    describe('#templateLarge', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[model4]);
            (new TemplateTransformer()).parse(textLarge,templateLarge,modelManager).penalty.should.equal(10.99);
        });
    });
});
