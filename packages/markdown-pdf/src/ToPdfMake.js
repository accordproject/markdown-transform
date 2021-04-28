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

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const CiceroMarkToPdfMakeVisitor = require('./CiceroMarkToPdfMakeVisitor');
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const TemplateMarkToPdfMakeVisitor = require('./TemplateMarkToPdfMakeVisitor');
const {
    defaultStyles,
    findReplaceImageUrls,
} = require('./pdfmakeutil');

/**
 * Converts a DOM to a pdfmake JSON
 * @param {*} inputJson - DOM (JSON)
 * @param {*} options - the PDF generation options
 * @param {boolean} [options.saveMarkdown] - whether to save source CiceroMark as a custom property (defaults to true)
 * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
 * @param {*} serializer - the DOM serializer
 * @param {*} visitor - the DOM visitor
 */
async function ToPdfMake(inputJson, options = { saveMarkdown: true }, serializer, visitor) {
    const input = serializer.fromJSON(inputJson);

    const parameters = {};
    parameters.result = '';
    parameters.first = true;
    parameters.indent = 0;
    input.accept(visitor, parameters);

    let dd = parameters.result;
    // console.log(JSON.stringify(dd, null, 2));
    await findReplaceImageUrls(dd);

    dd.pageSize = 'LETTER';
    dd.pageOrientation = 'portrait',
    // left, top, right, bottom
    dd.pageMargins = [ 81, 72, 81, 72 ]; // units are points (72 per inch)

    // allow overrding top-level options
    dd = Object.assign(dd, options);

    // save source CiceroMark
    if(options.saveMarkdown) {
        dd = Object.assign(dd, {
            info : {
                markdown : JSON.stringify(inputJson)
            }
        });
    }

    // save templates
    if(options.templates) {
        const templates = {};
        options.templates.forEach( (template, index) => {
            templates['template-' + index] = template.toString('base64');
        });
        dd.info = Object.assign(dd.info, templates);
    }

    if(options.tocHeading) {
        dd.content = [{
            toc: {
                title: {text: options.tocHeading, style: 'toc'}
            }
        }].concat( [{text: '', pageBreak: 'after'}].concat(dd.content ));
    }
    if(options.headerText) {
        dd.header = {
            text : options.headerText,
            style : 'Header'
        };
    }
    if(options.footerText || options.footerPageNumber) {
        dd.footer = function(currentPage, pageCount) {
            const footer = [{
                text : options.footerText ? options.footerText : '',
                style : 'Footer',
            }];
            if(options.footerPageNumber) {
                footer.push(
                    {
                        text: currentPage.toString() + ' / ' + pageCount,
                        style: 'PageNumber'
                    });
            }
            return footer;
        };
    }

    // allow the caller to override default styles
    dd.styles = defaultStyles;
    if(options.styles) {
        Object.assign(dd.styles, options.styles);
    }

    return dd;
}

/**
 * Converts a CiceroMark DOM to a PDF Buffer
 * @param {*} inputJson - CiceroMark DOM (JSON)
 * @param {*} options - the PDF generation options
 * @param {boolean} [options.saveMarkdown] - whether to save source CiceroMark as a custom property (defaults to true)
 * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
 */
async function CiceroMarkToPdfMake(inputJson, options = { saveMarkdown: true }) {
    const serializer = (new CiceroMarkTransformer()).getSerializer();
    const visitor = new CiceroMarkToPdfMakeVisitor();
    return ToPdfMake(inputJson, options, serializer, visitor);
}

/**
 * Converts a TemplateMark DOM to a PDF Buffer
 * @param {*} inputJson - TemplateMark DOM (JSON)
 * @param {*} options - the PDF generation options
 * @param {boolean} [options.saveMarkdown] - whether to save source TemplateMark as a custom property (defaults to true)
 * @param {array} [options.templates] - an array of buffers to be saved into the PDF as custom base64 encoded properties (defaults to null)
 */
async function TemplateMarkToPdfMake(inputJson, options = { saveMarkdown: true }) {
    const serializer = (new TemplateMarkTransformer()).getSerializer();
    const visitor = new TemplateMarkToPdfMakeVisitor();
    return ToPdfMake(inputJson, options, serializer, visitor);
}

module.exports = {
    CiceroMarkToPdfMake,
    TemplateMarkToPdfMake,
};
