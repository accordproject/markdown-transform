export = ToHtmlStringVisitor;
declare class ToHtmlStringVisitor {
    /**
     * Visits a sub-tree and return the html
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     * @returns {string} the html for the sub tree
     */
    static visitChildren(visitor: any, thing: any, parameters?: any): string;
    /**
     * Construct the visitor
     * @param {*} [options] configuration options
     */
    constructor(options?: any);
    options: any;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing: any, parameters: any): void;
}
