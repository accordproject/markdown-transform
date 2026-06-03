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

import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';
import MarkdownItTemplate = require('./index');

const mdit = new MarkdownIt({ html: true }).use(MarkdownItTemplate);

const tests = [
    'inline1',
    'clause1', 'clause2', 'clause3', 'clause4', 'clause5', 'clause6',
    'notclause1', 'notclause2', 'notclause3', 'notclause4', 'notclause5',
    'autoclose1', 'autoclose2', 'autoclose3',
    'all', 'none',
];

const dataDir = path.join(__dirname, '..', 'test', 'data');

describe('#markdown-it-template', () => {
    for (const name of tests) {
        const markdown = fs.readFileSync(path.join(dataDir, name + '.tem.md'), 'utf8');
        const json = JSON.parse(fs.readFileSync(path.join(dataDir, name + '.json'), 'utf8'));
        const html = fs.readFileSync(path.join(dataDir, name + '.html'), 'utf8');

        describe(`#parse (${name})`, () => {
            it('should parse to a token stream', () => {
                const tokens = mdit.parse(markdown, {});
                const result = JSON.parse(JSON.stringify(tokens));
                expect(result).toEqual(json);
            });
        });

        describe(`#render (${name})`, () => {
            it('should render to HTML', () => {
                const result = mdit.render(markdown, {});
                expect(result).toEqual(html.replace(/\r/gm, ''));
            });
        });
    }
});
