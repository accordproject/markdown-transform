export = ToMarkdownTemplateVisitor;
declare const ToMarkdownTemplateVisitor_base: typeof import("@accordproject/markdown-common/types/lib/FromCommonMarkVisitor");
/**
 * Converts a TemplateMark DOM to a template markdown string.
 */
declare class ToMarkdownTemplateVisitor extends ToMarkdownTemplateVisitor_base {
    /**
     * Construct the visitor.
     * @param {object} [options] configuration options
     * @param {*} resultSeq how to sequentially combine results
     * @param {object} rules how to process each node type
     */
    constructor(options?: object);
    /**
     * Converts a TemplateMark DOM to a template markdown string.
     * @param {*} serializer - TemplateMark serializer
     * @param {*} input - TemplateMark DOM (JSON)
     * @returns {string} the template markdown string
     */
    toMarkdownTemplate(serializer: any, input: any): string;
}
