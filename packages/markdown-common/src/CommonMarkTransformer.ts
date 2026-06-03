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

import MarkdownIt from 'markdown-it';
import { FromMarkdownIt } from './FromMarkdownIt';
import { ModelManager, Factory, Serializer } from '@accordproject/concerto-core';
import { ToMarkdownVisitor } from './ToMarkdownVisitor';
import { removeFormatting } from './removeFormatting';
import * as CommonMarkModel from './externalModels/CommonMarkModel';

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
export class CommonMarkTransformer {
    serializer: Serializer;

    constructor() {
        const modelManager = new ModelManager();
        modelManager.addCTOModel(CommonMarkModel.MODEL, 'commonmark.cto');
        const factory = new Factory(modelManager);
        this.serializer = new Serializer(factory, modelManager);
    }

    /**
     * Converts a CommonMark DOM to a markdown string
     */
    toMarkdown(input: any): string {
        const visitor = new ToMarkdownVisitor();
        return visitor.toMarkdown(this.serializer.fromJSON(input));
    }

    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     */
    removeFormatting(input: any): any {
        return removeFormatting(input);
    }

    /**
     * Converts a markdown string into a token stream
     */
    toTokens(markdown: string): any[] {
        const parser = new MarkdownIt({ html: true });
        return parser.parse(markdown, {});
    }

    /**
     * Converts a token stream into a CommonMark DOM object.
     */
    fromTokens(tokenStream: any[]): any {
        const fromMarkdownIt = new FromMarkdownIt();
        const json = fromMarkdownIt.toCommonMark(tokenStream);

        // validate the object using the model
        const validJson = this.serializer.fromJSON(json);
        return this.serializer.toJSON(validJson);
    }

    /**
     * Converts a markdown string into a CommonMark DOM object.
     */
    fromMarkdown(markdown: string): any {
        const tokenStream = this.toTokens(markdown);
        return this.fromTokens(tokenStream);
    }

    /**
     * Retrieve the serializer used by the parser
     */
    getSerializer(): Serializer {
        return this.serializer;
    }
}

export default CommonMarkTransformer;
