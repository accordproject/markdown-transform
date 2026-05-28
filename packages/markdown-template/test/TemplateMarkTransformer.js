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
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const { ModelManager } = require('@accordproject/concerto-core');
const { TemplateMarkModel } = require('@accordproject/markdown-common');

const TemplateMarkTransformer = require('../lib/TemplateMarkTransformer');

const MODEL = `
namespace test@1.0.0
@template
concept Thing {
    o String[] items
}`;

describe('#TemplateMarkTransformer', () => {
    describe('#tokensToMarkdownTemplate', () => {
        it('should handle join with type, style and locale', async () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({content: '{{#join items type="conjunction" style="long" locale="en"}}{{/join}}'});
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            joinNode.$class.should.equal(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            joinNode.locale.should.equal('en');
            joinNode.type.should.equal('conjunction');
            joinNode.style.should.equal('long');
        });

        it('should handle join with type, style', async () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({content: '{{#join items type="conjunction"  style="long"}}{{/join}}'});
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            joinNode.$class.should.equal(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            joinNode.type.should.equal('conjunction');
            joinNode.style.should.equal('long');
        });

        it('should handle join with type', async () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({content: '{{#join items type="conjunction"}}{{/join}}'});
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            joinNode.$class.should.equal(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            joinNode.type.should.equal('conjunction');
        });

        it('should handle join', async () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({content: '{{#join items}}{{/join}}'});
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            joinNode.$class.should.equal(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
        });

        it('should ignore unknown attributes on join', async () => {
            const transformer = new TemplateMarkTransformer();
            const modelManager = new ModelManager();
            modelManager.addCTOModel(MODEL);
            const tokens = transformer.toTokens({content: '{{#join items foo="bar"}}{{/join}}'});
            const result = transformer.tokensToMarkdownTemplate(tokens, modelManager, 'clause');
            const joinNode = result.nodes[0].nodes[0].nodes[0];
            joinNode.$class.should.equal(`${TemplateMarkModel.NAMESPACE}.JoinDefinition`);
            (joinNode.foo === undefined).should.be.true;
        });
    });
});
