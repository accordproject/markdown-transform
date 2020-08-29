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

const chai = require('chai');
chai.use(require('chai-string'));

const should = chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const ModelLoader = require('@accordproject/concerto-core').ModelLoader;
const normalizeNLs = require('../lib/normalize').normalizeNLs;
const ParserManager = require('../lib/parsermanager');

describe('#constructor', () => {
    it('create a parser manager', async () => {
        const model = './test/data/helloworld/model.cto';
        const modelManager = await ModelLoader.loadModelManager(null,[model]);
        const parserManager = new ParserManager(modelManager,'clause',null,null);
        should.exist(parserManager);
        should.exist(parserManager.getModelManager());
        should.exist(parserManager.getFactory());
    });

    it('build a parser', async () => {
        const model = './test/data/helloworld/model.cto';
        const template = normalizeNLs(fs.readFileSync('./test/data/helloworld/grammar.tem.md', 'utf8'));
        const modelManager = await ModelLoader.loadModelManager(null,[model]);
        const parserManager = new ParserManager(modelManager,'clause',null,null);
        parserManager.setTemplate(template);
        parserManager.getTemplate().should.equal('Name of the person to greet: {{name}}.\nThank you!');
        (() => parserManager.getTemplateMark()).should.throw('Must call buildParser before calling getTemplateMark');
        (() => parserManager.getParser()).should.throw('Must call buildParser before calling getParser');
        parserManager.buildParser();
        should.exist(parserManager.getTemplateMark());
    });

    it('rebuild a parser', async () => {
        const model = './test/data/helloworld/model.cto';
        const template = normalizeNLs(fs.readFileSync('./test/data/helloworld/grammar.tem.md', 'utf8'));
        const modelManager = await ModelLoader.loadModelManager(null,[model]);
        const parserManager = new ParserManager(modelManager,'clause',null,null);
        parserManager.setTemplate(template);
        parserManager.getTemplate().should.equal('Name of the person to greet: {{name}}.\nThank you!');
        (() => parserManager.getTemplateMark()).should.throw('Must call buildParser before calling getTemplateMark');
        (() => parserManager.getParser()).should.throw('Must call buildParser before calling getParser');
        parserManager.buildParser();
        parserManager.buildParser();
        should.exist(parserManager.getTemplateMark());
    });

    it('handle formulas', async () => {
        const model = './test/data/fixed-interests/model.cto';
        const template = normalizeNLs(fs.readFileSync('./test/data/fixed-interests/grammar.tem.md', 'utf8'));
        const modelManager = await ModelLoader.loadModelManager(null,[model]);
        const parserManager = new ParserManager(modelManager,null,'clause',null);
        parserManager.setTemplate(template);
        parserManager.getTemplate().should.equal(`## Fixed rate loan

This is a *fixed interest* loan to the amount of {{loanAmount as "K0,0.00"}}
at the yearly interest rate of {{rate}}%
with a loan term of {{loanDuration}},
and monthly payments of {{% monthlyPaymentFormula(loanAmount,rate,loanDuration) as "K0,0.00" %}}
`);
        parserManager.buildParser();
        parserManager.getFormulas().should.deep.equal([{
            name:'formula_d02c8642fa12d6ed08dea71f0af7a77b0c7893804d0b43b537eb18ea6f666463',
            code:' monthlyPaymentFormula(loanAmount,rate,loanDuration) as "K0,0.00" ',
        }]);
    });

    it('handle multiple formulas', async () => {
        const model = './test/data/testFormula/model.cto';
        const template = normalizeNLs(fs.readFileSync('./test/data/testFormula/grammar.tem.md', 'utf8'));
        const modelManager = await ModelLoader.loadModelManager(null,[model]);
        const parserManager = new ParserManager(modelManager,null,'clause',null);
        parserManager.setTemplateKind('contract');
        parserManager.setTemplate(template);
        parserManager.getTemplate().should.equal(`This is contract text, followed by a clause:

{{#clause agreement}}
This is a contract between {{seller}} and {{buyer}} for the amount of {{amount}} {{currency}}{{#if forceMajeure}}, even in the presence of force majeure{{/if}}.
{{/clause}}

There is a penalty of {{penalty}}% for non compliance.
And this: {{% 3.14+2.98 %}} is a formula
-  And this is another formula in a list {{% firstName ++ " " ++ lastName %}}`);
        parserManager.buildParser();
        parserManager.getFormulas().should.deep.equal([{
            name:'formula_f2fdbcfc705ed55d07f02e6ca8b5a9dc725eef44c32f77e4ce9307626fe09a63',
            code:' 3.14+2.98 ',
        },{
            name:'formula_2906467fe4dc174f6c4bf9b01ea281014784c2a0581868fd5689675e367c362b',
            code:' firstName ++ " " ++ lastName ',
        }]);
    });
});
