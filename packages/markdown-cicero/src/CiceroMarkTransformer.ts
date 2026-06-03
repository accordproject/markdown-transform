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

import { ModelManager, Factory, Serializer } from '@accordproject/concerto-core';
import MarkdownIt from 'markdown-it';
import MarkdownItCicero = require('@accordproject/markdown-it-cicero');
import {
    FromMarkdownIt,
    CommonMarkTransformer,
    CommonMarkModel,
    CiceroMarkModel,
    ConcertoMetaModel,
} from '@accordproject/markdown-common';

import cicerorules from './cicerorules';
import { ToMarkdownCiceroVisitor } from './ToMarkdownCiceroVisitor';
import { ToCiceroMarkUnwrappedVisitor } from './ToCiceroMarkUnwrappedVisitor';
import { FromCiceroEditVisitor } from './FromCiceroEditVisitor';
import { ToCommonMarkVisitor } from './ToCommonMarkVisitor';
import { unquoteVariables } from './UnquoteVariables';

/**
 * Converts a CiceroMark DOM to/from a CommonMark DOM, or a markdown string.
 */
export class CiceroMarkTransformer {
    commonMark: CommonMarkTransformer;
    modelManager: ModelManager;
    serializer: Serializer;

    constructor() {
        this.commonMark = new CommonMarkTransformer();

        this.modelManager = new ModelManager();
        this.modelManager.addCTOModel(ConcertoMetaModel.MODEL, 'metamodel.cto');
        this.modelManager.addCTOModel(CommonMarkModel.MODEL, 'commonmark.cto');
        this.modelManager.addCTOModel(CiceroMarkModel.MODEL, 'ciceromark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }

    /**
     * Obtain the Clause text for a Clause node
     */
    getClauseText(input: any): string {
        if (input.$class === `${CiceroMarkModel.NAMESPACE}.Clause`) {
            const docInput = {
                $class: `${CommonMarkModel.NAMESPACE}.Document`,
                xmlns: 'http://commonmark.org/xml/1.0',
                nodes: input.nodes,
            };
            return this.toMarkdownCicero(docInput);
        } else {
            throw new Error('Cannot apply getClauseText to non-clause node');
        }
    }

    /**
     * Retrieve the serializer used by the parser
     */
    getSerializer(): Serializer {
        return this.serializer;
    }

    /**
     * Converts a CiceroEdit string to a CiceroMark DOM
     */
    fromCiceroEdit(input: string): any {
        const commonMark = this.commonMark.fromMarkdown(input);
        const dom = this.serializer.fromJSON(commonMark);

        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager: this.modelManager,
            serializer: this.serializer,
        };
        const visitor = new FromCiceroEditVisitor();
        dom.accept(visitor, parameters);
        return this.serializer.toJSON(dom);
    }

    /**
     * Converts a CiceroMark DOM to a CiceroMark Unwrapped DOM
     */
    toCiceroMarkUnwrapped(input: any, options?: { unquoteVariables?: boolean }): any {
        if (options && Object.prototype.hasOwnProperty.call(options, 'unquoteVariables') && options.unquoteVariables) {
            input = this.unquote(input);
        }

        const dom = this.serializer.fromJSON(input);

        const visitor = new ToCiceroMarkUnwrappedVisitor();
        dom.accept(visitor, {
            modelManager: this.modelManager,
        });

        return this.serializer.toJSON(dom);
    }

    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     */
    fromCommonMark(input: any): any {
        return input;
    }

    /**
     * Converts a markdown string to a CiceroMark DOM
     */
    fromMarkdown(markdown: string): any {
        const commonMarkDom = this.commonMark.fromMarkdown(markdown);
        return this.fromCommonMark(commonMarkDom);
    }

    /**
     * Converts a CiceroMark DOM to a markdown string
     */
    toMarkdown(input: any, options?: any): string {
        const commonMarkDom = this.toCommonMark(input, options);
        return this.commonMark.toMarkdown(commonMarkDom);
    }

    /**
     * Converts a cicero markdown string to a CiceroMark DOM
     */
    fromMarkdownCicero(markdown: string, _options?: any): any {
        const tokens = this.toTokens(markdown);
        return this.fromTokens(tokens);
    }

    /**
     * Converts a CiceroMark DOM to a cicero markdown string
     */
    toMarkdownCicero(input: any): string {
        const visitor = new ToMarkdownCiceroVisitor();
        return visitor.toMarkdownCicero(this.serializer.fromJSON(input));
    }

    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     */
    toCommonMark(input: any, options?: { removeFormatting?: boolean; unquoteVariables?: boolean }): any {
        const json = this.toCiceroMarkUnwrapped(input, options);
        const dom = this.serializer.fromJSON(json);

        const visitor = new ToCommonMarkVisitor(options);
        dom.accept(visitor, {
            commonMark: this.commonMark,
            modelManager: this.modelManager,
            serializer: this.serializer,
        });

        let result = this.serializer.toJSON(dom);
        if (options && options.removeFormatting) {
            const cmt = new CommonMarkTransformer();
            result = cmt.removeFormatting(result);
        }

        return result;
    }

    /**
     * Unquotes a CiceroMark DOM
     */
    unquote(input: any): any {
        return unquoteVariables(input);
    }

    /**
     * Converts a ciceromark string into a token stream
     */
    toTokens(input: string): any[] {
        const parser = new MarkdownIt({ html: true }).use(MarkdownItCicero);
        return parser.parse(input, {});
    }

    /**
     * Converts a token stream into a CiceroMark DOM object.
     */
    fromTokens(tokenStream: any[]): any {
        const fromMarkdownIt = new FromMarkdownIt(cicerorules);
        const json = fromMarkdownIt.toCommonMark(tokenStream);

        const validJson = this.serializer.fromJSON(json);
        return this.serializer.toJSON(validJson);
    }
}

export default CiceroMarkTransformer;
