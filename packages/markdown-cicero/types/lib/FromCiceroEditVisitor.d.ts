export = FromCiceroEditVisitor;
/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
declare class FromCiceroEditVisitor {
    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor: any, thing: any, parameters?: any): void;
    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor: any, things: any, parameters?: any): void;
    /**
     * Find an attribute from its name
     * @param {*} attributes - the array of attributes
     * @param {string} name - the name of the attributes
     * @return {*} the attribute or undefined
     */
    static getAttribute(attributes: any, name: string): any;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing: any, parameters: any): void;
}
