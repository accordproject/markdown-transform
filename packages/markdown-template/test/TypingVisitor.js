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
const TemplateMarkTransformer = require('../lib/TemplateMarkTransformer');

const loadFile = (x) => { return { fileName: x, content: Fs.readFileSync(x, 'utf8') }; };

const grammar1 = loadFile('./test/data/test1/grammar.tem.md');
const model1 = './test/data/test1/model.cto';
const sample1 = loadFile('./test/data/test1/sample.md');
const sample1Err1 = loadFile('./test/data/test1/sampleErr1.md');
const sample1Err2 = loadFile('./test/data/test1/sampleErr2.md');
const sample1Err3 = loadFile('./test/data/test1/sampleErr3.md');

const grammarErr1 = loadFile('./test/data/testErr1/grammar.tem.md');
const modelErr1 = './test/data/testErr1/model.cto';
const sampleErr1 = loadFile('./test/data/testErr1/sample.md');

const grammarErr2 = loadFile('./test/data/testErr2/grammar.tem.md');
const modelErr2 = './test/data/testErr2/model.cto';
const sampleErr2 = loadFile('./test/data/testErr2/sample.md');

const grammarErr3 = loadFile('./test/data/testErr3/grammar.tem.md');
const modelErr3 = './test/data/testErr3/model.cto';
const sampleErr3 = loadFile('./test/data/testErr3/sample.md');

const grammarErr4 = loadFile('./test/data/testErr4/grammar.tem.md');
const modelErr4 = './test/data/testErr4/model.cto';
const sampleErr4 = loadFile('./test/data/testErr4/sample.md');

const grammarErr5 = loadFile('./test/data/testErr5/grammar.tem.md');
const modelErr5 = './test/data/testErr5/model.cto';
const sampleErr5 = loadFile('./test/data/testErr5/sample.md');

const grammarErr6 = loadFile('./test/data/testErr6/grammar.tem.md');
const modelErr6 = './test/data/testErr6/model.cto';
const sampleErr6 = loadFile('./test/data/testErr6/sample.md');

const grammar2 = loadFile('./test/data/test2/grammar.tem.md');
const model2 = './test/data/test2/model.cto';
const sample2 = loadFile('./test/data/test2/sample.md');
const sample2Err1 = loadFile('./test/data/test2/sampleErr1.md');
const sample2Err2 = loadFile('./test/data/test2/sampleErr2.md');
const sample2Err3 = loadFile('./test/data/test2/sampleErr3.md');
const sample2Err4 = loadFile('./test/data/test2/sampleErr4.md');

const grammarLarge = loadFile('./test/data/testLarge/grammar.tem.md');
const modelLarge = './test/data/testLarge/model.cto';
const sampleLarge = loadFile('./test/data/testLarge/sample.md');

const grammarDateTime = loadFile('./test/data/testDateTime/grammar.tem.md');
const modelDateTime = './test/data/testDateTime/model.cto';
const sampleDateTime = loadFile('./test/data/testDateTime/sample.md');

const grammarUList = loadFile('./test/data/testUList/grammar.tem.md');
const modelUList = './test/data/testUList/model.cto';
const sampleUList = loadFile('./test/data/testUList/sample.md');

const grammarOList = loadFile('./test/data/testOList/grammar.tem.md');
const modelOList = './test/data/testOList/model.cto';
const sampleOList = loadFile('./test/data/testOList/sample.md');
const sampleOList2 = loadFile('./test/data/testOList/sample2.md');

const grammarRepeat = loadFile('./test/data/testRepeat/grammar.tem.md');
const modelRepeat = './test/data/testRepeat/model.cto';
const sampleRepeat = loadFile('./test/data/testRepeat/sample.md');
const sampleRepeatErr = loadFile('./test/data/testRepeat/sampleErr.md');

const grammarWith = loadFile('./test/data/testWith/grammar.tem.md');
const modelWith = './test/data/testWith/model.cto';
const sampleWith = loadFile('./test/data/testWith/sample.md');

const grammarComputed = loadFile('./test/data/testComputed/grammar.tem.md');
const modelComputed = './test/data/testComputed/model.cto';
const sampleComputed = loadFile('./test/data/testComputed/sample.md');
const sampleComputedErr = loadFile('./test/data/testComputed/sampleErr.md');

// Tests
describe('#invalidTemplates', () => {
    describe('#templateErr1', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr1]);
        });

        it('should fail loading template (duplicate clause)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr1,grammarErr1,modelManager,'clause')).should.throw('Found multiple instances of org.accordproject.cicero.contract.AccordClause. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.');
        });

        it('should fail loading template (duplicate contract)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr1,grammarErr1,modelManager,'contract')).should.throw('Found multiple instances of org.accordproject.cicero.contract.AccordContract. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordContract.');
        });
    });

    describe('#templateErr2', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr2]);
        });

        it('should fail loading template (duplicate clause)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr2,grammarErr2,modelManager,'clause')).should.throw('Failed to find an asset that extends org.accordproject.cicero.contract.AccordClause. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.');
        });

        it('should fail loading template (duplicate contract)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr2,grammarErr2,modelManager,'contract')).should.throw('Failed to find an asset that extends org.accordproject.cicero.contract.AccordContract. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordContract.');
        });
    });

    describe('#templateErr3', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr3]);
        });

        it('should fail loading template (missing clause property)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr3,grammarErr3,modelManager,'clause')).should.throw('Unknown property seller');
        });
    });

    describe('#templateErr4', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr4]);
        });

        it('should fail loading template (missing contract property)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr4,grammarErr4,modelManager,'contract')).should.throw('Unknown property agreement');
        });
    });

    describe('#templateErr5', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr5]);
        });

        it('should fail loading template (missing with property)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr5,grammarErr5,modelManager,'contract')).should.throw('Unknown property sellerAddress');
        });
    });

    describe('#templateErr6', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelErr6]);
        });

        it('should fail loading template (missing list property)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleErr6,grammarErr6,modelManager,'contract')).should.throw('Unknown property prices');
        });
    });
});

