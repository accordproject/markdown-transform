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

import { Serializer, ModelManager } from '@accordproject/concerto-core';

import {
    templateMarkManager,
    templateToTokens,
    tokensToUntypedTemplateMark,
    templateMarkTyping,
} from './templatemarkutil';

import { ToMarkdownTemplateVisitor } from './ToMarkdownTemplateVisitor';

export interface TemplateInput {
    fileName?: string;
    content: string;
}

/**
 * Support for TemplateMark Templates
 */
export class TemplateMarkTransformer {
    /**
     * Converts a template string to a token stream
     */
    toTokens(templateInput: TemplateInput): any[] {
        return templateToTokens(templateInput.content);
    }

    /**
     * Converts a template token stream string to a TemplateMark DOM
     */
    tokensToMarkdownTemplate(
        tokenStream: any[],
        modelManager: ModelManager,
        templateKind: string,
        options?: { verbose?: boolean },
        conceptFullyQualifiedName?: string,
    ): any {
        const template = tokensToUntypedTemplateMark(tokenStream, templateKind);
        if (options && options.verbose) {
            console.log('===== Untyped TemplateMark ');
            console.log(JSON.stringify(template, null, 2));
        }
        const typedTemplate = templateMarkTyping(template, modelManager, templateKind, conceptFullyQualifiedName);
        if (options && options.verbose) {
            console.log('===== TemplateMark ');
            console.log(JSON.stringify(typedTemplate, null, 2));
        }
        return typedTemplate;
    }

    /**
     * Converts a markdown string to a TemplateMark DOM
     */
    fromMarkdownTemplate(
        templateInput: TemplateInput,
        modelManager: ModelManager,
        templateKind: string,
        options?: { verbose?: boolean },
        conceptFullyQualifiedName?: string,
    ): any {
        if (!modelManager) {
            throw new Error('Cannot parse without template model');
        }

        const tokenStream = this.toTokens(templateInput);
        if (options && options.verbose) {
            console.log('===== MarkdownIt Tokens ');
            console.log(JSON.stringify(tokenStream, null, 2));
        }
        return this.tokensToMarkdownTemplate(tokenStream, modelManager, templateKind, options, conceptFullyQualifiedName);
    }

    /**
     * Converts a TemplateMark DOM to a template markdown string
     */
    toMarkdownTemplate(input: any): string {
        const visitor = new ToMarkdownTemplateVisitor();
        return visitor.toMarkdownTemplate(templateMarkManager.serializer, input);
    }

    /**
     * Get TemplateMark serializer
     */
    getSerializer(): Serializer {
        return templateMarkManager.serializer;
    }
}

export default TemplateMarkTransformer;
