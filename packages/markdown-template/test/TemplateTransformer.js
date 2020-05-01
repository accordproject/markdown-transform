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

const grammar2 = JSON.parse(Fs.readFileSync('./test/data/template2/grammar2.json', 'utf8'));
const model2 = './test/data/template2/model2.cto';
const sample2 = Fs.readFileSync('./test/data/template2/sample2.md', 'utf8');
const sample2Err1 = Fs.readFileSync('./test/data/template2/sample2Err1.md', 'utf8');
const sample2Err2 = Fs.readFileSync('./test/data/template2/sample2Err2.md', 'utf8');

const samplePartLarge = normalizeText(Fs.readFileSync('./test/data/templateLarge/large.txt', 'utf8'));
const grammarLarge = {
    '$class':'org.accordproject.ciceromark.template.Contract',
    'name':'myContract',
    'id':'contract1',
    'type':'org.test.MyContract',
    'nodes': [
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': samplePartLarge },
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
        { '$class': 'org.accordproject.ciceromark.template.Text', 'value': samplePartLarge }
    ]
};
const modelLarge = './test/data/templateLarge/modelLarge.cto';
const sampleLarge = Fs.readFileSync('./test/data/templateLarge/large.md', 'utf8');

const grammarDateTime = JSON.parse(Fs.readFileSync('./test/data/templateDateTime/grammarDateTime.json', 'utf8'));
const modelDateTime = './test/data/templateDateTime/modelDateTime.cto';
const sampleDateTime = Fs.readFileSync('./test/data/templateDateTime/sampleDateTime.md', 'utf8');

const grammarList = JSON.parse(Fs.readFileSync('./test/data/templateList/grammarList.json', 'utf8'));
const modelList = './test/data/templateList/modelList.cto';
const sampleList = Fs.readFileSync('./test/data/templateList/sampleList.md', 'utf8');

const grammarRepeat = JSON.parse(Fs.readFileSync('./test/data/templateRepeat/grammarRepeat.json', 'utf8'));
const modelRepeat = './test/data/templateRepeat/modelRepeat.cto';
const sampleRepeat = Fs.readFileSync('./test/data/templateRepeat/sampleRepeat.md', 'utf8');
const sampleRepeatErr = Fs.readFileSync('./test/data/templateRepeat/sampleRepeatErr.md', 'utf8');

// Tests
describe('#parse', () => {
    describe('#template2', () => {
        it('should parse', async () => {
            (new TemplateTransformer()).parse(sample2,grammar2).penalty.should.equal(10.99);
        });
        it('should parse (validate)', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[model2]);
            (new TemplateTransformer()).parse(sample2,grammar2,modelManager).penalty.should.equal(10.99);
        });
    });

    describe('#template2 (error)', () => {
        it('should fail parsing (extra text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err1,grammar2)).should.throw('Parse error at line 5 column 49\nThere is a penalty of 10.99% for non compliance.X');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err2,grammar2)).should.throw('Parse error at line 3 column 77\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of forcemajeure.');
        });
    });

    describe('#templateLarge', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelLarge]);
            (new TemplateTransformer()).parse(sampleLarge,grammarLarge,modelManager).penalty.should.equal(10.99);
        });
    });

    describe('#templateDateTime', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelDateTime]);
            (new TemplateTransformer()).parse(sampleDateTime,grammarDateTime,modelManager).effectiveDate.should.equal('2020-01-01T00:00:00.000Z');
        });
    });

    describe('#templateList', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelList]);
            const result = (new TemplateTransformer()).parse(sampleList,grammarList,modelManager);
            result.prices.length.should.equal(3);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
        });
    });

    describe('#templateRepeat', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelRepeat]);
            const result = (new TemplateTransformer()).parse(sampleRepeat,grammarRepeat,modelManager);
            result.seller.should.equal('Steve');
            result.buyer.should.equal('Betty');
        });
    });

    describe('#templateRepeat (error)', () => {
        it('should fail parsing (inconsistent variables)', async () => {
            (() => (new TemplateTransformer()).parse(sampleRepeatErr,grammarRepeat)).should.throw('Inconsistent values for variable seller: Steve and Betty');
        });
    });
});
