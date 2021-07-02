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

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const datetimeutil = require('../lib/datetimeutil');
const ModelLoader = require('@accordproject/concerto-core').ModelLoader;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateMarkTransformer = require('../lib/TemplateMarkTransformer');

const normalizeNLs = require('../lib/normalize').normalizeNLs;
const normalizeToMarkdownCicero = require('../lib/normalize').normalizeToMarkdownCicero;
const normalizeFromMarkdownCicero = require('../lib/normalize').normalizeFromMarkdownCicero;

const loadFile = (x) => { return { fileName: x, content: normalizeNLs(fs.readFileSync(x, 'utf8')) }; };
const loadPlugin = (x) => {
    return fs.existsSync(x) ? require(path.join('..',x)) : {};
};

// Current time for testing

const currentTime = datetimeutil.setCurrentTime('2000-07-22T10:45:05+04:00');

// Workloads
const successes = [
    {name:'testSpec',kind:'clause',skipGrammar:true}, // Issue https://github.com/accordproject/markdown-transform/issues/2
    {name:'testSpecChanged',kind:'clause',skipGrammar:true}, // Issue https://github.com/accordproject/markdown-transform
    {name:'test1',kind:'clause'},
    {name:'test2',kind:'contract'},
    {name:'test3',kind:'contract'},
    {name:'test4',kind:'contract'},
    {name:'test5',kind:'contract'},
    {name:'test6',kind:'contract'},
    {name:'test7',kind:'contract'},
    {name:'test8',kind:'contract'},
    {name:'test9',kind:'clause'},
    {name:'test10',kind:'clause'},
    {name:'test11',kind:'clause'},
    {name:'test12',kind:'clause'},
    {name:'test13',kind:'clause'},
    {name:'test14',kind:'clause'},
    {name:'testFormula',kind:'contract'},
    {name:'testDateTime',kind:'clause'},
    {name:'testDateTime2',kind:'clause'},
    {name:'testDateTime3',kind:'clause'},
    {name:'testDateTime4',kind:'clause'},
    {name:'testDateTime5',kind:'clause'},
    {name:'testDateTime6',kind:'clause'},
    {name:'testDateTimePm',kind:'clause'},
    {name:'testAmount',kind:'clause'},
    {name:'testAmount2',kind:'clause'},
    {name:'testAmount3',kind:'clause'},
    {name:'testAmount4',kind:'clause'},
    {name:'testMonetaryAmount',kind:'clause'},
    {name:'testMonetaryAmount2',kind:'clause'},
    {name:'testMonetaryAmount3',kind:'clause'},
    {name:'testMonetaryAmount4',kind:'clause'},
    {name:'testLarge',kind:'contract'}, // Just to be double checked
    {name:'testRepeat',kind:'clause'},
    {name:'testMd1',kind:'clause'},
    {name:'testMd2',kind:'contract'},
    {name:'testMd3',kind:'contract'},
    {name:'testMd4',kind:'clause'},
    {name:'testMd5',kind:'clause'},
    {name:'testHeading',kind:'clause'},
    {name:'testUList',kind:'contract'},
    {name:'testOList',kind:'contract'},
    {name:'testOList2',kind:'contract'},
    {name:'testQuoteOList',kind:'contract',skipGrammar:true}, // Issue with prefixes on the content of the list
    {name:'testOListOList2',kind:'contract',skipGrammar:true}, // Issue with prefixes on the content of the list
    {name:'testUListThis',kind:'contract'},
    {name:'testJoin',kind:'contract'},
    {name:'testWith',kind:'contract'},
    {name:'testConditional',kind:'clause'},
    {name:'testOptionalSome',kind:'clause'},
    {name:'testOptionalNone',kind:'clause'},
    {name:'testOptionalElse',kind:'clause'},
    {name:'testOptionalThisSome',kind:'clause'},
    {name:'testOptionalThisNone',kind:'clause'},
    {name:'testUnderscore',kind:'clause'},
    {name:'testIfEnd',kind:'clause'},
    {name:'alltypes',kind:'clause'},
    {name:'alltypes2',kind:'clause'},
    {name:'alltypes3',kind:'clause'},
    {name:'acceptance-of-delivery',kind:'clause'},
    {name:'copyright-license',kind:'contract'},
    {name:'conga',kind:'clause'},
    {name:'empty',kind:'clause'},
    {name:'helloworld',kind:'clause'},
    {name:'installment-sale',kind:'contract'},
    {name:'interest-rate-swap',kind:'contract'},
    {name:'ip-payment',kind:'clause',skipGrammar:true}, // Issue https://github.com/accordproject/markdown-transform/issues/313
    {name:'latedeliveryandpenalty',kind:'contract'},
    {name:'rental-deposit-with',kind:'contract'},
    {name:'signature-name-date',kind:'clause'},
    {name:'volumediscountulist',kind:'contract'},
];

