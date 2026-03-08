export = FromCommonMarkVisitor;
/**
 * Converts a CommonMark DOM to something else
 */
declare class FromCommonMarkVisitor {
    /**
     * Construct the visitor.
     * @param {object} options configuration options
     * @param {*} resultString how to create a result from a string
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     * @param {*} setFirst whether entering this block should set first
     */
    constructor(options: object, resultString: any, resultSeq: any, rules: object, setFirst: any);
    options: any;
    resultString: any;
    resultSeq: any;
    rules: any;
    setFirst: any;
    /**
     * Visits a sub-tree
     * @param {*} visitor - the visitor to use
     * @param {*} thing - the node to visit
     * @param {*} parameters - the current parameters
     * @param {string} field - where to find the children nodes
     * @returns {*} the result for the sub tree
     */
    visitChildren(visitor: any, thing: any, parameters: any, field?: string): any;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing: any, parameters: any): void;
}
