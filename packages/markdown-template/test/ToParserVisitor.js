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
const ModelManager = require('@accordproject/concerto-core').ModelManager;
const ParserManager = require('../lib/parsermanager');
const ToParserVisitor = require('../lib/ToParserVisitor');

const modelManager = new ModelManager();
const parserManager = new ParserManager(modelManager);
const parsingTable = parserManager.getParsingTable();

// Variables
const var1 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'seller', 'elementType': 'String' };
const var2 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'buyer', 'elementType': 'String' };
const var3 = { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'amount', 'elementType': 'Double' };
const var4 = { '$class': 'org.accordproject.templatemark.EnumVariableDefinition', 'name': 'currency', 'elementType': 'Enum', 'enumValues': ['USD', 'GBP', 'EUR'] };

// Valid templates
const template1 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.commonmark.Text', 'text': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' and ' },
        var2,
    ]
};
const template2 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.commonmark.Text', 'text': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' and ' },
        var2,
        { '$class': 'org.accordproject.templatemark.ConditionalDefinition',
            'name': 'forceMajeure',
            'whenTrue': [ { '$class': 'org.accordproject.commonmark.Text', 'text': ', even in the presence of force majeure.' } ],
            'whenFalse': [] },
    ]
};
const template3 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'name':'myClause',
    'elementType':'org.accordproject.MyClause',
    'nodes': [
        { '$class': 'org.accordproject.commonmark.Text', 'text': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' and ' },
        var2,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' for the amount of ' },
        var3,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' ' },
        var4,
        { '$class': 'org.accordproject.templatemark.ConditionalDefinition',
            'name': 'forceMajeure',
            'whenTrue': [ { '$class': 'org.accordproject.commonmark.Text', 'text': ', even in the presence of force majeure' } ],
            'whenFalse': [] },
        { '$class': 'org.accordproject.commonmark.Text', 'text': '.' },
    ]
};

// Error templates
const templateErr1 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'name':'myClause',
    'elementType':'org.accordproject.MyContract',
    'nodes': [
        { '$class': 'foo', 'text': 'This is a contract between ' },
        var1,
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' and ' },
        var2,
    ]
};
const templateErr2 = {
    '$class':'org.accordproject.templatemark.ClauseDefinition',
    'name':'myClause',
    'elementType':'org.accordproject.MyContract',
    'nodes': [
        { '$class': 'org.accordproject.commonmark.Text', 'text': 'This is a contract between ' },
        { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': 'seller', 'elementType': 'FOO' },
        { '$class': 'org.accordproject.commonmark.Text', 'text': ' and ' },
        var2,
    ]
};

// Tests
describe('#templateparsers', () => {
    let parserVisitor;
    before(async () => {
        parserVisitor = new ToParserVisitor();
    });

    describe('#template1', () => {
        it('should parse', async () => {
            parserVisitor.toParser(parserManager,template1,parsingTable).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserVisitor.toParser(parserManager,template1,parsingTable).parse('FOO').status.should.equal(false);
        });
    });

    describe('#template2', () => {
        it('should parse (no force majeure)', async () => {
            parserVisitor.toParser(parserManager,template2,parsingTable).parse('This is a contract between "Steve" and "Betty"').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserVisitor.toParser(parserManager,template2,parsingTable).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserVisitor.toParser(parserManager,template2,parsingTable).parse('This is a contract between "Steve" and "Betty", even in the presence of force majeureXX.').status.should.equal(false);
        });
    });

    describe('#template3', () => {
        it('should parse (no force majeure)', async () => {
            parserVisitor.toParser(parserManager,template3,parsingTable).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR.').status.should.equal(true);
        });
        it('should parse (with force majeure)', async () => {
            parserVisitor.toParser(parserManager,template3,parsingTable).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.00 EUR, even in the presence of force majeure.').status.should.equal(true);
        });
        it('should not parse', async () => {
            parserVisitor.toParser(parserManager,template3,parsingTable).parse('This is a contract between "Steve" and "Betty" for the amount of 3131.x00 EUR, even in the presence of force majeure.').status.should.equal(false);
        });
    });
});

describe('#invalidparsers', () => {
    let parserVisitor;
    before(async () => {
        parserVisitor = new ToParserVisitor();
    });

    describe('#templateErr1', () => {
        it('should throw for wrong $class', async () => {
            (() => parserVisitor.toParser(parserManager,templateErr1,parsingTable)).should.throw('Namespace is not defined for type "foo"');
        });
    });

    describe('#templateErr2', () => {
        it('should throw for wrong variable type', async () => {
            (() => parserVisitor.toParser(parserManager,templateErr2,parsingTable)).should.throw('Namespace is not defined for type "FOO"');
        });
    });
});
