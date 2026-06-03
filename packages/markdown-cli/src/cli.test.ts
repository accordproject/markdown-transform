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
import { Commands } from './commands';

function normalizeNLs(input: string): string {
    return input.replace(/\r/gm, '');
}

function loadModels(dir: string): string[] {
    const files = fs.readdirSync(dir);
    const ctoFiles = files.filter((file) => path.extname(file) === '.cto');
    return ctoFiles.map((file) => path.join(dir, file));
}

const dataDir = path.resolve(__dirname, '..', 'test', 'data');
const acceptanceGrammarFile = path.resolve(dataDir, 'acceptance', 'grammar.tem.md');
const acceptanceModelDir = path.resolve(dataDir, 'acceptance');
const acceptanceMarkdownFile = path.resolve(dataDir, 'acceptance', 'sample.md');
const acceptanceMarkdown = normalizeNLs(fs.readFileSync(acceptanceMarkdownFile, 'utf8'));
const acceptanceMarkdownCiceroFile = path.resolve(dataDir, 'acceptance', 'sample_cicero.md');
const acceptanceMarkdownCicero = normalizeNLs(fs.readFileSync(acceptanceMarkdownCiceroFile, 'utf8'));
const acceptanceCommonMarkFile = path.resolve(dataDir, 'acceptance', 'commonmark.json');
const acceptanceCiceroMarkFile = path.resolve(dataDir, 'acceptance', 'ciceromark.json');
const acceptanceCiceroMark = JSON.parse(fs.readFileSync(acceptanceCiceroMarkFile, 'utf8'));
const acceptanceCiceroMarkParsedFile = path.resolve(dataDir, 'acceptance', 'ciceromark_parsed.json');

describe('#validateTransformArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir));
        const args = Commands.validateTransformArgs({
            _: ['transform'],
        });
        expect(args.input).toMatch(/input.md$/);
    });
    it('no args specified (verbose)', () => {
        process.chdir(path.resolve(dataDir));
        const args = Commands.validateTransformArgs({
            _: ['transform'],
            verbose: true,
        });
        expect(args.input).toMatch(/input.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(dataDir));
        const args = Commands.validateTransformArgs({
            _: ['transform'],
            input: 'input.md',
        });
        expect(args.input).toMatch(/input.md$/);
    });
    it('bad input.md', () => {
        process.chdir(path.resolve(dataDir));
        expect(() => Commands.validateTransformArgs({
            _: ['transform'],
            input: 'input_en.md',
        })).toThrow('A input.md file is required. Try the --input flag or create a input.md.');
    });
});

describe('markdown-cli (acceptance)', () => {
    let parameters: any;
    beforeEach(() => {
        const models = loadModels(acceptanceModelDir);
        parameters = { template: acceptanceGrammarFile, model: models, templateKind: 'contract' };
    });

    describe('#markdown_parse', () => {
        it('should parse a markdown cicero file to CiceroMark', async () => {
            const { result } = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', [], 'ciceromark', null, {}, {});
            expect(result).toBe(JSON.stringify(acceptanceCiceroMark));
        });

        it('should parse a markdown cicero file to CiceroMark (verbose)', async () => {
            const { result } = await Commands.transform(acceptanceMarkdownCiceroFile, 'markdown_cicero', [], 'ciceromark', null, {}, { verbose: true });
            expect(result).toBe(JSON.stringify(acceptanceCiceroMark));
        });
    });

    describe('#draft', () => {
        it('should generate a markdown file from CommonMark', async () => {
            const { result } = await Commands.transform(acceptanceCommonMarkFile, 'commonmark', [], 'markdown', null, {}, {});
            expect(result).toEqual(acceptanceMarkdown);
        });

        it('should generate a markdown cicero file from CiceroMark', async () => {
            const { result } = await Commands.transform(acceptanceCiceroMarkParsedFile, 'ciceromark', [], 'markdown_cicero', null, {}, {});
            expect(result).toEqual(acceptanceMarkdownCicero);
        });
    });

    describe('#normalize', () => {
        it('should roundtrip commonmark <-> markdown', async () => {
            const { result } = await Commands.transform(acceptanceMarkdownFile, 'markdown', [], 'commonmark', null, {}, { roundtrip: true });
            expect(result).toEqual(acceptanceMarkdown);
        });
    });
});
