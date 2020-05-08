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

describe('markdown-cli', () => {
    const input = path.resolve(__dirname, 'data', 'acceptance.md');
    const inputDocx = path.resolve(__dirname, 'data', 'sample-service-level-agreement.docx');
    const inputExpected = path.resolve(__dirname, 'data', 'acceptance.json');
    const inputExpectedDocx = path.resolve(__dirname, 'data', 'sample-service-level-agreement.md');
    const inputExpectedJson = JSON.parse(fs.readFileSync(inputExpected, 'utf8'));
    const inputExpectedCiceroMark = path.resolve(__dirname, 'data', 'acceptance-cicero.json');
    const inputExpectedCiceroMarkJson = JSON.parse(fs.readFileSync(inputExpectedCiceroMark, 'utf8'));
    const inputExpectedSlate = path.resolve(__dirname, 'data', 'acceptance-slate.json');
    const inputExpectedSlateJson = JSON.parse(fs.readFileSync(inputExpectedSlate, 'utf8'));
    const inputExpectedText = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-roundtrip.md'), 'utf8'));
    const inputExpectedDocxText = normalizeNLs(fs.readFileSync(inputExpectedDocx,'utf8'));

    describe('#parse', () => {
        it('should parse a markdown file to CommonMark', async () => {
            const options = {};
            const parameters = {};
            const result = await Commands.transform(input, 'markdown', 'commonmark', null, parameters, options);
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedJson));
        });

        it('should parse a markdown file to CommonMark (verbose)', async () => {
            const result = await Commands.transform(input, 'markdown', 'commonmark', null, {}, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedJson));
        });

        it('should parse a markdown file to CiceroMark', async () => {
            const result = await Commands.transform(input, 'markdown', 'ciceromark', null, {}, {});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedCiceroMarkJson));
        });

        it('should parse a markdown file to CiceroMark (verbose)', async () => {
            const result = await Commands.transform(input, 'markdown', 'ciceromark', null, {}, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedCiceroMarkJson));
        });

        it('should parse a markdown file to Slate', async () => {
            const result = await Commands.transform(input, 'markdown', 'slate', null, {}, {});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedSlateJson));
        });

        it('should parse a markdown file to Slate (verbose)', async () => {
            const result = await Commands.transform(input, 'markdown', 'slate', null, {}, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(inputExpectedSlateJson));
        });

        it('should generate a markdown file from docx', async () => {
            const result = await Commands.transform(inputDocx, 'docx', 'markdown', null, {}, {});
            result.should.eql(inputExpectedDocxText);
        });
    });

    describe('#draft', () => {
        it('should generate a markdown file from CommonMark', async () => {
            const result = await Commands.transform(inputExpected, 'commonmark', 'markdown', null, {}, {});
            result.should.eql(inputExpectedText);
        });

        it('should generate a markdown file from CiceroMark', async () => {
            const result = await Commands.transform(inputExpectedCiceroMark, 'ciceromark', 'markdown', null, {}, {});
            result.should.eql(inputExpectedText);
        });

        it('should generate a markdown file from Slate', async () => {
            const result = await Commands.transform(inputExpectedSlate, 'slate', 'markdown', null, {}, {});
            result.should.eql(inputExpectedText);
        });

        it('should generate a markdown file from Slate (verbose)', async () => {
            const result = await Commands.transform(inputExpectedSlate, 'slate', 'markdown', null, {}, {verbose:true});
            result.should.eql(inputExpectedText);
        });
    });

    describe('#normalize', () => {
        it('should CommonMark <> Markdown roundtrip', async () => {
            const result = await Commands.transform(input, 'markdown', 'commonmark', null, {}, {roundtrip:true});
            result.should.eql(inputExpectedText);
        });

        it('should CiceroMark <> Markdown roundtrip', async () => {
            const result = await Commands.transform(input, 'markdown', 'ciceromark', null, {}, {roundtrip:true});
            result.should.eql(inputExpectedText);
        });

        it('should Slate <> Markdown roundtrip', async () => {
            const result = await Commands.transform(input, 'markdown', 'slate', null, {}, {roundtrip:true});
            result.should.eql(inputExpectedText);
        });

        it('should Slate <> Markdown roundtrip (verbose)', async () => {
            const result = await Commands.transform(input, 'markdown', 'slate', null, {}, {roundtrip:true,verbose:true});
            result.should.eql(inputExpectedText);
        });
    });
});
