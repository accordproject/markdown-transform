export = FromMarkdownIt;
/**
 * Converts a markdown-it token stream to a CommonMark DOM
 */
declare class FromMarkdownIt {
    /**
     * Takes the stack of constructed inline nodes
     * properly closing them (if the close token is missing in the markdown)
     * returns the final root node for the inline
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @param {*[]} stack - the stack of constructed nodes
     * @returns {*} the final inline node
     */
    static closeInlines(rules: any[], stack: any[]): any;
    /**
     * Create a callback for inlines
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @returns {*} the callback
     */
    static inlineCallback(rules: any[]): any;
    /**
     * Process an inline node to CommonMark DOM
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @param {*} tokens - the content of the inline node
     * @param {*[]} stack - the stack of constructed nodes
     */
    static inlineToCommonMark(rules: any[], tokens: any, stack: any[]): void;
    /**
     * Transform a block token stream to CommonMark DOM
     *
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     * @param {*} tokens - the markdown-it token stream
     * @returns {*} the CommonMark nodes
     */
    static blockToCommonMark(rules: any[], tokens: any): any;
    /**
     * Construct the transformer
     * @param {*[]} rules - the rules for each kind of markdown-it tokens
     */
    constructor(rules: any[]);
    rules: {
        inlines: {};
        blocks: {};
    };
    /**
     * Transform a token stream to CommonMark DOM
     *
     * @param {*} tokens - the markdown-it token stream
     * @returns {*} the CommonMark nodes
     */
    toCommonMark(tokens: any): any;
}
