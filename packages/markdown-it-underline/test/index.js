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
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const MarkdownIt = require('markdown-it');
const MarkdownItUnderline = require('../lib');
const mdit = new MarkdownIt({html:true}).use(MarkdownItUnderline);

const tests = [
    { 'name' : 'underline1' },
    { 'name' : 'underline2' },
    { 'name' : 'underlineNot1' },
    { 'name' : 'underlineNot2' },
    { 'name' : 'underlineLone' },
];

/**
 * Run positive tests workload
 */
function runTests() {

    for (const test of tests) {
        const name = test.name;
        const markdown = fs.readFileSync(path.join('./test/data',name + '.md'), 'utf8');
        const json = JSON.parse(fs.readFileSync(path.join('./test/data',name + '.json'), 'utf8'));
        const html = fs.readFileSync(path.join('./test/data',name + '.html'), 'utf8');

        describe('#parse (' + name + ')', () => {
            it('should parse to a token stream', async () => {
                const tokens = mdit.parse(markdown,{});
                const result = JSON.parse(JSON.stringify(tokens));
                result.should.deep.equal(json);
            });
        });

        describe('#render (' + name + ')', () => {
            it('should render to HTML', async () => {
                const result = mdit.render(markdown,{});
                result.should.equal(html.replace(/\r/gm,''));
            });
        });
    }
}

describe('#markdown-it-underline', () => {
    runTests();
});

