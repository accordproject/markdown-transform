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

// Parser from template AST
const parserOfTemplateAst = require('../lib/fromTemplate').parserOfTemplateAst;

// Valid templates
const template1 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'text', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'variable', 'type': 'String' },
    ]
};
const template2 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'text', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'block', 'type': 'conditional', 'whenTrue': ', even in the presence of force majeure.', 'whenFalse': '' },
    ]
};
const template3 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'text', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' for the amount of ' },
        { 'kind': 'variable', 'type': 'Double' },
        { 'kind': 'text', 'value': ' ' },
        { 'kind': 'variable', 'type': 'Enum', 'value': ['USD','GBP','EUR'] },
        { 'kind': 'block', 'type': 'conditional', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
        { 'kind': 'text', 'value': '.' },
    ]
};

// Error templates
const templateErr1 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'foo', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'variable', 'type': 'String' },
    ]
};
const templateErr2 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'text', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'FOO' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'variable', 'type': 'String' },
    ]
};
const templateErr3 = {
    'kind':'sequence',
    'value': [
        { 'kind': 'text', 'value': 'This is a contract between ' },
        { 'kind': 'variable', 'type': 'String' },
        { 'kind': 'text', 'value': ' and ' },
        { 'kind': 'block', 'type': 'unknownBlock' },
    ]
};

// Tests
describe('#templateparsers', () => {
    describe('#template1', () => {
        it('should parse', async () => {
            parserOfTemplateAst(template1).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplateAst(template1).parse('FOO').status.should.equal(false);
        });
    });

    describe('#template2', () => {
        it('should parse (no force majeure)', async () => {
            parserOfTemplateAst(template2).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserOfTemplateAst(template2).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplateAst(template2).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeureXX.').status.should.equal(false);
        });
    });

    describe('#template3', () => {
        it('should parse (no force majeure)', async () => {
            parserOfTemplateAst(template3).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR.').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserOfTemplateAst(template3).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplateAst(template3).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.x00 EUR, even in the presence of force majeure.').status.should.equal(false);
        });
    });
});

describe('#invalidparsers', () => {
    describe('#templateErr1', () => {
        it('should throw for wrong kind', async () => {
            (() => parserOfTemplateAst(templateErr1)).should.throw('Unknown template ast kind foo');
        });
    });

    describe('#templateErr2', () => {
        it('should throw for wrong variable type', async () => {
            (() => parserOfTemplateAst(templateErr2)).should.throw('Unknown variable type FOO');
        });
    });

    describe('#templateErr3', () => {
        it('should throw for wrong block type', async () => {
            (() => parserOfTemplateAst(templateErr3)).should.throw('Unknown block type unknownBlock');
        });
    });
});
