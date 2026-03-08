export = TypeVisitor;
/**
 * Adds the elementType property to a TemplateMark DOM
 * along with type specific metadata. This visitor verifies
 * the structure of a template with respect to an associated
 * template model and annotates the TemplateMark DOM with model
 * information for use in downstream tools.
 */
declare class TypeVisitor {
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
     * Get the type information for a property
     * @param {*} property the propety
     * @param {*} parameters the configuration parameters
     * @returns {*} the information about the next model element (property or declaration)
     */
    static nextModel(property: any, parameters: any): any;
    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing: any, parameters: any): void;
}
