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

const Stack = require('./Stack');

describe('#stack', () => {
    it('integers', () => {
        const stack = new Stack();
        expect(stack.peek()).toBeNull();
        stack.push(1,false);
        expect(stack.peek()).toBe(1);
        expect(stack.pop()).toBe(1);
        expect(stack.peek()).toBeNull();
    });

    it.only('nodes', () => {
        const stack = new Stack();
        expect(stack.peek()).toBeNull();
        stack.push({nodes:[]},false);
        expect(stack.peek().nodes.length).toBe(0);
        stack.push({nodes:[1]},true);
        expect(stack.peek().nodes.length).toBe(1);
        stack.push({nodes:[2,3]},true);
        expect(stack.peek().nodes.length).toBe(2);
        stack.clear();
        expect(stack.peek()).toBeNull();
    });

    it.only('invalid', () => {
        const stack = new Stack();
        expect(stack.peek()).toBeNull();
        stack.push({foo:[]},false);
        expect(() => stack.push({foo:[]},true)).toThrow('Cannot append. Invalid stack: [\n    {\n        "foo": []\n    }\n]');
    });
});
