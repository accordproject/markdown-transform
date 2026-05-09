export = FormulaVisitor;
/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
declare class FormulaVisitor {
    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @param {string} field where the children are
     */
    static visitChildren(visitor: any, thing: any, parameters?: any, ...args: any[]): void;
    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor: any, things: any, parameters?: any): void;
    /**
     * Calculates the dependencies for TS code
     * @param {string} tsCode the TS code to analyze
     * @returns {string[]} array of dependencies
     */
    static calculateDependencies(tsCode: string): string[];
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing: any, parameters: any): void;
    /**
     * Calculate dependencies
     * @param {*} serializer - the template mark serializer
     * @param {object} ast - the template AST
     * @param {object} options - options
     * @param {number} [options.utcOffset] - UTC Offset for this execution
     * @returns {*} the formulas
     */
    calculateDependencies(serializer: any, ast: object, options: {
        utcOffset?: number;
    }): any;
    /**
     * Process formulas and returns the list of those formulas from a TemplateMark DOM
     * @param {*} serializer - the template mark serializer
     * @param {object} ast - the template AST
     * @param {object} options - options
     * @param {number} [options.utcOffset] - UTC Offset for this execution
     * @returns {*} the formulas
     */
    processFormulas(serializer: any, ast: object, options: {
        utcOffset?: number;
    }): any;
}
