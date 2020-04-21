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
const parserOfTemplateAst = require('../lib/astFromTemplate').parserOfTemplateAst;

// Variables
const var1 = { 'kind': 'variable', 'name': 'seller', 'type': 'String' };
const var2 = { 'kind': 'variable', 'name': 'buyer', 'type': 'String' };
const var3 = { 'kind': 'variable', 'name': 'amount', 'type': 'Double' };
const var4 = { 'kind': 'variable', 'name': 'currency', 'type': 'Enum', 'value': ['USD','GBP','EUR'] };

// Valid templates
const template1 = {
    'kind':'clause',
    'name':'clause1',
    'type':'org.accordproject.MyClause',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': 'This is a contract between ' },
            var1,
            { 'kind': 'text', 'value': ' and ' },
            var2,
        ]
    }
};
const template2 = {
    'kind':'clause',
    'name':'clause2',
    'type':'org.accordproject.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': 'This is a contract between ' },
            var1,
            { 'kind': 'text', 'value': ' and ' },
            var2,
            { 'kind': 'block', 'type': 'conditional', 'whenTrue': ', even in the presence of force majeure.', 'whenFalse': '' },
        ]
    }
};
const template3 = {
    'kind':'clause',
    'name':'clause3',
    'type':'org.accordproject.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': 'This is a contract between ' },
            var1,
            { 'kind': 'text', 'value': ' and ' },
            var2,
            { 'kind': 'text', 'value': ' for the amount of ' },
            var3,
            { 'kind': 'text', 'value': ' ' },
            var4,
            { 'kind': 'block', 'type': 'conditional', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
            { 'kind': 'text', 'value': '.' },
        ]
    }
};

// Error templates
const templateErr1 = {
    'kind':'clause',
    'type':'org.accordproject.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'foo', 'value': 'This is a contract between ' },
            var1,
            { 'kind': 'text', 'value': ' and ' },
            var2,
        ]
    }
};
const templateErr2 = {
    'kind':'clause',
    'type':'org.accordproject.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': 'This is a contract between ' },
            { 'kind': 'variable', 'name': 'seller', 'type': 'FOO' },
            { 'kind': 'text', 'value': ' and ' },
            var2,
        ]
    }
};
const templateErr3 = {
    'kind':'clause',
    'type':'org.accordproject.MyContract',
    'value': {
        'kind':'sequence',
        'value': [
            { 'kind': 'text', 'value': 'This is a contract between ' },
            var1,
            { 'kind': 'text', 'value': ' and ' },
            { 'kind': 'block', 'type': 'unknownBlock' },
        ]
    }
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
            console.log(JSON.stringify(parserOfTemplateAst(template3).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR.')));
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
