export = CommonMarkTransformer;
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
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
declare class CommonMarkTransformer {
    serializer: import("@accordproject/concerto-core/dist/serializer");
    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {CommonMarkJson} input - CommonMark DOM (in JSON)
     * @returns {string} the markdown string
     */
    toMarkdown(input: CommonMarkJson): string;
    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     * @param {CommonMarkJson} input - CommonMark DOM (in JSON)
     * @returns {CommonMarkJson} the CommonMark DOM with formatting nodes removed
     */
    removeFormatting(input: CommonMarkJson): CommonMarkJson;
    /**
     * Converts a markdown string into a token stream
     *
     * @param {string} markdown the string to parse
     * @returns {MarkdownTokenStream} a markdown-it token stream
     */
    toTokens(markdown: string): {
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
     * Converts a token stream into a CommonMark DOM object.
     *
     * @param {MarkdownTokenStream} tokenStream the token stream
     * @returns {CommonMarkJson} a Concerto object (DOM) for the markdown content
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
    }[]): CommonMarkJson;
    /**
     * Converts a markdown string into a CommonMark DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {CommonMarkJson} a CommonMark DOM (JSON) for the markdown content
     */
    fromMarkdown(markdown: string): CommonMarkJson;
    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {import('@accordproject/concerto-core').Serializer} a serializer capable of dealing with the Concerto
     */
    getSerializer(): import('@accordproject/concerto-core').Serializer;
}
declare namespace CommonMarkTransformer {
    export { MarkdownToken, MarkdownTokenStream, CommonMarkJson };
}
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
