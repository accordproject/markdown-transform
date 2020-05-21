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
const parserOfTemplate = require('../lib/FromTemplate').parserOfTemplate;

// Variables
const var1 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'seller', 'elementType': 'String' };
const var2 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'buyer', 'elementType': 'String' };
const var3 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'amount', 'elementType': 'Double' };
const var4 = { '$class': 'org.accordproject.templatemark.EnumVariableDefinition', 'name': 'currency', 'elementType': 'Enum', 'enumValues': ['USD', 'GBP', 'EUR'] };

// Valid templates
const template1 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'id':'clause1',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' and ' },
        var2,
    ]
};
const template2 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'id':'clause2',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' and ' },
        var2,
        { '$class': 'org.accordproject.templatemark.ConditionalDefinition', 'whenTrue': ', even in the presence of force majeure.', 'whenFalse': '' },
    ]
};
const template3 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'id':'clause3',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' and ' },
        var2,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' for the amount of ' },
        var3,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' ' },
        var4,
        { '$class': 'org.accordproject.templatemark.ConditionalDefinition', 'whenTrue': ', even in the presence of force majeure', 'whenFalse': '' },
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': '.' },
    ]
};

// Error templates
const templateErr1 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'elementType':'org.accordproject.MyContract',
    'nodes': [
        { '$class': 'foo', 'value': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' and ' },
        var2,
    ]
};
const templateErr2 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'elementType':'org.accordproject.MyContract',
    'nodes': [
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': 'This is a contract between ' },
        { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'seller', 'elementType': 'FOO' },
        { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': ' and ' },
        var2,
    ]
};

// Tests
describe('#templateparsers', () => {
    describe('#template1', () => {
        it('should parse', async () => {
            parserOfTemplate(template1,{contract:false}).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplate(template1,{contract:false}).parse('FOO').status.should.equal(false);
        });
    });

    describe('#template2', () => {
        it('should parse (no force majeure)', async () => {
            parserOfTemplate(template2,{contract:false}).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserOfTemplate(template2,{contract:false}).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplate(template2,{contract:false}).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeureXX.').status.should.equal(false);
        });
    });

    describe('#template3', () => {
        it('should parse (no force majeure)', async () => {
            parserOfTemplate(template3,{contract:false}).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR.').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserOfTemplate(template3,{contract:false}).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserOfTemplate(template3,{contract:false}).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.x00 EUR, even in the presence of force majeure.').status.should.equal(false);
        });
    });
});

describe('#invalidparsers', () => {
    describe('#templateErr1', () => {
        it('should throw for wrong $class', async () => {
            (() => parserOfTemplate(templateErr1,{contract:false})).should.throw('Unknown template ast $class foo');
        });
    });

    describe('#templateErr2', () => {
        it('should throw for wrong variable type', async () => {
            (() => parserOfTemplate(templateErr2,{contract:false})).should.throw('Unknown variable type FOO');
        });
    });
});
