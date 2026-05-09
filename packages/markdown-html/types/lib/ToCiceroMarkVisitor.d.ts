export = ToCiceroMarkVisitor;
/**
 * Converts an html string to a CiceroMark DOM
 *
 */
declare class ToCiceroMarkVisitor {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(...args: any[]);
    options: any;
    rules: any[];
    /**
     * Filter out cruft newline nodes inserted by the DOM parser.
     *
     * @param {Object} element DOM element
     * @return {Boolean} true if node is not a new line
     */
    cruftNewline(element: any): boolean;
    /**
     * Deserialize a DOM element.
     *
     * @param {Object} element DOM element
     * @param {boolean} ignoreSpace override
     * @return {Any} node
     */
    deserializeElement(element: any, ignoreSpace: boolean): Any;
    /**
     * Deserialize an array of DOM elements.
     *
     * @param {Array} elements DOM elements
     * @param {boolean} ignoreSpace override
     * @return {Array} array of nodes
     */
    deserializeElements(...args: any[]): any[];
    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} CiceroMark DOM
     */
    toCiceroMark(input: string, ...args: any[]): any;
}
