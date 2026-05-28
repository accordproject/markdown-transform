export = Decorators;
/**
 * A class to retrieve decorators on CiceroMark nodes
 */
declare class Decorators {
    /**
     * Construct an instance, based on a CiceroMark node
     * Note that decorator arguments must be specified as an
     * array of [name (string),value] pairs, even though this is
     * not enforced by the Concerto grammar.
     * @param {object} node the CiceroMark node
     */
    constructor(node: object);
    data: {};
    /**
     * Returns true is the decorator is present
     * @param {string} decoratorName the name of the decorator
     * @returns {boolean} true is the decorator is present
     */
    hasDecorator(decoratorName: string): boolean;
    /**
     * Get the arguments for a named decorator
     * @param {string} decoratorName the name of the decorator
     * @returns {array} an array of arguments, or null
     */
    getArguments(decoratorName: string): any[];
    /**
     * Get the arguments for a named decorator
     * @param {string} decoratorName the name of the decorator
     * @param {string} argumentName the name of the decorator argument
     * @returns {object} the value of the argument or null if the decorator
     * is missing or undefined if the argument is missing
     */
    getDecoratorValue(decoratorName: string, argumentName: string): object;
}
