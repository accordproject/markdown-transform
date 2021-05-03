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

// @ts-nocheck
/* eslint-disable no-undef */
'use strict';

const fs = require('fs');
const path = require('path');

const PdfTransformer = require('./PdfTransformer');
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const ModelLoader = require('@accordproject/concerto-core').ModelLoader;

/**
 * Get the name and contents of all pdf test files
 * @returns {*} an array of name/contents tuples
 */
function getPdfFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function(file) {
        if(file.endsWith('.pdf')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file);
            result.push([file, contents]);
        }
    });

    return result;
}

/**
 * Saves a cicero mark dom as a PDF to the output folder
 * @param {object} ciceroMarkDom the dom
 * @param {string} fileName the filename to use
 * @param {*} customOptions - the PDF generation options
 * @param {array} [customOptions.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
 * @return {Promise} a promise that resolves when the file has been written
 */
function saveCiceroMarkAsPdf(ciceroMarkDom, fileName, customOptions) {
    fs.mkdirSync('./output', { recursive: true });

    const promise = new Promise((resolve) => {
        const outputStream = fs.createWriteStream(`./output/${fileName}.pdf`);
        outputStream.on('finish', () => {
            resolve(true);
        });

        let options = {
            info: {
                title: 'Smart Legal Contract',
                author: 'Dan',
                subject: 'Test PDF rendering',
                keywords: 'accord project, markdown transform, pdf',
            },
            defaultStyle : {
                font: 'LiberationSerif'
            },
            tocHeading : 'Table of Contents',
            headerText : 'Contract ABCDEF',
            footerText : 'Copyright Acme Inc.',
            footerPageNumber: true,
            styles : {
                Link : {
                    color : 'red',
                    fontSize : 16
                }
            }
        };

        options = Object.assign( options, customOptions );
        PdfTransformer.ciceroMarkToPdfMake(ciceroMarkDom, options).then((dd) => PdfTransformer.pdfMakeToPdf(dd, outputStream));
    });

    return promise;
}

/**
 * Get the name and contents of all markdown test files
 * @returns {*} an array of name/contents tuples
 */
function getMarkdownFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function(file) {
        if(file.endsWith('.md')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}

/**
 * Get the name and contents of all JSON test files
 * @returns {*} an array of name/contents tuples
 */
function getJsonFiles() {
    const result = [];
    const files = fs.readdirSync(__dirname + '/../test/data');

    files.forEach(function(file) {
        if(file.endsWith('.json')) {
            let contents = fs.readFileSync(__dirname + '/../test/data/' + file, 'utf8');
            result.push([file, contents]);
        }
    });

    return result;
}


describe('pdf import', () => {
    jest.setTimeout(20000);
    getPdfFiles().forEach(([file, pdfContent], i) => {
        it(`converts ${file} to cicero mark`, async () => {
            const ciceroMarkDom = await PdfTransformer.toCiceroMark(pdfContent, 'json');
            // if(file.startsWith('Land')) {
            //     console.log(JSON.stringify(ciceroMarkDom, null, 4));
            // }
            expect(ciceroMarkDom).toMatchSnapshot(); // (1)
            return saveCiceroMarkAsPdf(ciceroMarkDom, file + '-roundtrip'); // roundtrip for debug
        });
    });
});

describe('pdf import 2', () => {
    it('converts Land_Sale_Contract to cicero mark', async () => {
        const pdfContent = fs.readFileSync( path.join(__dirname, '/../test/data', 'Land_Sale_Contract.pdf'), null );
        const ciceroMarkDom = await PdfTransformer.toCiceroMark(pdfContent, 'json');
        // console.log(JSON.stringify(ciceroMarkDom, null, 4));
        expect(ciceroMarkDom).toMatchSnapshot(); // (1)
        return saveCiceroMarkAsPdf(ciceroMarkDom, 'Land_Sale_Contract-debug'); // roundtrip for debug
    });
});

describe('pdf generation with decorators', () => {
    it('converts signature-block.md', async () => {
        const templateTransformer = new TemplateMarkTransformer();
        const templateMarkContent = fs.readFileSync( path.join(__dirname, '/../test/data/signature', 'grammar.tem.md'), 'utf-8' );

        const modelFilePath = path.join(__dirname, '/../test/data/signature/model.cto');
        const modelManager = await ModelLoader.loadModelManager([modelFilePath]);

        const templateMarkDom = templateTransformer.fromMarkdownTemplate( { content: templateMarkContent }, modelManager, 'clause');
        expect(templateMarkDom).toMatchSnapshot(); // (1)

        const markdownContent = fs.readFileSync( path.join(__dirname, '/../test/data/signature', 'signature-block.md'), 'utf-8' );
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const ciceroMarkDom = ciceroMarkTransformer.fromMarkdownCicero(markdownContent, 'json');

        const signatureBlocks = ciceroMarkDom.nodes.filter( n => n.$class === 'org.accordproject.ciceromark.Clause');

        const promises = [];
        signatureBlocks.forEach( signatureBlock => {
            // console.log(JSON.stringify(signatureBlock, null, 4));
            const parseResult = templateTransformer.fromCiceroMark( {content: { $class: 'org.accordproject.commonmark.Document', xmlns: '', nodes: signatureBlock.nodes} }, templateMarkDom, modelManager, 'clause', null );
            // console.log(JSON.stringify(parseResult, null, 4));
            const typedDom = templateTransformer.instantiateCiceroMark(parseResult, templateMarkDom, modelManager, 'clause', null);
            // console.log(JSON.stringify(typedDom, null, 4));
            promises.push( saveCiceroMarkAsPdf(typedDom, `signature-block-${signatureBlock.name}` ) );
        });
        return Promise.all(promises);
    });
});

describe('pdf roudtrip', () => {
    it('generate and load ciceromark and templates embedded in PDF', async () => {
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        let contents = fs.readFileSync(__dirname + '/../test/data/contract.md', 'utf8');
        const ciceroMarkDom = ciceroMarkTransformer.fromMarkdownCicero(contents, 'json');

        // create a PDF, embedding templates and the source CiceroMark into the PDF info (metadata)
        let acceptanceOfDelivery = fs.readFileSync(__dirname + '/../test/data/acceptance-of-delivery@0.14.0.cta');
        const templates = [acceptanceOfDelivery];
        await saveCiceroMarkAsPdf(ciceroMarkDom, 'roundtrip.md', {templates, saveMarkdown: true});

        // because we embedded the source CiceroMark in the PDF, it should
        // be detected and be returned identical
        let pdfContent = fs.readFileSync(__dirname + '/../output/roundtrip.md.pdf');
        const ciceroMarkDom2 = await PdfTransformer.toCiceroMark(pdfContent, 'json', {loadMarkdown: true, loadTemplates: false } );
        expect(ciceroMarkDom).toEqual(ciceroMarkDom2);

        // if we load templates from the PDF, they should be returned
        const ciceroMarkDom3 = await PdfTransformer.toCiceroMark(pdfContent, 'json', {loadMarkdown: true, loadTemplates: true } );
        expect(Object.assign(ciceroMarkDom, {templates: [acceptanceOfDelivery.toString('base64')]})).toEqual(ciceroMarkDom3);
    });
});


describe('pdf generation', () => {
    getMarkdownFiles().forEach(([file, markdownContent], i) => {
        it(`converts ${file} to pdf`, async () => {
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            const ciceroMarkDom = ciceroMarkTransformer.fromMarkdownCicero(markdownContent, 'json');
            return saveCiceroMarkAsPdf(ciceroMarkDom, file);
        });
    });

    getJsonFiles().forEach(([file, jsonContent], i) => {
        it(`converts ${file} to pdf`, async () => {
            fs.mkdirSync('./output', { recursive: true });

            const promise = new Promise((resolve) => {
                const outputStream = fs.createWriteStream(`./output/${file}.pdf`);
                outputStream.on('finish', () => {
                    resolve(true);
                });

                const options = {
                    info: {
                        title: 'Smart Legal Contract',
                        author: 'Dan',
                        subject: 'Test PDF rendering',
                        keywords: 'accord project, markdown transform, pdf',
                    },
                    defaultStyle : {
                        font: 'LiberationSerif'
                    },
                    tocHeading : 'Table of Contents',
                    headerText : 'Contract ABCDEF',
                    footerText : 'Copyright Acme Inc.',
                    footerPageNumber: true,
                    styles : {
                        Link : {
                            color : 'red',
                            fontSize : 16
                        }
                    }
                };

                PdfTransformer.ciceroMarkToPdfMake(JSON.parse(jsonContent), options).then((dd) => PdfTransformer.pdfMakeToPdf(dd, outputStream));
            });

            return promise;
        });
    });
});