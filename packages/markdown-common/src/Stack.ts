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

/**
 * Manages a stack of objects
 */
export class Stack {
    stack: any[];

    constructor() {
        this.stack = [];
        this.clear();
    }

    /**
     * Clears the stack
     */
    clear(): void {
        this.stack = [];
    }

    /**
     * Returns the top of the stack or null if the stack is empty
     */
    peek(): any {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack[this.stack.length - 1];
    }

    /**
     * Pushes a new object to the top of the stack
     * @param obj the node to push
     * @param appendItem whether the item is also appended as a child to
     * the item at the top of the stack
     */
    push(obj: any, appendItem = true): void {
        if (appendItem) {
            this.append(obj);
        }
        this.stack.push(obj);
    }

    /**
     * Appends an object to the 'nodes' array of the item at the top of the stack
     */
    append(obj: any): void {
        const top = this.peek();

        if (top && top.nodes) {
            top.nodes.push(obj);
        } else {
            throw new Error(`Cannot append. Invalid stack: ${JSON.stringify(this.stack, null, 4)}`);
        }
    }

    /**
     * Pops the top of the stack.
     */
    pop(): any {
        return this.stack.pop();
    }
}

export default Stack;
