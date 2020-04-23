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

// Basic parser constructors
const doubleVariableParser = require('../lib/coreparsers').doubleVariableParser;
const stringVariableParser = require('../lib/coreparsers').stringVariableParser;
const enumVariableParser = require('../lib/coreparsers').enumVariableParser;

const condParser = require('../lib/coreparsers').condParser;

const textParser = require('../lib/coreparsers').textParser;
const seqParser = require('../lib/coreparsers').seqParser;

// Variables
const var1 = { 'kind': 'variable', 'name': 'seller', 'type': 'String' };
//const var2 = { 'kind': 'variable', 'name': 'buyer', 'type': 'String' };
const var3 = { 'kind': 'variable', 'name': 'amount', 'type': 'Double' };
const var4 = { 'kind': 'variable', 'name': 'currency', 'type': 'Enum', 'value': ['USD','GBP','EUR'] };

describe('#coreparsers', () => {
    describe('#variables', () => {
        it('should parse double', async () => {
            doubleVariableParser(var3).parse('123.313e-33').status.should.equal(true);
        });
        it('should not parse if not double', async () => {
            doubleVariableParser(var3).parse('123.a313e-33').status.should.equal(false);
        });

        it('should parse string', async () => {
            stringVariableParser(var1).parse('"foo"').status.should.equal(true);
        });
        it('should not parse string without opening quote', async () => {
            stringVariableParser(var1).parse('foo"').status.should.equal(false);
        });
        it('should not parse string without closing quote', async () => {
            stringVariableParser(var1).parse('"foo').status.should.equal(false);
        });

        it('should parse enum (first value)', async () => {
            enumVariableParser(var4,['USD','JPY','GBP']).parse('USD').status.should.equal(true);
        });
        it('should parse enum (last value)', async () => {
            enumVariableParser(var4,['USD','JPY','GBP']).parse('GBP').status.should.equal(true);
        });
        it('should not parse value not in enum', async () => {
            enumVariableParser(var4,['USD','JPY','GBP']).parse('FOO').status.should.equal(false);
        });
    });

    describe('#blocks', () => {
        it('should parse conditional (left)', async () => {
            condParser('left','right').parse('left').status.should.equal(true);
        });
        it('should parse conditional (right)', async () => {
            condParser('left','right').parse('right').status.should.equal(true);
        });
        it('should not parse conditional neither left nor right', async () => {
            condParser('left','right').parse('foo').status.should.equal(false);
        });
    });

    describe('#structural', () => {
        it('should parse matching text', async () => {
            textParser('This is text\nwith breaks and other things\nin it\n').parse('This is text\nwith breaks and other things\nin it\n').status.should.equal(true);
        });
        it('should not parse non matching text', async () => {
            textParser('This is text with breaks and other things\nin it\n').parse('This is text\nwith breaks and other things\nin it\n').status.should.equal(false);
        });
        it('should parse sequences', async () => {
            seqParser([textParser('This is text\nwith breaks and other things\nin it including a variable: '),stringVariableParser(var1),textParser('\nAnd more text')]).parse('This is text\nwith breaks and other things\nin it including a variable: "John Doe"\nAnd more text').status.should.equal(true);
        });
        it('should not parse sequences when one parser fails', async () => {
            seqParser([textParser('This is text\nwith breaks and other things\nin it including a variable: '),stringVariableParser(var1),textParser('\nAnd more text')]).parse('This is text\nwith breaks and other things\nin it including a variable: "John Doe\nAnd more text').status.should.equal(false);
        });
    });
});
