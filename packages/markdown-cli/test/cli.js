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

const Commands = require('../lib/Commands');

describe('markdown-cli', () => {
    const sample = path.resolve(__dirname, 'data', 'acceptance.md');
    const sampleExpectedJson = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.json'), 'utf8');
    const sampleExpectedCiceroMark = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-cicero.json'), 'utf8');
    const sampleExpectedSlate = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-slate.json'), 'utf8');
    const sampleExpectedText = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-roundtrip.md'), 'utf8');

    describe('#parse', () => {
        it('should parse a markdown file to CommonMark', async () => {
            const options = {};
            options.roundtrip = false;
            options.cicero = false;
            options.slate = false;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(JSON.parse(sampleExpectedJson)));
        });

        it('should parse a markdown file to CiceroMark', async () => {
            const options = {};
            options.roundtrip = false;
            options.cicero = true;
            options.slate = false;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(JSON.parse(sampleExpectedCiceroMark)));
        });

        it('should parse a markdown file to Slate', async () => {
            const options = {};
            options.roundtrip = false;
            options.cicero = false;
            options.slate = true;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            JSON.stringify(JSON.parse(result)).should.eql(JSON.stringify(JSON.parse(sampleExpectedSlate)));
        });
    });

    describe('#generateMarkdown', () => {
        it('should generate the text for a markdown file', async () => {
            const options = {};
            options.roundtrip = true;
            options.cicero = false;
            options.slate = false;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            result.should.eql(sampleExpectedText);
        });
    });
});
