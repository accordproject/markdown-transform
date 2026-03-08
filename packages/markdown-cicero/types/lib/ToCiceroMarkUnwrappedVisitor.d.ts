export = ToCiceroMarkUnwrappedVisitor;
/**
 * Converts a CiceroMark DOM to a CiceroMark unwrapped DOM
 */
declare class ToCiceroMarkUnwrappedVisitor {
    /**
     * Visits a sub-tree and return the CommonMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor: any, thing: any, parameters?: any): void;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     * @return {*[]} result nodes
     */
    visit(thing: any, parameters: any): any[];
}
