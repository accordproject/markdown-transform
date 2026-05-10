export = CiceroMarkTransformer;
/**
 * @typedef {{
 *   type: string,
 *   tag: string,
 *   nesting: number,
 *   attrs?: Array<[string, string]> | null,
 *   map?: [number, number] | null,
 *   level?: number,
 *   children?: MarkdownToken[] | null,
 *   content?: string,
 *   markup?: string,
 *   info?: string,
 *   meta?: unknown,
 *   block?: boolean,
 *   hidden?: boolean
 * }} MarkdownToken
 */
/**
 * @typedef {MarkdownToken[]} MarkdownTokenStream
 */
/**
 * @typedef {{ $class: string, [key: string]: unknown }} CommonMarkJson
 */
/**
 * @typedef {{ $class: string, [key: string]: unknown }} CiceroMarkJson
 */
/**
 * @typedef {{ removeFormatting?: boolean, unquoteVariables?: boolean }} CiceroMarkTransformOptions
 */
/**
 * Converts a CiceroMark DOM to/from a
 * CommonMark DOM.
 *
 * Converts a CiceroMark DOM to/from a markdown string.
 */
declare class CiceroMarkTransformer {
    commonMark: import("@accordproject/markdown-common/types/lib/CommonMarkTransformer");
    modelManager: import("@accordproject/concerto-core/dist/modelmanager");
    serializer: import("@accordproject/concerto-core/dist/serializer");
    /**
     * Obtain the Clause text for a Clause node
     * @param {CiceroMarkJson} input CiceroMark DOM
     * @returns {string} markdown_cicero string
     */
    getClauseText(input: CiceroMarkJson): string;
    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {import('@accordproject/concerto-core').Serializer} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer(): import('@accordproject/concerto-core').Serializer;
    /**
     * Converts a CiceroEdit string to a CiceroMark DOM
     * @param {string} input - ciceroedit string
     * @returns {CiceroMarkJson} CiceroMark DOM
     */
    fromCiceroEdit(input: string): CiceroMarkJson;
    /**
     * Converts a CiceroMark DOM to a CiceroMark Unwrapped DOM
     * @param {CiceroMarkJson} input - CiceroMark DOM (JSON)
     * @param {CiceroMarkTransformOptions} [options] configuration options
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {CiceroMarkJson} CiceroMark DOM
     */
    toCiceroMarkUnwrapped(input: CiceroMarkJson, options?: CiceroMarkTransformOptions): CiceroMarkJson;
    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {CommonMarkJson} input - CommonMark DOM (in JSON)
     * @returns {CiceroMarkJson} CiceroMark DOM
     */
    fromCommonMark(input: CommonMarkJson): CiceroMarkJson;
    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @returns {CiceroMarkJson} ciceromark object (JSON)
     */
    fromMarkdown(markdown: string): CiceroMarkJson;
    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {CiceroMarkJson} input CiceroMark DOM
     * @param {CiceroMarkTransformOptions} [options] configuration options
     * @returns {string} markdown string
     */
    toMarkdown(input: CiceroMarkJson, options?: CiceroMarkTransformOptions): string;
    /**
     * Converts a cicero markdown string to a CiceroMark DOM
     * @param {string} markdown a cicero markdown string
     * @param {CiceroMarkTransformOptions} [options] configuration options
     * @returns {CiceroMarkJson} ciceromark object (JSON)
     */
    fromMarkdownCicero(markdown: string, options?: CiceroMarkTransformOptions): CiceroMarkJson;
    /**
     * Converts a CiceroMark DOM to a cicero markdown string
     * @param {CiceroMarkJson} input CiceroMark DOM
     * @returns {string} json commonmark object
     */
    toMarkdownCicero(input: CiceroMarkJson): string;
    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {CiceroMarkJson} input CiceroMark DOM
     * @param {CiceroMarkTransformOptions} [options] configuration options
     * @param {boolean} [options.removeFormatting] if true the formatting nodes are removed
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {CommonMarkJson} json commonmark object
     */
    toCommonMark(input: CiceroMarkJson, options?: CiceroMarkTransformOptions): CommonMarkJson;
    /**
     * Unquotes a CiceroMark DOM
     * @param {CiceroMarkJson} input CiceroMark DOM
     * @returns {CiceroMarkJson} unquoted CiceroMark DOM
     */
    unquote(input: CiceroMarkJson): CiceroMarkJson;
    /**
     * Converts a ciceromark string into a token stream
     *
     * @param {string} input the string to parse
     * @returns {MarkdownTokenStream} a markdown-it token stream
     */
    toTokens(input: string): {
        type: string;
        tag: string;
        nesting: number;
        attrs?: Array<[string, string]> | null;
        map?: [number, number] | null;
        level?: number;
        children?: MarkdownToken[] | null;
        content?: string;
        markup?: string;
        info?: string;
        meta?: unknown;
        block?: boolean;
        hidden?: boolean;
    }[];
    /**
     * Converts a token stream into a CiceroMark DOM object.
     *
     * @param {MarkdownTokenStream} tokenStream the token stream
     * @returns {CiceroMarkJson} the CiceroMark DOM (JSON)
     */
    fromTokens(tokenStream: {
        type: string;
        tag: string;
        nesting: number;
        attrs?: Array<[string, string]> | null;
        map?: [number, number] | null;
        level?: number;
        children?: MarkdownToken[] | null;
        content?: string;
        markup?: string;
        info?: string;
        meta?: unknown;
        block?: boolean;
        hidden?: boolean;
    }[]): CiceroMarkJson;
}
declare namespace CiceroMarkTransformer {
    export { MarkdownToken, MarkdownTokenStream, CommonMarkJson, CiceroMarkJson, CiceroMarkTransformOptions };
}
type CiceroMarkJson = {
    [key: string]: unknown;
    $class: string;
};
type CiceroMarkTransformOptions = {
    removeFormatting?: boolean;
    unquoteVariables?: boolean;
};
type CommonMarkJson = {
    [key: string]: unknown;
    $class: string;
};
type MarkdownToken = {
    type: string;
    tag: string;
    nesting: number;
    attrs?: Array<[string, string]> | null;
    map?: [number, number] | null;
    level?: number;
    children?: MarkdownToken[] | null;
    content?: string;
    markup?: string;
    info?: string;
    meta?: unknown;
    block?: boolean;
    hidden?: boolean;
};
type MarkdownTokenStream = {
    type: string;
    tag: string;
    nesting: number;
    attrs?: Array<[string, string]> | null;
    map?: [number, number] | null;
    level?: number;
    children?: MarkdownToken[] | null;
    content?: string;
    markup?: string;
    info?: string;
    meta?: unknown;
    block?: boolean;
    hidden?: boolean;
}[];
