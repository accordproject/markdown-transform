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

const chai = require('chai');
const fs = require('fs');
const path = require('path');
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const transform = require('../lib/transform').transform;
const generateTransformationDiagram = require('../lib/transform').generateTransformationDiagram;
const formatDescriptor = require('../lib/transform').formatDescriptor;

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text for the clause
 * @return {string} - the normalized text for the clause
 */
function normalizeNLs(input) {
    // we replace all \r and \n with \n
    let text =  input.replace(/\r/gm,'');
    return text;
}

// Acceptance test
const acceptanceGrammarFile = path.resolve(__dirname, 'data/acceptance', 'grammar.tem.md');
const acceptanceGrammar = normalizeNLs(fs.readFileSync(acceptanceGrammarFile, 'utf8'));
const acceptanceGrammarTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'grammar_tokens.json'), 'utf8'));
const acceptanceModelFile =  path.resolve(__dirname, 'data/acceptance', 'model.cto');
const acceptanceTemplateMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'grammar.json'), 'utf8'));
const acceptanceMarkdown = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'sample.md'), 'utf8'));
const acceptanceMarkdownCicero = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'sample_cicero.md'), 'utf8'));
const acceptanceCiceroEdit = fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'ciceroedit.md'), 'utf8');
const acceptanceCommonMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'commonmark.json'), 'utf8'));
const acceptanceCiceroMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'ciceromark.json'), 'utf8'));
const acceptanceCiceroMarkParsed = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'ciceromark_parsed.json'), 'utf8'));
const acceptanceCiceroMarkUnwrapped = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'ciceromark_unwrapped.json'), 'utf8'));
const acceptanceCiceroMarkUnquoted = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'ciceromark_unquoted.json'), 'utf8'));
const acceptanceSlate = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'slate.json'), 'utf8'));
const acceptancePlainText = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'sample.txt'), 'utf8'));
const acceptanceHtml = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'sample.html'), 'utf8'));

// Sample test
const samplePdf = fs.readFileSync(path.resolve(__dirname, 'data/sample', 'sample.pdf'));
const sampleDocx = fs.readFileSync(path.resolve(__dirname, 'data/sample', 'sample.docx'));
const sampleHtml = fs.readFileSync(path.resolve(__dirname, 'data/sample', 'sample.html'), 'utf8');

describe('#acceptance', () => {
    let parameters;
    before(async () => {
        parameters = { inputFileName: acceptanceGrammar, template: acceptanceGrammar, model: [acceptanceModelFile], templateKind: 'contract' };
    });

    describe('#template', () => {
        it('markdown_template -> templatemark_tokens', async () => {
            const result = await transform(acceptanceGrammar, 'markdown_template', ['templatemark_tokens']);
            // markdown-it seems to keep some non-JSON stuff around so we roundtrip to JSON for comparison
            JSON.parse(JSON.stringify(result)).should.deep.equal(acceptanceGrammarTokens);
        });

        it('markdown_template -> templatemark', async () => {
            const result = await transform(acceptanceGrammar, 'markdown_template', ['templatemark'], parameters);
            result.should.deep.equal(acceptanceTemplateMark);
        });

        it('templatemark -> markdown_template', async () => {
            const result = await transform(acceptanceTemplateMark, 'templatemark', ['markdown_template'], parameters);
            result.should.deep.equal(acceptanceGrammar);
        });
    });

    describe('#markdown', () => {
        it('markdown -> commonmark', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark']);
            result.should.deep.equal(acceptanceCommonMark);
        });

        it('markdown -> commonmark (verbose)', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark'], {}, {verbose: true});
            result.should.deep.equal(acceptanceCommonMark);
        });
    });

    describe('#markdown_cicero', () => {
        it('markdown_cicero -> ciceromark', async () => {
            const result = await transform(acceptanceMarkdownCicero, 'markdown_cicero', ['ciceromark']);
            result.should.deep.equal(acceptanceCiceroMark);
        });

        it('markdown -> commonmark (verbose)', async () => {
            const result = await transform(acceptanceMarkdownCicero, 'markdown_cicero', ['ciceromark'], {}, {verbose: true});
            result.should.deep.equal(acceptanceCiceroMark);
        });
    });

    describe('#commonmark', () => {
        it('commonmark -> markdown', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['markdown'], {}, {});
            result.should.equal(acceptanceMarkdown);
        });

        it('commonmark -> plaintext', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['plaintext'], {}, {});
            result.should.equal(acceptancePlainText);
        });

        it('commonmark -> ciceromark', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['ciceromark'], {}, {});
            result.should.deep.equal(acceptanceCommonMark);
        });
    });

    describe('#plaintext', () => {
        it('plaintext -> markdown', async () => {
            const result = await transform(acceptancePlainText, 'plaintext', ['markdown'], {}, {});
            result.should.equal(acceptancePlainText);
        });
    });

    describe('#ciceromark', () => {
        it('ciceromark -> markdown_cicero', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['markdown_cicero'], {}, {});
            result.should.equal(acceptanceMarkdownCicero);
        });

        it('ciceromark -> commonmark', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark', ['commonmark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

    });

    describe('#ciceromark_parsed', () => {
        it('ciceromark_parsed -> ciceromark_unquoted', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['ciceromark_unquoted'], {}, {});
            result.should.deep.equal(acceptanceCiceroMarkUnquoted);
        });

        it('ciceromark_parsed -> slate', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['slate'], {}, {});
            result.should.deep.equal(acceptanceSlate);
        });

        it('ciceromark_parsed -> html', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['html'], {}, {});
            result.should.equal(acceptanceHtml);
        });

        it('ciceromark_parsed -> html (verbose)', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['html'], {}, {verbose: true});
            result.should.equal(acceptanceHtml);
        });
    });

    describe('#ciceroedit', () => {
        it('ciceroedit -> ciceromark', async () => {
            const result = await transform(acceptanceCiceroEdit, 'ciceroedit', ['ciceromark'], {}, {});
            result.should.deep.equal(acceptanceCiceroMarkUnwrapped);
        });
    });

    describe('#slate', () => {
        it('slate -> ciceromark', async () => {
            const result = await transform(acceptanceSlate, 'slate', ['ciceromark_parsed'], {}, {});
            result.should.deep.equal(acceptanceCiceroMarkParsed);
        });
    });

    describe('#multisteps', () => {
        it('markdown_cicero -> data -> ciceromark', async () => {
            const result = await transform(acceptanceMarkdownCicero, 'markdown_cicero', ['data','ciceromark_parsed'], parameters, {});
            result.should.deep.equal(acceptanceCiceroMarkParsed);
        });

        it('ciceromark -> ciceromark_unquoted -> slate', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark', ['ciceromark_unquoted','slate'], {}, {});
            result.document.object.should.equal('document');
        });

        it('ciceromark -> ciceromark_unquoted -> html', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark', ['ciceromark_unquoted','html'], {}, {});
            result.should.startWith('<html>');
            result.should.not.contain('"Party A"');
        });

    });
});

