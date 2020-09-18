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

// @ts-nocheck
/* eslint-disable no-undef */
'use strict';

const fs = require('fs');
const Decorators = require('./Decorators');

/**
 * Load a test node from disk
 * @param {string} name the name of the file to load
 * @returns {object} the node
 */
function loadNode(name) {
    return JSON.parse(fs.readFileSync( __dirname + `/../test/data/decorators/${name}`, 'utf-8'));
}

describe('decorators', () => {
    it('handles string decorator', () => {
        const decorators = new Decorators( loadNode('string.json'));
        expect(decorators.getDecoratorValue( 'Test', 'type')).toBe('value');
    });

    it('handles boolean decorator', () => {
        const decorators = new Decorators( loadNode('boolean.json'));
        expect(decorators.getDecoratorValue( 'Test', 'type')).toBe(true);
    });

    it('handles number decorator', () => {
        const decorators = new Decorators( loadNode('number.json'));
        expect(decorators.getDecoratorValue( 'Test', 'type')).toBe(3.14);
    });

    it('handles identifier decorator', () => {
        const decorators = new Decorators( loadNode('identifier.json'));
        expect(decorators.getDecoratorValue( 'Test', 'type')).toBe('typeIdentifier');
    });

    it('handles getting a value for a missing decorator', () => {
        const decorators = new Decorators( loadNode('string.json'));
        expect(decorators.getDecoratorValue( 'Missing', 'type')).toBe(null);
    });

    it('handles getting a missing value for a decorator', () => {
        const decorators = new Decorators( loadNode('string.json'));
        expect(decorators.getDecoratorValue( 'Test', 'missing')).toBe(undefined);
    });

    it('handles mutiple args decorator', () => {
        const decorators = new Decorators( loadNode('multi.json'));
        expect(decorators.getDecoratorValue( 'Test', 'type')).toBe('value');
        expect(decorators.getDecoratorValue( 'Test', 'second')).toBe('value2');
    });

    it('hasDecorator', () => {
        const decorators = new Decorators( loadNode('multi.json'));
        expect(decorators.hasDecorator( 'Test')).toBe(true);
    });

    it('getArguments', () => {
        const decorators = new Decorators( loadNode('multi.json'));
        expect(decorators.getArguments( 'Test')).toStrictEqual({second: 'value2', type: 'value'});
    });

    it('fails with odd number of arguments', () => {
        expect(() => new Decorators( loadNode('invalid-odd.json'))).toThrow('Arguments must be [name, value] pairs');
    });

    it('fails with argument names that are not strings', () => {
        expect(() => new Decorators( loadNode('invalid-arg-name.json'))).toThrow('Argument names must be strings');
    });

});
