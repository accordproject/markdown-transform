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
const sample2Err3 = Fs.readFileSync('./test/data/template2/sample2Err3.md', 'utf8');
const sample2Err4 = Fs.readFileSync('./test/data/template2/sample2Err4.md', 'utf8');

const samplePartLarge = normalizeText(Fs.readFileSync('./test/data/templateLarge/large.txt', 'utf8'));
const grammarLarge = {
    '$class':'org.accordproject.ciceromark.template.ContractBlock',
    'name':'myContract',
    'id':'contract1',
    'type':'org.test.MyContract',
    'nodes': [
        { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': samplePartLarge },
        { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': 'This is contract text, followed by a clause:' },
        {
            '$class':'org.accordproject.ciceromark.template.ClauseBlock',
            'name':'agreement',
            'id':'clause1',
            'type':'org.test.MyClause',
            'nodes': [
                { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': 'This is a contract between ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'seller', 'type': 'String' },
                { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': ' and ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'buyer', 'type': 'String' },
                { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': ' for the amount of ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'amount', 'type': 'Double' },
                { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': ' ' },
                { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'currency', 'type': 'Enum', 'value': ['USD','GBP','EUR'] },
                { '$class': 'org.accordproject.ciceromark.template.ConditionalBlock', 'name':'forceMajeure', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
                { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': '.' }
            ]
        },
        { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': 'There is a penalty of ' },
        { '$class': 'org.accordproject.ciceromark.template.Variable', 'name': 'penalty', 'type': 'Double' },
        { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': '% for non compliance.' },
        { '$class': 'org.accordproject.ciceromark.template.TextChunk', 'value': samplePartLarge }
    ]
};
const modelLarge = './test/data/templateLarge/modelLarge.cto';
const sampleLarge = Fs.readFileSync('./test/data/templateLarge/sampleLarge.md', 'utf8');

const grammarDateTime = JSON.parse(Fs.readFileSync('./test/data/templateDateTime/grammarDateTime.json', 'utf8'));
const modelDateTime = './test/data/templateDateTime/modelDateTime.cto';
const sampleDateTime = Fs.readFileSync('./test/data/templateDateTime/sampleDateTime.md', 'utf8');

const grammarUList = JSON.parse(Fs.readFileSync('./test/data/templateUList/grammarUList.json', 'utf8'));
const modelUList = './test/data/templateUList/modelUList.cto';
const sampleUList = Fs.readFileSync('./test/data/templateUList/sampleUList.md', 'utf8');

const grammarOList = JSON.parse(Fs.readFileSync('./test/data/templateOList/grammarOList.json', 'utf8'));
const modelOList = './test/data/templateOList/modelOList.cto';
const sampleOList = Fs.readFileSync('./test/data/templateOList/sampleOList.md', 'utf8');
const sampleOList2 = Fs.readFileSync('./test/data/templateOList/sampleOList2.md', 'utf8');

const grammarRepeat = JSON.parse(Fs.readFileSync('./test/data/templateRepeat/grammarRepeat.json', 'utf8'));
const modelRepeat = './test/data/templateRepeat/modelRepeat.cto';
const sampleRepeat = Fs.readFileSync('./test/data/templateRepeat/sampleRepeat.md', 'utf8');
const sampleRepeatErr = Fs.readFileSync('./test/data/templateRepeat/sampleRepeatErr.md', 'utf8');

const grammarWith = JSON.parse(Fs.readFileSync('./test/data/templateWith/grammarWith.json', 'utf8'));
const modelWith = './test/data/templateWith/modelWith.cto';
const sampleWith = Fs.readFileSync('./test/data/templateWith/sampleWith.md', 'utf8');

const grammarComputed = JSON.parse(Fs.readFileSync('./test/data/templateComputed/grammarComputed.json', 'utf8'));
const modelComputed = './test/data/templateComputed/modelComputed.cto';
const sampleComputed = Fs.readFileSync('./test/data/templateComputed/sampleComputed.md', 'utf8');
const sampleComputedErr = Fs.readFileSync('./test/data/templateComputed/sampleComputedErr.md', 'utf8');

// Tests
describe('#parse', () => {
    describe('#template2', () => {
        it('should parse', async () => {
            (new TemplateTransformer()).parse(sample2,grammar2).penalty.should.equal(10);
        });
        it('should parse (validate)', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[model2]);
            (new TemplateTransformer()).parse(sample2,grammar2,modelManager).penalty.should.equal(10);
        });
    });

    describe('#template2 (error)', () => {
        it('should fail parsing (extra text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err1,grammar2)).should.throw('Parse error at line 5 column 46\nThere is a penalty of 10% for non compliance.X\n                                             ^\nExpected: End of text');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err2,grammar2)).should.throw('Parse error at line 3 column 77\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of forcemajeure.');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err3,grammar2)).should.throw('Parse error at line 2 column 118\n``` <clause src="ap://acceptance-of-delivery@0.12.1#721d1aa0999a5d278653e211ae2a64b75fdd8ca6fa1f34255533c942404c5c1f" claused="479adbb4-dc55-4d1a-ab12-b6c5e16900c0">\n                                                                                                                     ^^^^^^^^^^\nExpected: \' clauseid=\'');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err4,grammar2)).should.throw('Parse error at line 5 column 23\nThere is a penalty of .10% for non compliance.\n                      ^^^^^^^^^^^^^^^^^^\nExpected: An Integer literal');
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

    describe('#templateUList', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelUList]);
            const result = (new TemplateTransformer()).parse(sampleUList,grammarUList,modelManager);
            result.prices.length.should.equal(3);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
        });
    });

    describe('#templateOList', () => {
        it('should parse (same number)', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelOList]);
            const result = (new TemplateTransformer()).parse(sampleOList,grammarOList,modelManager);
            result.prices.length.should.equal(3);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
        });

        it('should parse (same various numbers)', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelOList]);
            const result = (new TemplateTransformer()).parse(sampleOList2,grammarOList,modelManager);
            result.prices.length.should.equal(4);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
            result.prices[3].$class.should.equal('org.test.Price');
            result.prices[3].number.should.equal(4);
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

    describe('#templateWith', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelWith]);
            const result = (new TemplateTransformer()).parse(sampleWith,grammarWith,modelManager);
            result.agreement.seller.should.equal('Steve');
            result.agreement.buyer.should.equal('Betty');
            result.sellerAddress.city.should.equal('NYC');
            result.buyerAddress.city.should.equal('London');
        });
    });

    describe('#templateComputed', () => {
        it('should parse', async () => {
            const modelManager = await ModelLoader.loadModelManager(null,[modelComputed]);
            const result = (new TemplateTransformer()).parse(sampleComputed,grammarComputed,modelManager);
            result.agreement.seller.should.equal('Steve');
            result.agreement.buyer.should.equal('Betty');
        });
    });

    describe('#templateComputed (error)', () => {
        it('should fail parsing (inconsistent variables)', async () => {
            (() => (new TemplateTransformer()).parse(sampleComputedErr,grammarComputed)).should.throw('Parse error at line 6 column 11\nAnd this: {something something}} is a computed value.\n          ^^^^^^^^^^^');
        });
    });

});