describe('#template1', () => {
    let parameters;
    before(async () => {
        const grammarFile = './test/data/template1/grammar.tem.md';
        const grammar = fs.readFileSync(grammarFile, 'utf8');
        const model = './test/data/template1/model.cto';
        parameters = { inputFileName: grammarFile, template: grammar, model: [model], templateKind: 'clause' };
    });

    describe('#markdown', () => {
        it('markdown -> data', async () => {
            const sample1File = './test/data/template1/sample.md';
            const sample1 = fs.readFileSync(sample1File, 'utf8');
            const result = await transform(sample1, 'markdown', ['data'], parameters, {});
            result.$class.should.equal('org.test.MyClause');
            result.seller.should.equal('Steve');
        });
    });

    describe('#markdown', () => {
        it('markdown -> data (offline)', async () => {
            const model2 = './test/data/template1/contract.cto';
            const model3 = './test/data/template1/money.cto';
            parameters.model.push(model2);
            parameters.model.push(model3);
            const sample1File = './test/data/template1/sample.md';
            const sample1 = fs.readFileSync(sample1File, 'utf8');
            const result = await transform(sample1, 'markdown', ['data'], parameters, {offline:true});
            result.$class.should.equal('org.test.MyClause');
            result.seller.should.equal('Steve');
        });
    });

    describe('#data', () => {
        it('data -> commonmark', async () => {
            const sample1File = './test/data/template1/sample.md';
            const sample1 = fs.readFileSync(sample1File, 'utf8');
            const data1 = await transform(sample1, 'markdown', ['data'], parameters, {});
            data1.$class.should.equal('org.test.MyClause');
            data1.seller.should.equal('Steve');
            const result = await transform(data1, 'data', ['commonmark'], parameters, {});
            result.nodes[0].$class.should.equal('org.accordproject.commonmark.Paragraph');
        });

        it('data -> ciceromark', async () => {
            const sample1File = './test/data/template1/sample.md';
            const sample1 = fs.readFileSync(sample1File, 'utf8');
            const data1 = await transform(sample1, 'markdown', ['data'], parameters, {});
            data1.$class.should.equal('org.test.MyClause');
            data1.seller.should.equal('Steve');
            const result = await transform(data1, 'data', ['ciceromark'], parameters, {});
            result.nodes[0].$class.should.equal('org.accordproject.commonmark.Paragraph');
        });
    });

});

describe('#sample', () => {
    describe('#pdf', () => {
        it('pdf -> ciceromark', async () => {
            const result = await transform(samplePdf, 'pdf', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('pdf -> ciceromark (verbose)', async () => {
            const result = await transform(samplePdf, 'pdf', ['ciceromark'], {}, {verbose: true});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('ciceromark -> pdf', async () => {
            const ciceroMark = await transform(samplePdf, 'pdf', ['ciceromark'], {}, {});
            const result = await transform(ciceroMark, 'ciceromark', ['pdf'], {}, {});
            //console.log('RESULT ' + result);
            result.should.exist;
        });
    });

    describe('#docx', () => {
        it('docx -> ciceromark', async () => {
            const result = await transform(sampleDocx, 'docx', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#html', () => {
        it('html -> ciceromark', async () => {
            const result = await transform(sampleHtml, 'html', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

});

describe('#generateTransformationDiagram', () => {
    it('converts graph to PlantUML diagram', () => {
        const result = generateTransformationDiagram();
        result.trim().should.startWith('@startuml');
    });
});

describe('#formatDescriptor', () => {
    it('Lookup valid format', () => {
        const result = formatDescriptor('commonmark');
        result.fileFormat.should.equal('json');
    });

    it('Lookup invalid format', () => {
        (() => formatDescriptor('foobar')).should.throw('Unknown format foobar');
    });
});
