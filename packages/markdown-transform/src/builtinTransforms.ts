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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ModelLoader } = require('@accordproject/concerto-core');
import { CommonMarkTransformer } from '@accordproject/markdown-common';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { TemplateMarkTransformer } from '@accordproject/markdown-template';
import { HtmlTransformer } from '@accordproject/markdown-html';
import type { TransformationGraph } from './transformEngine';

const transformationGraph: TransformationGraph = {
    markdown_template: {
        docs: 'Template markdown (string)',
        fileFormat: 'utf8',
        templatemark_tokens: (input: any, parameters: any) => {
            const t = new TemplateMarkTransformer();
            return t.toTokens({ fileName: parameters.inputFileName, content: input });
        },
    },
    templatemark_tokens: {
        docs: 'TemplateMark tokens (JSON)',
        fileFormat: 'json',
        templatemark: async (input: any, parameters: any, options: any) => {
            const t = new TemplateMarkTransformer();
            const modelManager = await ModelLoader.loadModelManager(parameters.model, options);
            return t.tokensToMarkdownTemplate(input, modelManager, parameters.templateKind, options, parameters.conceptFullyQualifiedName);
        },
    },
    templatemark: {
        docs: 'TemplateMark DOM (JSON)',
        fileFormat: 'json',
        markdown_template: (input: any) => {
            const t = new TemplateMarkTransformer();
            return t.toMarkdownTemplate(input);
        },
    },
    markdown: {
        docs: 'Markdown (string)',
        fileFormat: 'utf8',
        commonmark_tokens: (input: string) => {
            const t = new CommonMarkTransformer();
            return t.toTokens(input);
        },
    },
    commonmark_tokens: {
        docs: 'Markdown tokens (JSON)',
        fileFormat: 'json',
        commonmark: async (input: any) => {
            const t = new CommonMarkTransformer();
            return t.fromTokens(input);
        },
    },
    markdown_cicero: {
        docs: 'Cicero markdown (string)',
        fileFormat: 'utf8',
        ciceromark_tokens: (input: string) => {
            const t = new CiceroMarkTransformer();
            return t.toTokens(input);
        },
    },
    ciceromark_tokens: {
        docs: 'CiceroMark tokens (JSON)',
        fileFormat: 'json',
        ciceromark: async (input: any) => {
            const t = new CiceroMarkTransformer();
            return t.fromTokens(input);
        },
    },
    commonmark: {
        docs: 'CommonMark DOM (JSON)',
        fileFormat: 'json',
        markdown: (input: any) => {
            const t = new CommonMarkTransformer();
            return t.toMarkdown(input);
        },
        ciceromark: (input: any) => {
            const t = new CiceroMarkTransformer();
            return t.fromCommonMark(input);
        },
        plaintext: (input: any) => {
            const t = new CommonMarkTransformer();
            return t.toMarkdown(t.removeFormatting(input));
        },
    },
    ciceromark: {
        docs: 'CiceroMark DOM (JSON)',
        fileFormat: 'json',
        markdown_cicero: (input: any, _parameters: any, options: any) => {
            const t = new CiceroMarkTransformer();
            const inputUnwrapped = t.toCiceroMarkUnwrapped(input, options);
            return t.toMarkdownCicero(inputUnwrapped);
        },
        commonmark: (input: any, _parameters: any, options: any) => {
            const t = new CiceroMarkTransformer();
            return t.toCommonMark(input, options);
        },
        ciceromark_parsed: (input: any) => input,
    },
    ciceromark_parsed: {
        docs: 'Parsed CiceroMark DOM (JSON)',
        fileFormat: 'json',
        html: (input: any) => {
            const t = new HtmlTransformer();
            return t.toHtml(input);
        },
        ciceromark: (input: any, _parameters: any, options: any) => {
            const t = new CiceroMarkTransformer();
            return t.toCiceroMarkUnwrapped(input, options);
        },
        ciceromark_unquoted: (input: any) => {
            const t = new CiceroMarkTransformer();
            return t.unquote(input);
        },
    },
    plaintext: {
        docs: 'Plain text (string)',
        fileFormat: 'utf8',
        markdown: (input: any) => input,
    },
    ciceroedit: {
        docs: 'CiceroEdit (string)',
        fileFormat: 'utf8',
        ciceromark_parsed: (input: string) => {
            const t = new CiceroMarkTransformer();
            return t.fromCiceroEdit(input);
        },
    },
    ciceromark_unquoted: {
        docs: 'CiceroMark DOM (JSON) with quotes around variables removed',
        fileFormat: 'json',
        ciceromark_parsed: (input: any) => input,
    },
    html: {
        docs: 'HTML (string)',
        fileFormat: 'utf8',
        ciceromark_parsed: (input: string) => {
            const t = new HtmlTransformer();
            return t.toCiceroMark(input);
        },
    },
};

export default transformationGraph;
