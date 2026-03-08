export = ToCiceroMarkVisitor;
/**
 * Drafts a CiceroMark DOM from a TemplateMark DOM
 */
declare class ToCiceroMarkVisitor {
    /**
     * Clone a CiceroMark node
     * @param {*} serializer the serializer
     * @param {*} node the node to visit
     * @param {*} [parameters] optional parameters
     * @return {*} the cloned node
     */
    static cloneNode(serializer: any, node: any): any;
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
     * @return {*} the visited nodes
     */
    static visitNodes(visitor: any, things: any, parameters?: any): any;
    /**
     * Match template tag to instance tag
     * @param {string} tag the template tag
     * @return {string} the corresponding instance tag
     */
    static matchTag(tag: string): string;
    /**
     * Evaluates a JS expression
     * @param {*} data the contract data
     * @param {string} expression the JS expression
     * @param {Date} now the current value for now
     * @returns {Boolean} the result of evaluating the expression against the data
     */
    static eval(data: any, expression: string, now: Date): boolean;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     * @return {*} the visited nodes
     */
    visit(thing: any, parameters: any): any;
}
