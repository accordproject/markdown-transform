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
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

// Basic parser constructors
const normalizeNLs = require('../lib/normalize').normalizeNLs;
const normalizeMarkdown = require('../lib/normalize').normalizeMarkdown;

describe('#normalize', () => {
    describe('#normalizeNLs', () => {
        it('should normalize to \n', async () => {
            normalizeNLs('Hello\r\nWorld!').should.equal('Hello\nWorld!');
        });
    });
    describe('#normalizeMarkdown', () => {
        it('should normalize to \n', async () => {
            normalizeMarkdown('Hello\r\nWorld!').should.equal('Hello\nWorld!');
        });
    });
});
