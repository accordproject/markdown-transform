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
const acceptanceMd = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.md'), 'utf8');
const acceptanceJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.json'), 'utf8'));

describe('#transform', () => {

    describe('#markdown', () => {
        it('markdown -> commonmark', () => {
            const result = transform(acceptanceMd, 'ciceroedit', ['commonmark']);
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#commonmark', () => {
        it('commonmark -> markdown', () => {
            const result = transform(acceptanceJson, 'commonmark', ['markdown']);
            result.should.startWith('Heading');
        });

        it('commonmark -> ciceromark', () => {
            const result = transform(acceptanceJson, 'commonmark', ['ciceromark']);
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('commonmark -> plaintext', () => {
            const result = transform(acceptanceJson, 'commonmark', ['plaintext']);
            result.should.startWith('Heading');
        });
    });

    describe('#ciceroedit', () => {
        it('ciceroedit -> ciceromark_noquotes', () => {
            const result = transform(acceptanceMd, 'ciceroedit', ['ciceromark_noquotes']);
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#multi', () => {
        it('ciceroedit -> ciceromark_noquotes -> slate', () => {
            const result = transform(acceptanceMd, 'ciceroedit', ['ciceromark_noquotes','slate']);
            result.object.should.equal('value');
        });
    });

});


describe('#generateTransformationDiagram', () => {
    it('converts graph to PlantUML diagram', () => {
        const result = generateTransformationDiagram();
        result.trim().should.startWith('// Automatically generated. Do not edit!');
    });
});

