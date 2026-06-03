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
import { CommonMarkModel } from '@accordproject/markdown-common';
import { transform, generateTransformationDiagram, formatDescriptor } from './transform';

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
const acceptanceGrammar = normalizeNLs(fs.readFileSync(acceptanceGrammarFile, 'utf8'));
const acceptanceGrammarTokens = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'grammar_tokens.json'), 'utf8'));
const acceptanceModelDir = path.resolve(dataDir, 'acceptance');
const acceptanceTemplateMark = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'grammar.json'), 'utf8'));
const acceptanceMarkdown = normalizeNLs(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'sample.md'), 'utf8'));
const acceptanceMarkdownCicero = normalizeNLs(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'sample_cicero.md'), 'utf8'));
const acceptanceCiceroEdit = fs.readFileSync(path.resolve(dataDir, 'acceptance', 'ciceroedit.md'), 'utf8');
const acceptanceCommonMark = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'commonmark.json'), 'utf8'));
const acceptanceCiceroMark = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'ciceromark.json'), 'utf8'));
const acceptanceCiceroMarkParsed = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'ciceromark_parsed.json'), 'utf8'));
const acceptanceCiceroMarkUnwrapped = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'ciceromark_unwrapped.json'), 'utf8'));
const acceptanceCiceroMarkUnquoted = JSON.parse(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'ciceromark_unquoted.json'), 'utf8'));
const acceptancePlainText = normalizeNLs(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'sample.txt'), 'utf8'));
const acceptanceHtml = normalizeNLs(fs.readFileSync(path.resolve(dataDir, 'acceptance', 'sample.html'), 'utf8'));

const sampleHtml = fs.readFileSync(path.resolve(dataDir, 'sample', 'sample.html'), 'utf8');

describe('#acceptance', () => {
    let parameters: any;
    beforeAll(() => {
        const models = loadModels(acceptanceModelDir);
        parameters = { inputFileName: acceptanceGrammar, template: acceptanceGrammar, model: models, templateKind: 'contract' };
    });

    describe('#template', () => {
        it('markdown_template -> templatemark_tokens', async () => {
            const result = await transform(acceptanceGrammar, 'markdown_template', ['templatemark_tokens']);
            expect(JSON.parse(JSON.stringify(result))).toEqual(acceptanceGrammarTokens);
        });

        it('markdown_template -> templatemark', async () => {
            const result = await transform(acceptanceGrammar, 'markdown_template', ['templatemark'], parameters);
            expect(result).toEqual(acceptanceTemplateMark);
        });

        it('templatemark -> markdown_template', async () => {
            const result = await transform(acceptanceTemplateMark, 'templatemark', ['markdown_template'], parameters);
            expect(result).toEqual(acceptanceGrammar);
        });
    });

    describe('#markdown', () => {
        it('markdown -> commonmark', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark']);
            expect(result).toEqual(acceptanceCommonMark);
        });

        it('markdown -> commonmark (verbose)', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark'], {}, { verbose: true });
            expect(result).toEqual(acceptanceCommonMark);
        });
    });

    describe('#markdown_cicero', () => {
        it('markdown_cicero -> ciceromark', async () => {
            const result = await transform(acceptanceMarkdownCicero, 'markdown_cicero', ['ciceromark']);
            expect(result).toEqual(acceptanceCiceroMark);
        });

        it('markdown_cicero -> ciceromark (verbose)', async () => {
            const result = await transform(acceptanceMarkdownCicero, 'markdown_cicero', ['ciceromark'], {}, { verbose: true });
            expect(result).toEqual(acceptanceCiceroMark);
        });
    });

    describe('#commonmark', () => {
        it('commonmark -> markdown', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['markdown'], {}, {});
            expect(result).toBe(acceptanceMarkdown);
        });

        it('commonmark -> plaintext', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['plaintext'], {}, {});
            expect(result).toBe(acceptancePlainText);
        });

        it('commonmark -> ciceromark', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['ciceromark'], {}, {});
            expect(result).toEqual(acceptanceCommonMark);
        });
    });

    describe('#plaintext', () => {
        it('plaintext -> markdown', async () => {
            const result = await transform(acceptancePlainText, 'plaintext', ['markdown'], {}, {});
            expect(result).toBe(acceptancePlainText);
        });
    });

    describe('#ciceromark', () => {
        it('ciceromark -> markdown_cicero', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['markdown_cicero'], {}, {});
            expect(result).toBe(acceptanceMarkdownCicero);
        });

        it('ciceromark -> commonmark', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark', ['commonmark'], {}, {});
            expect(result.$class).toBe(`${CommonMarkModel.NAMESPACE}.Document`);
        });
    });

    describe('#ciceromark_parsed', () => {
        it('ciceromark_parsed -> ciceromark_unquoted', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['ciceromark_unquoted'], {}, {});
            expect(result).toEqual(acceptanceCiceroMarkUnquoted);
        });

        it('ciceromark_parsed -> html', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['html'], {}, {});
            expect(result).toBe(acceptanceHtml);
        });

        it('ciceromark_parsed -> html (verbose)', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark_parsed', ['html'], {}, { verbose: true });
            expect(result).toBe(acceptanceHtml);
        });
    });

    describe('#ciceroedit', () => {
        it('ciceroedit -> ciceromark', async () => {
            const result = await transform(acceptanceCiceroEdit, 'ciceroedit', ['ciceromark'], {}, {});
            expect(result).toEqual(acceptanceCiceroMarkUnwrapped);
        });
    });

    describe('#multisteps', () => {
        it('ciceromark -> ciceromark_unquoted -> html', async () => {
            const result = await transform(acceptanceCiceroMarkParsed, 'ciceromark', ['ciceromark_unquoted', 'html'], {}, {});
            expect(result.startsWith('<html>')).toBe(true);
            expect(result).not.toContain('"Party A"');
        });
    });
});

describe('#sample', () => {
    describe('#html', () => {
        it('html -> ciceromark', async () => {
            const result = await transform(sampleHtml, 'html', ['ciceromark'], {}, {});
            expect(result.$class).toBe(`${CommonMarkModel.NAMESPACE}.Document`);
        });
    });
});

describe('#generateTransformationDiagram', () => {
    it('converts graph to PlantUML diagram', () => {
        const result = generateTransformationDiagram();
        expect(result.trim().startsWith('@startuml')).toBe(true);
    });
});

describe('#formatDescriptor', () => {
    it('Lookup valid format', () => {
        const result = formatDescriptor('commonmark');
        expect(result.fileFormat).toBe('json');
    });

    it('Lookup invalid format', () => {
        expect(() => formatDescriptor('foobar')).toThrow('Unknown format: foobar');
    });
});
