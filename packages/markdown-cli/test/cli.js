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

describe('#validateParseArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
        });
        args.sample.should.match(/sample.md$/);
    });
    it('no args specified (verbose)', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            verbose: true
        });
        args.sample.should.match(/sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            sample: 'sample.md'
        });
        args.sample.should.match(/sample.md$/);
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateParseArgs({
            _: ['parse'],
            sample: 'sample_en.md'
        })).should.throw('A sample.md file is required. Try the --sample flag or create a sample.md.');
    });
});

describe('#validateDraftArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
        });
        args.data.should.match(/data.json$/);
    });
    it('no args specified (verbose)', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            verbose: true
        });
        args.data.should.match(/data.json$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            data: 'data.json'
        });
        args.data.should.match(/data.json$/);
    });
    it('bad data.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateDraftArgs({
            _: ['draft'],
            data: 'data_en.md'
        })).should.throw('A data.json file is required. Try the --data flag or create a data.json.');
    });
});

describe('#validateNormalizeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
        });
        args.sample.should.match(/sample.md$/);
    });
    it('no args specified (verbose)', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            verbose: true
        });
        args.sample.should.match(/sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            sample: 'sample.md'
        });
        args.sample.should.match(/sample.md$/);
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
            sample: 'sample_en.md'
        })).should.throw('A sample.md file is required. Try the --sample flag or create a sample.md.');
    });
});

describe('markdown-cli', () => {
    const sample = path.resolve(__dirname, 'data', 'acceptance.md');
    const sampleExpected = path.resolve(__dirname, 'data', 'acceptance.json');
    const sampleExpectedJson = JSON.parse(fs.readFileSync(sampleExpected, 'utf8'));
    const sampleExpectedCiceroMark = path.resolve(__dirname, 'data', 'acceptance-cicero.json');
    const sampleExpectedCiceroMarkJson = JSON.parse(fs.readFileSync(sampleExpectedCiceroMark, 'utf8'));
    const sampleExpectedSlate = path.resolve(__dirname, 'data', 'acceptance-slate.json');
    const sampleExpectedSlateJson = JSON.parse(fs.readFileSync(sampleExpectedSlate, 'utf8'));
    const sampleExpectedText = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-roundtrip.md'), 'utf8'));

    describe('#parse', () => {
        it('should parse a markdown file to CommonMark', async () => {
            const options = {};
            const result = await Commands.parse(sample, 'commonmark', null, options);
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedJson));
        });

        it('should parse a markdown file to CommonMark (verbose)', async () => {
            const result = await Commands.parse(sample, 'commonmark', null, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedJson));
        });

        it('should parse a markdown file to CiceroMark', async () => {
            const result = await Commands.parse(sample, 'ciceromark', null, {});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedCiceroMarkJson));
        });

        it('should parse a markdown file to CiceroMark (verbose)', async () => {
            const result = await Commands.parse(sample, 'ciceromark', null, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedCiceroMarkJson));
        });

        it('should parse a markdown file to Slate', async () => {
            const result = await Commands.parse(sample, 'slate', null, {});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedSlateJson));
        });

        it('should parse a markdown file to Slate (verbose)', async () => {
            const result = await Commands.parse(sample, 'slate', null, {verbose:true});
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(sampleExpectedSlateJson));
        });
    });

    describe('#draft', () => {
        it('should generate a markdown file from CommonMark', async () => {
            const result = await Commands.draft(sampleExpected, 'commonmark', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should generate a markdown file from CiceroMark', async () => {
            const result = await Commands.draft(sampleExpectedCiceroMark, 'ciceromark', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should generate a markdown file from Slate', async () => {
            const result = await Commands.draft(sampleExpectedSlate, 'slate', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should generate a markdown file from Slate (verbose)', async () => {
            const result = await Commands.draft(sampleExpectedSlate, 'slate', null, {verbose:true});
            result.should.eql(sampleExpectedText);
        });
    });

    describe.only('#normalize', () => {
        it('should CommonMark <> Markdown roundtrip', async () => {
            const result = await Commands.normalize(sample, 'commonmark', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should CiceroMark <> Markdown roundtrip', async () => {
            const result = await Commands.normalize(sample, 'ciceromark', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should Slate <> Markdown roundtrip', async () => {
            const result = await Commands.normalize(sample, 'slate', null, {});
            result.should.eql(sampleExpectedText);
        });

        it('should Slate <> Markdown roundtrip (verbose)', async () => {
            const result = await Commands.normalize(sample, 'slate', null, {verbose:true});
            result.should.eql(sampleExpectedText);
        });
    });
});
