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
import { TransformEngine } from './transformEngine';
import builtinTransformationGraph from './builtinTransforms';

function normalizeNLs(input: string): string {
    return input.replace(/\r/gm, '');
}

const wordcount = {
    format: {
        name: 'wordcount',
        docs: 'A number of words',
        fileFormat: 'utf8',
    },
    transforms: {
        plaintext: {
            wordcount: (input: string) => {
                const count = input.split(' ').length;
                return '' + count;
            },
        },
    },
};

const acceptanceMarkdown = normalizeNLs(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'data', 'acceptance', 'sample.md'), 'utf8'));
const acceptanceCommonMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'data', 'acceptance', 'commonmark.json'), 'utf8'));

describe('#transformationEngine', () => {
    describe('#create', () => {
        it('should create a new transformation engine', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(engine.getAllFormats().length).toBe(14);
        });
    });

    describe('#introspect', () => {
        it('should introspect the existing transforms', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(engine.getAllFormats().length).toBe(14);
            const format = engine.formatDescriptor('commonmark');
            expect(format.fileFormat).toBe('json');
            const targets = engine.getAllTargetFormats('commonmark');
            expect(targets).toEqual(['markdown', 'ciceromark', 'plaintext']);
        });

        it('should throw for a non existing format', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(() => engine.formatDescriptor('foo')).toThrow('Unknown format: foo');
            expect(() => engine.getAllTargetFormats('foo')).toThrow('Unknown format: foo');
        });
    });

    describe('#transform', () => {
        it('should transform between two valid formats', async () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            const result = await engine.transform(acceptanceMarkdown, 'markdown', ['commonmark']);
            expect(result).toEqual(acceptanceCommonMark);
        });
    });

    describe('#extension', () => {
        it('should create new format and transform', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.registerExtension(wordcount);
            expect(engine.getAllFormats().length).toBe(15);
        });

        it('should transform between an existing and new format', async () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            engine.registerExtension(wordcount);
            const result = await engine.transform(acceptanceMarkdown, 'markdown', ['wordcount']);
            expect(result).toBe('97');
        });

        it('should throw when adding an existing format', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(() => engine.registerFormat('commonmark', 'another commonmark', 'not text')).toThrow('Format already exists: commonmark');
        });

        it('should throw when creating a transform for a source that does not exist', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(() => engine.registerTransformation('foo', 'plaintext', () => true)).toThrow('Unknown format: foo');
        });

        it('should throw when creating a transform for a target that does not exist', () => {
            const engine = new TransformEngine(builtinTransformationGraph);
            expect(() => engine.registerTransformation('plaintext', 'foo', () => true)).toThrow('Unknown format: foo');
        });
    });
});
