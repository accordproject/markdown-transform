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

const chai = require('chai');
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const MarkdownIt = require('markdown-it');
const MarkdownItTemplate = require('../lib');
const mdit = new MarkdownIt({html:true}).use(MarkdownItTemplate);

const allMarkdown = Fs.readFileSync('./test/data/all.tem.md', 'utf8');
const allJson = JSON.parse(Fs.readFileSync('./test/data/all.json', 'utf8'));
const allHtml = Fs.readFileSync('./test/data/all.html', 'utf8');

const noneMarkdown = Fs.readFileSync('./test/data/none.tem.md', 'utf8');
const noneJson = JSON.parse(Fs.readFileSync('./test/data/none.json', 'utf8'));
const noneHtml = Fs.readFileSync('./test/data/none.html', 'utf8');

describe('#markdown-it-template', () => {

    describe('#parse', () => {
        it('should parse to a token stream (template markup)', async () => {
            const tokens = mdit.parse(allMarkdown,{});
            const result = JSON.parse(JSON.stringify(tokens));
            result.should.deep.equal(allJson);
        });

        it('should parse to a token stream (not template markup)', async () => {
            const tokens = mdit.parse(noneMarkdown,{});
            const result = JSON.parse(JSON.stringify(tokens));
            result.should.deep.equal(noneJson);
        });
    });

    describe('#render', () => {
        it('should render to HTML (template markup)', async () => {
            const result = mdit.render(allMarkdown,{});
            result.should.equal(allHtml.replace(/\r/gm,''));
        });

        it('should render to HTML (not template markup)', async () => {
            const result = mdit.render(noneMarkdown,{});
            result.should.equal(noneHtml.replace(/\r/gm,''));
        });
    });
});
