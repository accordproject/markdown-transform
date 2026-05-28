export = ToParserVisitor;
declare const ToParserVisitor_base: typeof import("@accordproject/markdown-common/types/lib/FromCommonMarkVisitor");
/**
 * Converts a TemplateMark DOM to a parser.
 */
declare class ToParserVisitor extends ToParserVisitor_base {
    /**
     * Converts a TemplateMark DOM to a parser for that node, given parameters
     * @param {object} visitor - the visitor
     * @param {object} ast - the template AST
     * @param {object} parameters - current parameters
     * @returns {object} the parser
     */
    static toParserWithParameters(visitor: object, ast: object, parameters: object): object;
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     */
    constructor(options?: object);
    /**
     * Converts a TemplateMark DOM to a full parser
     * @param {*} parserManager - the parser manager
     * @param {object} ast - the template AST
     * @param {object} parsingTable - the parsing table
     * @returns {object} the parser
     */
    toParser(parserManager: any, ast: object, parsingTable: object): object;
}
