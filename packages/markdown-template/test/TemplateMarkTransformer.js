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

// Parser from template AST
const ModelLoader = require('@accordproject/concerto-core').ModelLoader;
const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const TemplateMarkTransformer = require('../lib/TemplateMarkTransformer');

const normalizeToMarkdown = require('../lib/normalize').normalizeToMarkdown;
const normalizeFromMarkdown = require('../lib/normalize').normalizeFromMarkdown;

const loadFile = (x) => { return { fileName: x, content: fs.readFileSync(x, 'utf8') }; };
const loadPlugin = (x) => {
    return fs.existsSync(x) ? require(path.join('..',x)) : {};
};

const successes = [
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
    {name:'testFormula',kind:'contract'},
    {name:'testDateTime',kind:'clause'},
    {name:'testDateTime2',kind:'clause'},
    {name:'testDateTime3',kind:'clause'},
    {name:'testAmount',kind:'clause'},
    {name:'testAmount2',kind:'clause'},
    {name:'testMonetaryAmount',kind:'clause'},
    {name:'testMonetaryAmount2',kind:'clause'},
    {name:'testMonetaryAmount3',kind:'clause'},
    {name:'testLarge',kind:'contract'},
    {name:'testRepeat',kind:'clause'},
    {name:'testMd1',kind:'clause'},
    {name:'testMd2',kind:'contract'},
    {name:'testMd3',kind:'contract'},
    {name:'testMd4',kind:'clause'},
    {name:'testHeading',kind:'clause'},
    {name:'testUList',kind:'contract'},
    {name:'testOList',kind:'contract'},
    {name:'testOList2',kind:'contract'},
    {name:'testJoin',kind:'contract'},
    {name:'testWith',kind:'contract'},
    {name:'testConditional',kind:'clause'},
    {name:'testUnderscore',kind:'clause'},
    {name:'alltypes',kind:'clause'},
    {name:'acceptance-of-delivery',kind:'clause'},
    {name:'conga',kind:'clause'},
    {name:'empty',kind:'clause'},
    {name:'helloworld',kind:'clause'},
    {name:'installment-sale',kind:'contract'},
    {name:'ip-payment',kind:'clause'},
    {name:'latedeliveryandpenalty',kind:'contract'},
    {name:'signature-name-date',kind:'clause'},
];

const templateFailures = [
    {name:'templateErr1',desc:'duplicate contract',kind:'contract','error':'Found multiple instances of org.accordproject.cicero.contract.AccordContract. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordContract.'},
    {name:'templateErr2',desc:'duplicate clause',kind:'clause','error':'Failed to find an asset that extends org.accordproject.cicero.contract.AccordClause. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.'},
    {name:'templateErr2',desc:'duplicate contract',kind:'contract','error':'Failed to find an asset that extends org.accordproject.cicero.contract.AccordContract. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordContract.'},
    {name:'templateErr3',desc:'missing clause property',kind:'clause','error':'Unknown property seller'},
    {name:'templateErr4',desc:'missing contract property',kind:'contract','error':'Unknown property agreement'},
    {name:'templateErr5',desc:'missing with property',kind:'contract','error':'Unknown property sellerAddress'},
    {name:'templateErr6',desc:'missing with property',kind:'contract','error':'Unknown property prices'},
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
    {name:'errFormula',desc:'inconsistent variables',kind:'contract','error':'Parse error at line 8 column 11\nAnd this: {something something}} is a computed value.\n          ^^^^^^^^^^^'},
    {name:'errDateTime',desc:'',kind:'clause','error':'Parse error at line 1 column 73\nThis is a contract between "Steve" and "Betty" for the amount of 3131.0 GRR, even in the presence of force majeure.'},
    {name:'errLarge',desc:'',kind:'contract','error':'Parse error at line 804 column 40\nThis is a contract between "Steve" and Betty" for the amount of 3131.0 EUR.'},
    {name:'errRepeat',desc:'inconsistent variables',kind:'clause','error':'Inconsistent values for variable seller: Steve and Betty'},
];

/**
 * Run positive tests workload
 */
function runSuccesses() {
    // This tests custom extension to the parser
    const commonMarkTransformer = new CommonMarkTransformer();

    for (const test of successes) {
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
                modelManager = await ModelLoader.loadModelManager(null,[model]);
            });

            it('should create template mark', async () => {
                const result = templateMarkTransformer.fromMarkdownTemplate(grammar,modelManager,kind);
                result.should.deep.equal(grammarJson);
            });

            it('should parse sample', async () => {
                const result = templateMarkTransformer.fromMarkdown(sample,grammar,modelManager,kind);
                if (kind === 'clause') {
                    delete data.clauseId;
                    delete result.clauseId;
                } else {
                    delete data.contractId;
                    delete result.contractId;
                    for(const key in data) {
                        delete data[key].clauseId;
                    }
                    for(const key in result) {
                        delete result[key].clauseId;
                    }
                }
                result.should.deep.equal(data);
            });

            it('should draft sample back (roundtrip)', async () => {
                const cm = templateMarkTransformer.instantiateCommonMark(data,grammarJson,modelManager,kind);
                const result = commonMarkTransformer.toMarkdown(cm);
                const expected = normalizeToMarkdown(normalizeFromMarkdown(sample.content));
                result.should.equal(expected);
            });
        });
    }
}

/**
 * Run parse failures tests workload
 */
function runParseFailures() {
    for (const test of parseFailures) {
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
                modelManager = await ModelLoader.loadModelManager(null,[model]);
            });

            it('should fail to parse sample', async () => {
                (() => (new TemplateMarkTransformer()).fromMarkdown(sample,grammar,modelManager,kind)).should.throw(error);
            });
        });
    }
}

/**
 * Run template failures tests workload
 */
function runTemplateFailures() {
    for (const test of templateFailures) {
        const name = test.name;
        const desc = test.desc;
        const kind = test.kind;
        const error = test.error;

        const grammar = loadFile(`./test/data/${name}/grammar.tem.md`);
        const model = `./test/data/${name}/model.cto`;

        describe(`#${name} [${desc}]`, function () {
            let modelManager;
            before(async () => {
                modelManager = await ModelLoader.loadModelManager(null,[model]);
            });

            it('should fail to parse template', async () => {
                (() => (new TemplateMarkTransformer()).fromMarkdownTemplate(grammar,modelManager,kind)).should.throw(error);
            });
        });
    }
}

describe('#TemplateMarkTransformer [Template Failure]', () => {
    runTemplateFailures();
});

describe('#TemplateMarkTransformer [Parse Success]', () => {
    runSuccesses();
});

describe('#TemplateMarkTransformer [Parse Failure]', () => {
    runParseFailures();
});
