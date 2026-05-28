export = Stack;
/**
 * Manages a stack of objects
 */
declare class Stack {
    /**
     * Clears the stack
     */
    clear(): void;
    stack: any[];
    /**
     * Returns the top of the stack or null if the stack is empty
     * @return {*} the top of the stack
     */
    peek(): any;
    /**
     * Pushes a new object to the top of the stack
     * @param {*} obj the node to push
     * @param {boolean} appendItem whether the item is also appended as a child to
     * the item at the top of the stack
     */
    push(obj: any, appendItem?: boolean): void;
    /**
     * Appends an object to the 'nodes' array of the item at the top of the stack
     * @param {*} obj the item to append to the top node
     */
    append(obj: any): void;
    /**
     * Pops the top of the stack.
     * @return {*} the top of the stack
     */
    pop(): any;
}
