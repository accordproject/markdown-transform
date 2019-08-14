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

/**
 * Manages a stack of Slate.js Nodes
 */
class Stack {

    /**
    * Constructor
    */
    constructor() {
        this.clear();
    }

    /**
   * Clears the stack
   */
    clear() {
        this.stack = [];
    }

    /**
   * Returns the top of the stack or null if the stack is empty
   * @return {*} the top of the stack
   */
    peek() {
        if(this.stack.length === 0) {
            return null;
        }

        return this.stack[this.stack.length - 1];
    }

    /**
   * Pushes a new object to the top of the stack
   * @param {*} obj the node to push
   * @param {boolean} appendItem whether the item is also appended as a child to
   * the item at the top of the stack
   */
    push(obj, appendItem = true) {
        if (appendItem) {
            this.append(obj);
        }

        this.stack.push(obj);
    }

    /**
   * Appends an object to the 'nodes' array of the item at the top of the stack
   * @param {*} obj the item to append to the top node
   */
    append(obj) {
        const top = this.peek();

        if (top && top.nodes) {
            top.nodes.push(obj);
        } else {
            throw new Error(`Cannot append. Invalid stack: ${JSON.stringify(this.stack, null, 4)}`);
        }
    }

    /**
   * Pops the top of the stack.
   * @return {*} the top of the stack
   */
    pop() {
        return this.stack.pop();
    }

    /**
   * Adds a new text leaf node.
   * @param {*} leaf the text node
   */
    addTextLeaf(leaf) {
        this.append({ object: 'text', text: leaf.text, marks: leaf.marks });
    }
}

module.exports = Stack;
