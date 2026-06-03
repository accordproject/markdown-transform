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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { ModelManager, Factory, Serializer, Introspector } from '@accordproject/concerto-core';
import {
    CommonMarkModel,
    CiceroMarkModel,
    ConcertoMetaModel,
    TemplateMarkModel,
    FromMarkdownIt,
} from '@accordproject/markdown-common';

import { normalizeNLs } from './normalize';
import { TypeVisitor } from './TypeVisitor';
import { FormulaVisitor } from './FormulaVisitor';
import MarkdownIt from 'markdown-it';
import MarkdownItTemplate = require('@accordproject/markdown-it-template');
import templaterules from './templaterules';

export interface TemplateMarkManager {
    modelManager: ModelManager;
    factory: Factory;
    serializer: Serializer;
}

/**
 * Model manager for TemplateMark
 */
export function mkTemplateMarkManager(_options?: any): TemplateMarkManager {
    const result: any = {};
    result.modelManager = new ModelManager();
    result.modelManager.addCTOModel(CommonMarkModel.MODEL, 'commonmark.cto');
    result.modelManager.addCTOModel(ConcertoMetaModel.MODEL, 'metamodel.cto');
    result.modelManager.addCTOModel(CiceroMarkModel.MODEL, 'ciceromark.cto');
    result.modelManager.addCTOModel(TemplateMarkModel.MODEL, 'templatemark.cto');
    result.factory = new Factory(result.modelManager);
    result.serializer = new Serializer(result.factory, result.modelManager, { utcOffset: 0 });
    return result;
}

export const templateMarkManager = mkTemplateMarkManager();

/**
 * Returns the concept for the template
 */
export function findTemplateConcept(introspector: Introspector, _templateKind: string, conceptFullyQualifiedName?: string): any {
    if (conceptFullyQualifiedName) {
        return introspector.getClassDeclaration(conceptFullyQualifiedName);
    } else {
        const templateModels = introspector.getClassDeclarations().filter((item: any) => {
            return !item.isAbstract() && item.getDecorator('template');
        });
        if (templateModels.length > 1) {
            throw new Error('Found multiple concepts with @template decorator. The model for the template must contain a single concept with the @template decorator.');
        } else if (templateModels.length === 0) {
            throw new Error('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr.');
        } else {
            return templateModels[0];
        }
    }
}

/**
 * Returns the template model for a type
 */
function findElementModel(introspector: Introspector, elementType: string): any {
    return introspector.getClassDeclaration(elementType);
}

/**
 * Decorate TemplateMark DOM with its types
 */
function templateMarkTypingGen(template: any, introspector: Introspector, model: any, templateKind: string, options?: any): any {
    const input = templateMarkManager.serializer.fromJSON(template, options);

    const parameters = {
        templateMarkModelManager: templateMarkManager.modelManager,
        introspector,
        model,
        kind: templateKind,
    };
    const visitor = new TypeVisitor();
    input.accept(visitor, parameters);
    let result = Object.assign({}, templateMarkManager.serializer.toJSON(input, options));

    const fvisitor = new FormulaVisitor();
    result = fvisitor.calculateDependencies((templateMarkManager.modelManager as any).serializer, result, options);
    return result;
}

/**
 * Decorate TemplateMark DOM with its types
 */
export function templateMarkTyping(template: any, modelManager: ModelManager, templateKind: string, conceptFullyQualifiedName?: string): any {
    const introspector = new Introspector(modelManager);
    const model = findTemplateConcept(introspector, templateKind, conceptFullyQualifiedName);
    return templateMarkTypingGen(template, introspector, model, templateKind);
}

/**
 * Decorate TemplateMark DOM with its types from an element type
 */
export function templateMarkTypingFromType(template: any, modelManager: ModelManager, elementType: string): any {
    const introspector = new Introspector(modelManager);
    const model = findElementModel(introspector, elementType);

    const rootNode = {
        '$class': `${CommonMarkModel.NAMESPACE}.Document`,
        'xmlns': 'http://commonmark.org/xml/1.0',
        'nodes': [{
            '$class': `${TemplateMarkModel.NAMESPACE}.ContractDefinition`,
            'name': 'top',
            'nodes': template,
        }],
    };
    const rootNodeTyped = templateMarkTypingGen(rootNode, introspector, model, 'clause');
    return rootNodeTyped.nodes[0].nodes;
}

/**
 * Converts a templatemark string to a token stream
 */
export function templateToTokens(input: string): any[] {
    const norm = normalizeNLs(input);
    const parser = new MarkdownIt({ html: true }).use(MarkdownItTemplate);
    return parser.parse(norm, {});
}

/**
 * Converts a template token stream string to an untyped TemplateMark DOM
 */
function tokensToUntypedTemplateMarkGen(tokenStream: any[]): any[] {
    const fromMarkdownIt = new FromMarkdownIt(templaterules);
    const partialTemplate = fromMarkdownIt.toCommonMark(tokenStream);
    const result = templateMarkManager.serializer.toJSON(templateMarkManager.serializer.fromJSON(partialTemplate));
    return result.nodes;
}

/**
 * Converts a template token stream string to an untyped TemplateMark DOM
 */
export function tokensToUntypedTemplateMark(tokenStream: any[], templateKind: string): any {
    const partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);

    if (templateKind === 'contract') {
        return {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': `${TemplateMarkModel.NAMESPACE}.ContractDefinition`,
                'name': 'top',
                'nodes': partialTemplate,
            }],
        };
    } else {
        return {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [{
                '$class': `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
                'name': 'top',
                'nodes': partialTemplate,
            }],
        };
    }
}

/**
 * Converts a template token stream string to an untyped TemplateMark DOM fragment
 */
export function tokensToUntypedTemplateMarkFragment(tokenStream: any[]): any {
    const partialTemplate = tokensToUntypedTemplateMarkGen(tokenStream);
    return {
        '$class': `${CommonMarkModel.NAMESPACE}.Document`,
        'xmlns': 'http://commonmark.org/xml/1.0',
        'nodes': [{
            '$class': `${TemplateMarkModel.NAMESPACE}.ClauseDefinition`,
            'name': 'top',
            'nodes': partialTemplate,
        }],
    };
}
