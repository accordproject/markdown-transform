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
const TemplateTransformer = require('../lib/TemplateTransformer');

const loadFile = (x) => { return { fileName: x, content: Fs.readFileSync(x, 'utf8') }; };

const grammar2 = loadFile('./test/data/template2/grammar2.tem.md');
const model2 = './test/data/template2/model2.cto';
const sample2 = loadFile('./test/data/template2/sample2.md');
const sample2Err1 = loadFile('./test/data/template2/sample2Err1.md');
const sample2Err2 = loadFile('./test/data/template2/sample2Err2.md');
const sample2Err3 = loadFile('./test/data/template2/sample2Err3.md');
const sample2Err4 = loadFile('./test/data/template2/sample2Err4.md');

const grammarLarge = loadFile('./test/data/templateLarge/grammarLarge.tem.md');
const modelLarge = './test/data/templateLarge/modelLarge.cto';
const sampleLarge = loadFile('./test/data/templateLarge/sampleLarge.md');

const grammarDateTime = loadFile('./test/data/templateDateTime/grammarDateTime.tem.md');
const modelDateTime = './test/data/templateDateTime/modelDateTime.cto';
const sampleDateTime = loadFile('./test/data/templateDateTime/sampleDateTime.md');

const grammarUList = loadFile('./test/data/templateUList/grammarUList.tem.md');
const modelUList = './test/data/templateUList/modelUList.cto';
const sampleUList = loadFile('./test/data/templateUList/sampleUList.md');

const grammarOList = loadFile('./test/data/templateOList/grammarOList.tem.md');
const modelOList = './test/data/templateOList/modelOList.cto';
const sampleOList = loadFile('./test/data/templateOList/sampleOList.md');
const sampleOList2 = loadFile('./test/data/templateOList/sampleOList2.md');

const grammarRepeat = loadFile('./test/data/templateRepeat/grammarRepeat.tem.md');
const modelRepeat = './test/data/templateRepeat/modelRepeat.cto';
const sampleRepeat = loadFile('./test/data/templateRepeat/sampleRepeat.md');
const sampleRepeatErr = loadFile('./test/data/templateRepeat/sampleRepeatErr.md');

const grammarWith = loadFile('./test/data/templateWith/grammarWith.tem.md');
const modelWith = './test/data/templateWith/modelWith.cto';
const sampleWith = loadFile('./test/data/templateWith/sampleWith.md');

const grammarComputed = loadFile('./test/data/templateComputed/grammarComputed.tem.md');
const modelComputed = './test/data/templateComputed/modelComputed.cto';
const sampleComputed = loadFile('./test/data/templateComputed/sampleComputed.md');
const sampleComputedErr = loadFile('./test/data/templateComputed/sampleComputedErr.md');

// Tests
describe('#parse', () => {
    describe('#template2', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model2]);
        });

        it('should parse', async () => {
            (new TemplateTransformer()).parse(sample2,grammar2,modelManager,'contract').penalty.should.equal(10);
        });
        it('should parse (validate)', async () => {
            (new TemplateTransformer()).parse(sample2,grammar2,modelManager,'contract').penalty.should.equal(10);
        });
    });

    describe('#template2 (error)', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model2]);
        });

        it('should fail parsing (extra text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err1,grammar2,modelManager,'contract')).should.throw('Parse error at line 5 column 46\nThere is a penalty of 10% for non compliance.X\n                                             ^\nExpected: End of text');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err2,grammar2,modelManager,'contract')).should.throw('Parse error at line 3 column 77\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of forcemajeure.');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err3,grammar2,modelManager,'contract')).should.throw('Parse error at line 2 column 118\n``` <clause src="ap://acceptance-of-delivery@0.12.1#721d1aa0999a5d278653e211ae2a64b75fdd8ca6fa1f34255533c942404c5c1f" claused="479adbb4-dc55-4d1a-ab12-b6c5e16900c0">\n                                                                                                                     ^^^^^^^^^^\nExpected: \' clauseid=\'');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateTransformer()).parse(sample2Err4,grammar2,modelManager,'contract')).should.throw('Parse error at line 5 column 23\nThere is a penalty of .10% for non compliance.\n                      ^^^^^^^^^^^^^^^^^^\nExpected: An Integer literal');
        });
    });

    describe('#templateLarge', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelLarge]);
        });

        it('should parse', async () => {
            (new TemplateTransformer()).parse(sampleLarge,grammarLarge,modelManager,'contract').penalty.should.equal(10.99);
        });
    });

    describe('#templateDateTime', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelDateTime]);
        });

        it('should parse', async () => {
            (new TemplateTransformer()).parse(sampleDateTime,grammarDateTime,modelManager,'clause').effectiveDate.should.equal('2020-01-01T00:00:00.000Z');
        });
    });

    describe('#templateUList', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelUList]);
        });

        it('should parse', async () => {
            const result = (new TemplateTransformer()).parse(sampleUList,grammarUList,modelManager,'contract');
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
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelOList]);
        });

        it('should parse (same number)', async () => {
            const result = (new TemplateTransformer()).parse(sampleOList,grammarOList,modelManager,'contract');
            result.prices.length.should.equal(3);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
        });

        it('should parse (same various numbers)', async () => {
            const result = (new TemplateTransformer()).parse(sampleOList2,grammarOList,modelManager,'contract');
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
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelRepeat]);
        });

        it('should parse', async () => {
            const result = (new TemplateTransformer()).parse(sampleRepeat,grammarRepeat,modelManager,'clause');
            result.seller.should.equal('Steve');
            result.buyer.should.equal('Betty');
        });
    });

    describe('#templateRepeat (error)', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelRepeat]);
        });

        it('should fail parsing (inconsistent variables)', async () => {
            (() => (new TemplateTransformer()).parse(sampleRepeatErr,grammarRepeat,modelManager,'clause')).should.throw('Inconsistent values for variable seller: Steve and Betty');
        });
    });

    describe('#templateWith', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelWith]);
        });

        it('should parse', async () => {
            const result = (new TemplateTransformer()).parse(sampleWith,grammarWith,modelManager,'contract');
            result.agreement.seller.should.equal('Steve');
            result.agreement.buyer.should.equal('Betty');
            result.sellerAddress.city.should.equal('NYC');
            result.buyerAddress.city.should.equal('London');
        });
    });

    describe('#templateComputed', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelComputed]);
        });

        it('should parse', async () => {
            const result = (new TemplateTransformer()).parse(sampleComputed,grammarComputed,modelManager,'contract');
            result.agreement.seller.should.equal('Steve');
            result.agreement.buyer.should.equal('Betty');
        });
    });

    describe('#templateComputed (error)', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelComputed]);
        });

        it('should fail parsing (inconsistent variables)', async () => {
            (() => (new TemplateTransformer()).parse(sampleComputedErr,grammarComputed,modelManager,'contract')).should.throw('Parse error at line 6 column 11\nAnd this: {something something}} is a computed value.\n          ^^^^^^^^^^^');
        });
    });

});