const templateFailures = [
    {name:'templateErr1',desc:'duplicate contract',kind:'contract','error':'Found multiple instances of org.accordproject.contract.Contract. The model for the template must contain a single asset that extends org.accordproject.contract.Contract.'},
    {name:'templateErr2',desc:'duplicate clause',kind:'clause','error':'Failed to find an asset that extends org.accordproject.contract.Clause. The model for the template must contain a single asset that extends org.accordproject.contract.Clause.'},
    {name:'templateErr2',desc:'duplicate contract',kind:'contract','error':'Failed to find an asset that extends org.accordproject.contract.Contract. The model for the template must contain a single asset that extends org.accordproject.contract.Contract.'},
    {name:'templateErr3',desc:'missing clause property',kind:'clause','error':'Unknown property: seller'},
    {name:'templateErr4',desc:'missing contract property',kind:'contract','error':'Unknown property: agreement'},
    {name:'templateErr5',desc:'missing with property',kind:'contract','error':'Unknown property: sellerAddress'},
    {name:'templateErr6',desc:'missing with property',kind:'contract','error':'Unknown property: prices'},
    {name:'templateNotConditional',desc:'wrong type for conditional',kind:'clause','error':'Conditional template not on a boolean property: forceMajeure'},
    {name:'templateUnknownInConditional',desc:'variable inside conditional',kind:'clause','error':'Unknown property: foo'},
    {name:'templateNotOptional',desc:'wrong type for optional',kind:'clause','error':'Optional template not on an optional property: forceMajeure'},
    {name:'templateNotOList',desc:'wrong type for list',kind:'contract','error':'List template not on an array property: prices'},
    {name:'templateNotJoin',desc:'wrong type for join',kind:'contract','error':'Join template not on an array property: rates'},
    {name:'templateUnknownOptional',desc:'missing optional property',kind:'clause','error':'Unknown property: forceMajeure'},
    {name:'templateUnknownOList',desc:'missing list property',kind:'contract','error':'Unknown property: prices'},
    {name:'templateUnknownJoin',desc:'missing join property',kind:'contract','error':'Unknown property: rates'},
];

const parseFailures = [
    {name:'err1',desc:'',kind:'clause','error':'Parse error at line 1 column 73\nThis is a contract between "Steve" and "Betty" for the amount of 3131.0 GRR, even in the presence of force majeure.'},
    {name:'err2',desc:'',kind:'clause','error':'Parse error at line 1 column 28\nThis is a contract between Steve" and "Betty" for the amount of 3131.0 EUR, even in the presence of force majeure.'},
    {name:'err3',desc:'',kind:'clause','error':'Parse error at line 1 column 66\nThis is a contract between "Steve" and "Betty" for the amount of .0 EUR, even in the presence of force majeure.'},
    {name:'err4',desc:'extra text',kind:'contract','error':'Parse error at line 7 column 46\nThere is a penalty of 10% for non compliance.X\n                                             ^\nExpected: End of text'},
    {name:'err5',desc:'wrong text',kind:'contract','error':'Parse error at line 4 column 76\nThis is a contract between "Steve" and "Betty" for the amount of 3131.0 EUR, even in the presence of forcemajeure.'},
    {name:'err6',desc:'wrong text',kind:'contract','error':'Parse error at line 1 column 45\n'},
    {name:'err7',desc:'wrong text',kind:'contract','error':'Parse error at line 7 column 23\nThere is a penalty of .10% for non compliance.\n                      ^^^^^^^^^^^^^^^^^^\nExpected: An Integer literal'},
    {name:'err8',desc:'',kind:'contract','error':'Parse error at line 4 column 73\nThis is a contract between "Steve" and "Betty" for the amount of 3131.0 ZZZ.'},
    {name:'errFormula',desc:'wrong formula',kind:'contract','error':'Parse error at line 8 column 11\nAnd this: {%something something%}} is a computed value.\n          ^^^^^^^^^^^'},
    {name:'errDateTime',desc:'',kind:'clause','error':'Parse error at line 1 column 73\nThis is a contract between "Steve" and "Betty" for the amount of 3131.0 GRR, even in the presence of force majeure.'},
    {name:'errLarge',desc:'',kind:'contract','error':'Parse error at line 804 column 40\nThis is a contract between "Steve" and Betty" for the amount of 3131.0 EUR.'},
    {name:'errRepeat',desc:'inconsistent variables',kind:'clause','error':'Inconsistent values for variable seller: Steve and Betty'},
];

/**
 * Run positive tests workload
 * @param {*} tests - the tests to run
 */
