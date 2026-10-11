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

import { ModelManager } from '@accordproject/concerto-core';
import { TemplateMarkModel } from '@accordproject/markdown-common';
import { TemplateMarkTransformer } from './TemplateMarkTransformer';

const MODEL = `
namespace test@1.0.0
@template
concept Thing {
    o String[] items
}`;

const SCOPE_MODEL = `
namespace test@1.0.0
concept Address {
    o String city
}
@template
concept TemplateData {
    o String name
    o Integer age optional
    o String middleName optional
    o Boolean isActive optional
    o Address address optional
}`;

describe('#TemplateMarkTransformer', () => {
    describe('#tokensToMarkdownTemplate', () => {
        it('should handle join with type, style and locale', () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({ content: '{{#join items type="conjunction" style="long" locale="en"}}{{/join}}' });
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            expect(joinNode.$class).toBe(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            expect(joinNode.locale).toBe('en');
            expect(joinNode.type).toBe('conjunction');
            expect(joinNode.style).toBe('long');
        });

        it('should handle join with type, style', () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({ content: '{{#join items type="conjunction"  style="long"}}{{/join}}' });
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            expect(joinNode.$class).toBe(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            expect(joinNode.type).toBe('conjunction');
            expect(joinNode.style).toBe('long');
        });

        it('should handle join with type', () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({ content: '{{#join items type="conjunction"}}{{/join}}' });
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            expect(joinNode.$class).toBe(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            expect(joinNode.type).toBe('conjunction');
        });

        it('should handle join', () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({ content: '{{#join items}}{{/join}}' });
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            expect(joinNode.$class).toBe(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
        });

        it('should ignore unknown attributes on join', () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({ content: '{{#join items foo="bar"}}{{/join}}' });
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            expect(joinNode.$class).toBe(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            expect(joinNode.foo).toBeUndefined();
        });
    });

    describe('#variables inside conditional and optional blocks', () => {
        const parse = (content: string) => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(SCOPE_MODEL);
            return transformer.fromMarkdownTemplate({ content }, modelManager, 'clause');
        };
        const variables = (node: any): any[] => {
            const own = node.$class === `${TemplateMarkModel.NAMESPACE}.VariableDefinition` ? [node] : [];
            const children = ['nodes', 'whenTrue', 'whenFalse', 'whenSome', 'whenNone']
                .flatMap((key) => node[key] || [])
                .flatMap(variables);
            return [...own, ...children];
        };
        const elementTypes = (content: string) =>
            Object.fromEntries(variables(parse(content)).map((v) => [v.name, v.elementType]));

        it.each([
            ['the condition property in #if', '{{#if age}}You are {{age}}.{{/if}}'],
            ['other properties in #if', '{{#if isActive}}Hello {{name}}, you are {{age}}.{{/if}}'],
            ['properties in the else branch of #if', '{{#if isActive}}Hello {{name}}.{{else}}Bye {{name}}.{{/if}}'],
            ['the optional property in #optional', '{{#optional middleName}}Middle {{middleName}}.{{else}}None.{{/optional}}'],
            ['other properties in #optional', '{{#optional age}}{{name}} is {{age}}.{{/optional}}'],
            ['properties in the else branch of #optional', '{{#optional age}}{{age}}.{{else}}Active: {{isActive}}.{{/optional}}'],
        ])('should resolve %s against the parent model', (_, content) => {
            expect(() => parse(content)).not.toThrow();
        });

        it.each([
            ['#if', '{{#if age}}You are {{unknown}}.{{/if}}'],
            ['the else branch of #if', '{{#if isActive}}Hi.{{else}}Bye {{unknown}}.{{/if}}'],
            ['#optional', '{{#optional age}}You are {{unknown}}.{{/optional}}'],
            ['the else branch of #optional', '{{#optional age}}{{age}}.{{else}}{{unknown}}.{{/optional}}'],
        ])('should reject unknown properties in %s', (_, content) => {
            expect(() => parse(content)).toThrow('Unknown property: unknown');
        });

        it('should type named variables inside #if by their own property', () => {
            expect(elementTypes('{{#if isActive}}{{name}} is {{age}}.{{/if}}')).toEqual({
                name: 'String',
                age: 'Integer',
            });
        });

        it('should resolve {{this}} to the guarded property', () => {
            expect(elementTypes('{{#if age}}Age {{this}}.{{/if}}')).toEqual({ this: 'Integer' });
            expect(elementTypes('{{#optional middleName}}Middle {{this}}.{{/optional}}')).toEqual({ this: 'String' });
        });

        it('should scope complex #optional blocks to the nested class', () => {
            expect(elementTypes('{{#optional address}}Lives in {{city}}.{{/optional}}')).toEqual({ city: 'String' });
            expect(() => parse('{{#optional address}}{{name}}{{/optional}}')).toThrow('Unknown property: name');
        });
    });
});
