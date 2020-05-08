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
const formatDescriptor = require('../lib/transform').formatDescriptor;
const acceptanceMarkdown = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.md'), 'utf8');
const acceptanceCiceroEdit = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-ciceroedit.md'), 'utf8');
const acceptanceCommonMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-commonmark.json'), 'utf8'));
const acceptanceCiceroMark = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-ciceromark.json'), 'utf8'));
const pdf = fs.readFileSync(path.resolve(__dirname, 'data', 'sample.pdf'));
const docx = fs.readFileSync(path.resolve(__dirname, 'data', 'sample.docx'));
const html = fs.readFileSync(path.resolve(__dirname, 'data', 'sample.html'), 'utf8');
const acceptanceSlate = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance-slate.json'), 'utf8'));
const acceptancePlainText = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.txt'), 'utf8');

describe('#transform', () => {

    describe('#markdown', () => {
        it('markdown -> commonmark (verbose)', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark'], {}, {verbose: true});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('markdown -> commonmark', async () => {
            const result = await transform(acceptanceMarkdown, 'markdown', ['commonmark']);
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#markdown_template', () => {
        it('markdown_template -> templatemark', async () => {
            const grammar1 = fs.readFileSync('./test/data/template1/grammar1.tem.md', 'utf8');
            const model1 = './test/data/template1/model1.cto';
            const parameters = { inputFileName: './test/data/template1/grammar1.tem.md', ctoFiles: [model1], templateKind: 'clause' };
            const result = await transform(grammar1, 'markdown_template', ['templatemark'], parameters, {});
            result.$class.should.equal('org.accordproject.templatemark.ClauseDefinition');
        });
    });

    describe('#commonmark', () => {
        it('commonmark -> markdown', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['markdown'], {}, {});
            result.should.startWith('Heading');
        });

        it('commonmark -> ciceromark', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('commonmark -> plaintext', async () => {
            const result = await transform(acceptanceCommonMark, 'commonmark', ['plaintext'], {}, {});
            result.should.startWith('Heading');
        });
    });

    describe('#plaintext', () => {
        it('plaintext -> markdown', async () => {
            const result = await transform(acceptancePlainText, 'plaintext', ['markdown'], {}, {});
            result.should.equal(acceptancePlainText);
        });
    });

    describe('#ciceromark', () => {
        it('ciceromark -> html', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['html'], {}, {});
            result.should.startWith('<html>');
        });

        it('ciceromark -> ciceromark_noquotes', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['ciceromark_noquotes'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('ciceromark -> commonmark', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['commonmark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('ciceromark -> slate', async () => {
            const result = await transform(acceptanceCiceroMark, 'ciceromark', ['slate'], {}, {});
            result.document.object.should.equal('document');
        });
    });

    describe('#ciceroedit', () => {
        it('ciceroedit -> ciceromark', async () => {
            const result = await transform(acceptanceCiceroEdit, 'markdown', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#pdf', () => {
        it('pdf -> ciceromark', async () => {
            const result = await transform(pdf, 'pdf', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });

        it('pdf -> ciceromark (verbose)', async () => {
            const result = await transform(pdf, 'pdf', ['ciceromark'], {}, {verbose: true});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#docx', () => {
        it('docx -> ciceromark', async () => {
            const result = await transform(docx, 'docx', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#html', () => {
        it('html -> ciceromark', async () => {
            const result = await transform(html, 'html', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#slate', () => {
        it('slate -> ciceromark', async () => {
            const result = await transform(acceptanceSlate, 'slate', ['ciceromark'], {}, {});
            result.$class.should.equal('org.accordproject.commonmark.Document');
        });
    });

    describe('#multi', () => {
        it('ciceroedit -> ciceromark_noquotes -> slate', async () => {
            const result = await transform(acceptanceCiceroEdit, 'markdown', ['ciceromark_noquotes','slate'], {}, {});
            result.document.object.should.equal('document');
        });

        it('ciceroedit -> ciceromark_noquotes -> html', async () => {
            const result = await transform(acceptanceCiceroEdit, 'markdown', ['ciceromark_noquotes','html'], {}, {});
            result.should.startWith('<html>');
            result.should.not.contain('"Party A"');
        });

        it('ciceroedit -> html', async () => {
            const result = await transform(acceptanceCiceroEdit, 'markdown', ['html'], {}, {});
            result.should.startWith('<html>');
            result.should.contain('"Party A"');
        });

        it('ciceroedit -> html (verbose)', async () => {
            const result = await transform(acceptanceCiceroEdit, 'markdown', ['html'], {}, {verbose: true});
            result.should.startWith('<html>');
            result.should.contain('"Party A"');
        });
    });
});


describe('#generateTransformationDiagram', () => {
    it('converts graph to PlantUML diagram', () => {
        const result = generateTransformationDiagram();
        result.trim().should.startWith('@startuml');
    });
});

describe('#formatDescriptor', () => {
    it('Lookup valid format', () => {
        const result = formatDescriptor('commonmark');
        result.fileFormat.should.equal('json');
    });

    it('Lookup invalid format', () => {
        (() => formatDescriptor('foobar')).should.throw('Unknown format foobar');
    });
});
