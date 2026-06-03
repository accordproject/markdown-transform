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
});
