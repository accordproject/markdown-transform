export = ToMarkdownVisitor;
/**
 * Converts a CommonMark DOM to a markdown string.
 *
 * Note that there are multiple ways of representing the same CommonMark DOM as text,
 * so this transformation is not guaranteed to equivalent if you roundtrip
 * markdown content. For example an H1 can be specified using either '#' or '='
 * notation.
 *
 * The resulting AST *should* be equivalent however.
 */
declare class ToMarkdownVisitor extends FromCommonMarkVisitor {
    /**
     * Construct the visitor.
     */
    constructor();
    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (as a Concerto object)
     * @returns {string} the markdown string
     */
    toMarkdown(input: any): string;
}
import FromCommonMarkVisitor = require("./FromCommonMarkVisitor");