describe('#parse', () => {
    describe('#template1', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model1]);
        });

        it('should parse', async () => {
            (new TemplateMarkTransformer()).fromMarkdown(sample1,grammar1,modelManager,'clause').amount.should.equal(3131);
        });

        it('should parse (verbose)', async () => {
            (new TemplateMarkTransformer()).fromMarkdown(sample1,grammar1,modelManager,'clause',{verbose:true}).amount.should.equal(3131);
        });
    });

    describe('#template1 (error)', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model1]);
        });

        it('should fail parsing (wrong currency code)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample1Err1,grammar1,modelManager,'clause')).should.throw('Parse error at line 1 column 74\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 GRR, even in the presence of force majeure.');
        });

        it('should fail parsing (wrong string)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample1Err2,grammar1,modelManager,'clause')).should.throw('Parse error at line 1 column 28\nThis is a contract between Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of force majeure.');
        });

        it('should fail parsing (wrong double)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample1Err3,grammar1,modelManager,'clause')).should.throw('Parse error at line 1 column 66\nThis is a contract between "Steve" and "Betty" for the amount of .00 EUR, even in the presence of force majeure.');
        });
    });

    describe('#template2', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model2]);
        });

        it('should parse', async () => {
            (new TemplateMarkTransformer()).fromMarkdown(sample2,grammar2,modelManager,'contract').penalty.should.equal(10);
        });
    });

    describe('#template2 (error)', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[model2]);
        });

        it('should fail parsing (extra text)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample2Err1,grammar2,modelManager,'contract')).should.throw('Parse error at line 7 column 46\nThere is a penalty of 10% for non compliance.X\n                                             ^\nExpected: End of text');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample2Err2,grammar2,modelManager,'contract')).should.throw('Parse error at line 4 column 77\nThis is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of forcemajeure.');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample2Err3,grammar2,modelManager,'contract')).should.throw('Parse error at line 3 column 118\n``` <clause src="ap://acceptance-of-delivery@0.12.1#721d1aa0999a5d278653e211ae2a64b75fdd8ca6fa1f34255533c942404c5c1f" nam="479adbb4-dc55-4d1a-ab12-b6c5e16900c0">\n                                                                                                                     ^^^^^^\nExpected: \' name=\'');
        });
        it('should fail parsing (wrong text)', async () => {
            (() => (new TemplateMarkTransformer()).fromMarkdown(sample2Err4,grammar2,modelManager,'contract')).should.throw('Parse error at line 7 column 23\nThere is a penalty of .10% for non compliance.\n                      ^^^^^^^^^^^^^^^^^^\nExpected: An Integer literal');
        });
    });

    describe('#templateLarge', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelLarge]);
        });

        it('should parse', async () => {
            (new TemplateMarkTransformer()).fromMarkdown(sampleLarge,grammarLarge,modelManager,'contract').penalty.should.equal(10.99);
        });
    });

    describe('#templateDateTime', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelDateTime]);
        });

        it('should parse', async () => {
            (new TemplateMarkTransformer()).fromMarkdown(sampleDateTime,grammarDateTime,modelManager,'clause').effectiveDate.should.equal('2020-01-01T00:00:00.000Z');
        });
    });

    describe('#templateUList', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelUList]);
        });

        it('should parse', async () => {
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleUList,grammarUList,modelManager,'contract');
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
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleOList,grammarOList,modelManager,'contract');
            result.prices.length.should.equal(3);
            result.prices[0].$class.should.equal('org.test.Price');
            result.prices[0].number.should.equal(1);
            result.prices[1].$class.should.equal('org.test.Price');
            result.prices[1].number.should.equal(2);
            result.prices[2].$class.should.equal('org.test.Price');
            result.prices[2].number.should.equal(3);
        });

        it('should parse (same various numbers)', async () => {
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleOList2,grammarOList,modelManager,'contract');
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
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleRepeat,grammarRepeat,modelManager,'clause');
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
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleRepeatErr,grammarRepeat,modelManager,'clause')).should.throw('Inconsistent values for variable seller: Steve and Betty');
        });
    });

    describe('#templateWith', () => {
        let modelManager;
        before(async () => {
            modelManager = await ModelLoader.loadModelManager(null,[modelWith]);
        });

        it('should parse', async () => {
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleWith,grammarWith,modelManager,'contract');
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
            const result = (new TemplateMarkTransformer()).fromMarkdown(sampleComputed,grammarComputed,modelManager,'contract');
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
            (() => (new TemplateMarkTransformer()).fromMarkdown(sampleComputedErr,grammarComputed,modelManager,'contract')).should.throw('Parse error at line 8 column 11\nAnd this: {something something}} is a computed value.\n          ^^^^^^^^^^^');
        });
    });

});
