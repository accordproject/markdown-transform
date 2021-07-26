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

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

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
const acceptanceModelFile =  path.resolve(__dirname, 'data/acceptance', 'model.cto');
const acceptanceMarkdownFile = path.resolve(__dirname, 'data/acceptance', 'sample.md');
const acceptanceMarkdown = normalizeNLs(fs.readFileSync(acceptanceMarkdownFile, 'utf8'));
const acceptanceMarkdownCiceroFile = path.resolve(__dirname, 'data/acceptance', 'sample_cicero.md');
const acceptanceMarkdownCicero = normalizeNLs(fs.readFileSync(acceptanceMarkdownCiceroFile, 'utf8'));
const acceptanceCommonMarkFile = path.resolve(__dirname, 'data/acceptance', 'commonmark.json');
const acceptanceCiceroMarkFile = path.resolve(__dirname, 'data/acceptance', 'ciceromark.json');
const acceptanceCiceroMark = JSON.parse(fs.readFileSync(acceptanceCiceroMarkFile, 'utf8'));
const acceptanceCiceroMarkParsedFile = path.resolve(__dirname, 'data/acceptance', 'ciceromark_parsed.json');
const acceptanceCiceroMarkParsed = JSON.parse(fs.readFileSync(acceptanceCiceroMarkParsedFile, 'utf8'));
const acceptanceSlateFile = path.resolve(__dirname, 'data/acceptance', 'slate.json');
const acceptanceSlate = JSON.parse(fs.readFileSync(acceptanceSlateFile, 'utf8'));

describe('#validateTransformArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateTransformArgs({
            _: ['transform'],
        });
        args.input.should.match(/input.md$/);
    });
    it('no args specified (verbose)', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateTransformArgs({
            _: ['transform'],
            verbose: true
        });
        args.input.should.match(/input.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateTransformArgs({
            _: ['transform'],
            input: 'input.md'
        });
        args.input.should.match(/input.md$/);
    });
    it('bad input.md', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateTransformArgs({
            _: ['transform'],
            input: 'input_en.md'
        })).should.throw('A input.md file is required. Try the --input flag or create a input.md.');
    });
});

describe('markdown-cli (acceptance)', () => {
    let parameters;
    beforeEach(async () => {
        parameters = { template: acceptanceGrammarFile, model: [acceptanceModelFile], templateKind: 'contract' };
    });

    describe('#parse', () => {
        it('should parse a markdown cicero file to CiceroMark', async () => {
            const result = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', [], 'ciceromark', null, {}, {});
            result.should.equal(JSON.stringify(acceptanceCiceroMark));
        });

        it('should parse a markdown cicero file to CiceroMark (verbose)', async () => {
            const result = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', [], 'ciceromark', null, {}, {verbose:true});
            result.should.equal(JSON.stringify(acceptanceCiceroMark));
        });

        it('should parse a markdown file to CiceroMark', async () => {
            const result = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', ['data'], 'ciceromark_parsed', null, parameters, {});
            result.should.deep.equal(JSON.stringify(acceptanceCiceroMarkParsed));
        });

        it('should parse a markdown cicero file to Slate', async () => {
            const result = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', ['data'], 'slate', null, parameters, {});
            result.should.deep.equal(JSON.stringify(acceptanceSlate));
        });
    });

    describe('#draft', () => {
        it('should generate a markdown file from CommonMark', async () => {
            const result = await Commands.transform(acceptanceCommonMarkFile, 'commonmark', [], 'markdown', null, {}, {});
            result.should.eql(acceptanceMarkdown);
        });

        it('should generate a markdown cicero file from CiceroMark', async () => {
            const result = await Commands.transform(acceptanceCiceroMarkParsedFile, 'ciceromark', [], 'markdown_cicero', null, {}, {});
            result.should.eql(acceptanceMarkdownCicero);
        });

        it('should generate a markdown cicero file from Slate', async () => {
            const result = await Commands.transform(acceptanceSlateFile, 'slate', [], 'markdown_cicero', null, {}, {});
            result.should.eql(acceptanceMarkdownCicero);
        });
    });

    describe('#normalize', () => {
        it('should roundtrip commonmark <-> markdown', async () => {
            const result = await Commands.transform(acceptanceMarkdownFile, 'markdown', [], 'commonmark', null, {}, {roundtrip:true});
            result.should.eql(acceptanceMarkdown);
        });
    });
});

describe('markdown-cli (docx)', () => {
    // Acceptance test
    const inputDocx = path.resolve(__dirname, 'data', 'sample-service-level-agreement.docx');
    const inputExpectedDocxText = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data', 'sample-service-level-agreement.md'),'utf8'));

    describe('#parse', () => {
        it('should generate a markdown file from docx', async () => {
            const result = await Commands.transform(inputDocx, 'docx', [], 'markdown', null, {}, {});
            result.should.eql(inputExpectedDocxText);
        });
    });
});

describe('markdown-cli (ooxml)', () => {
    // Partial Acceptance test
    const inputOOXMLFile = path.resolve(__dirname, 'data/acceptance', 'omitted-acceptance-of-delivery.xml');
    const inputCiceroMarkFile = path.resolve(__dirname, 'data/acceptance', 'omitted-acceptance-of-delivery.json');

    describe('#parse', () => {
        it('should roundtrip ooxml <-> ciceromark_parsed ', async () => {
            const result = await Commands.transform(inputOOXMLFile, 'ooxml', [], 'ciceromark_parsed', null, {}, { roundtrip: true });
            result.should.equal(fs.readFileSync(inputOOXMLFile, 'utf-8'));
        });
        it('should roundtrip ciceromark_parsed <-> ooxml', async () => {
            const result = await Commands.transform(inputCiceroMarkFile, 'ciceromark_parsed', [], 'ooxml', null, {}, { roundtrip: true });
            JSON.parse(result).should.deep.eql(JSON.parse(fs.readFileSync(inputCiceroMarkFile, 'utf-8')));
        });
    });
});

