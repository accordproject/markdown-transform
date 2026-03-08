export = ToMarkdownCiceroVisitor;
declare const ToMarkdownCiceroVisitor_base: typeof import("@accordproject/markdown-common/types/lib/FromCommonMarkVisitor");
/**
 * Converts a CiceroMark DOM to a cicero markdown string.
 */
declare class ToMarkdownCiceroVisitor extends ToMarkdownCiceroVisitor_base {
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     */
    constructor(options?: object);
    /**
     * Converts a CiceroMark DOM to a cicero markdown string.
     * @param {*} input - CiceroMark DOM (JSON)
     * @returns {string} the cicero markdown string
     */
    toMarkdownCicero(input: any): string;
}