function runSuccesses(tests) {
    // This tests custom extension to the parser
    const ciceroMarkTransformer = new CiceroMarkTransformer();

    for (const test of tests) {
        const name = test.name;
        const kind = test.kind;
        const customTable = loadPlugin(`./test/data/${name}/plugin.js`);
        const templateMarkTransformer = new TemplateMarkTransformer(customTable);
        const grammar = loadFile(`./test/data/${name}/grammar.tem.md`);
        const grammarJson = JSON.parse(loadFile(`./test/data/${name}/grammar.json`).content);
        const model = `./test/data/${name}/model.cto`;
        const sample =  loadFile(`./test/data/${name}/sample.md`);
        const data =  JSON.parse(loadFile(`./test/data/${name}/data.json`).content);

        describe('#'+name, function () {
            let modelManager;
            before(async () => {
                modelManager = await ModelLoader.loadModelManager([model],['model.cto'],{ utcOffset: 0, offline: true });
            });

            it('should create template mark', async () => {
                const result = templateMarkTransformer.fromMarkdownTemplate(grammar,modelManager,kind);
                result.should.deep.equal(grammarJson);
            });

            if (!test.skipGrammar) {
                it('should roundtrip template grammar', async () => {
                    const grammarJson1 = templateMarkTransformer.fromMarkdownTemplate(grammar,modelManager,kind);
                    const grammar1 = { fileName: grammar.fileName, content: templateMarkTransformer.toMarkdownTemplate(grammarJson1) };
                    const result = templateMarkTransformer.fromMarkdownTemplate(grammar1,modelManager,kind);
                    result.should.deep.equal(grammarJson1);
                });
            }

            it('should parse sample', async () => {
                const result = templateMarkTransformer.fromMarkdownCicero(sample,grammar,modelManager,kind,currentTime,0);
                if (kind === 'clause') {
                    delete data.clauseId;
                    delete data.$identifier;
                    delete result.clauseId;
                    delete result.$identifier;
                } else {
                    delete data.contractId;
                    delete data.$identifier;
                    delete result.contractId;
                    delete result.$identifier;
                    for(const key in data) {
                        delete data[key].clauseId;
                        delete data[key].$identifier;
                    }
                    for(const key in result) {
                        delete result[key].clauseId;
                        delete result[key].$identifier;
                    }
                }
                result.should.deep.equal(data);
            });

            it('should draft sample back (roundtrip)', async () => {
                const cm = templateMarkTransformer.instantiateCiceroMark(data,grammarJson,modelManager,kind,currentTime, 0);
                const cmUnwrapped = ciceroMarkTransformer.toCiceroMarkUnwrapped(cm);
                const result = ciceroMarkTransformer.toMarkdownCicero(cmUnwrapped);
                const expected = normalizeToMarkdownCicero(normalizeFromMarkdownCicero(sample.content));
                result.should.equal(expected);
            });
        });
    }
}

/**
 * Run parse failures tests workload
 * @param {*} tests - the tests to run
 */
function runParseFailures(tests) {
    for (const test of tests) {
        const name = test.name;
        const desc = test.desc;
        const kind = test.kind;
        const error = test.error;

        const grammar = loadFile(`./test/data/${name}/grammar.tem.md`);
        const model = `./test/data/${name}/model.cto`;
        const sample =  loadFile(`./test/data/${name}/sample.md`);

        describe(`#${name} [${desc}]`, function () {
            let modelManager;
            before(async () => {
                modelManager = await ModelLoader.loadModelManager([model]);
            });

            it('should fail to parse sample', async () => {
                (() => (new TemplateMarkTransformer()).fromMarkdownCicero(sample,grammar,modelManager,kind)).should.throw(error);
            });
        });
    }
}

/**
 * Run template failures tests workload
 * @param {*} tests - the tests to run
 */
function runTemplateFailures(tests) {
    for (const test of tests) {
        const name = test.name;
        const desc = test.desc;
        const kind = test.kind;
        const error = test.error;

        const grammar = loadFile(`./test/data/${name}/grammar.tem.md`);
        const model = `./test/data/${name}/model.cto`;

        describe(`#${name} [${desc}]`, function () {
            let modelManager;
            before(async () => {
                modelManager = await ModelLoader.loadModelManager([model]);
            });

            it('should fail to parse template', async () => {
                (() => (new TemplateMarkTransformer()).fromMarkdownTemplate(grammar,modelManager,kind)).should.throw(error);
            });
        });
    }
}

describe('#TemplateMarkTransformer [Template Failure]', () => {
    runTemplateFailures(templateFailures);
});

describe('#TemplateMarkTransformer [Parse Success]', () => {
    runSuccesses(successes);
});

describe('#TemplateMarkTransformer [Parse Failure]', () => {
    runParseFailures(parseFailures);
});
