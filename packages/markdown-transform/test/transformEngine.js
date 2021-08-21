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

const { TransformEngine, builtinTransformationGraph } = require('..');

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

// A sample extension
const wordcount = {
    format: {
        name: 'wordcount',
        docs: 'A number of words',
        fileFormat: 'utf8'
    },
    transforms: {
        plaintext: {
            wordcount: ((input, parameters, options) => {
                const count = input.split(' ').length;
                return '' + count;
            }),
        }
    }
};

const acceptanceMarkdown = normalizeNLs(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'sample.md'), 'utf8'));
const acceptanceCommonMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/acceptance', 'commonmark.json'), 'utf8'));

describe('#transformationEngine', () => {
    describe('#create', () => {
        it('should create a new transformation engine', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.getAllFormats().length.should.equal(19);
        });
    });

    describe('#introspect', () => {
        it('should introspect the existing transforms', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.getAllFormats().length.should.equal(19);
            const format = engine.formatDescriptor('commonmark');
            format.fileFormat.should.equal('json');
            const targets = engine.getAllTargetFormats('commonmark');
            targets.should.deep.equal(['markdown', 'ciceromark', 'plaintext']);
        });

        it('should throw for a non existing format', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.getAllFormats().length.should.equal(19);
            (() => engine.formatDescriptor('foo')).should.throw('Unknown format: foo');
            (() => engine.getAllTargetFormats('foo')).should.throw('Unknown format: foo');
        });
    });

    describe('#transform', () => {
        it('should transform between two valid formats', async () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            const result = await engine.transform(acceptanceMarkdown, 'markdown', ['commonmark']);
            result.should.deep.equal(acceptanceCommonMark);
        });
    });

    describe('#extension', () => {
        it('should create new format and transform', async () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.registerExtension(wordcount);
            engine.getAllFormats().length.should.equal(20);
        });

        it('should transform between an existing and new format', async () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.registerExtension(wordcount);
            const result = await engine.transform(acceptanceMarkdown, 'markdown', ['wordcount']);
            result.should.equal('97');
        });

        it('should throw when adding an existing format', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            (() => engine.registerFormat('commonmark', 'another commonmark', 'not text')).should.throw('Format already exists: commonmark');
        });

        it('should throw when creating a transform for a source that does not exist', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            (() => engine.registerTransformation('foo', 'plaintext', (() => true))).should.throw('Unknown format: foo');
        });

        it('should throw when creating a transform for a target that does not exist', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            (() => engine.registerTransformation('plaintext', 'foo', (() => true))).should.throw('Unknown format: foo');
        });
    });
});
