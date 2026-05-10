export = HtmlTransformer;
/**
 * @typedef {{ $class: string, [key: string]: unknown }} CommonMarkJson
 */
/**
 * @typedef {{ $class: string, [key: string]: unknown }} CiceroMarkJson
 */
/**
 * @typedef {{ accept: Function, getType?: Function }} ConcertoTypedNode
 */
/**
 * @typedef {CommonMarkJson | CiceroMarkJson | ConcertoTypedNode} MarkdownDomInput
 */
/**
 * Converts a CiceroMark or CommonMark DOM to HTML
 */
declare class HtmlTransformer {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(...args: any[]);
    options: any;
    ciceroMarkTransformer: import("@accordproject/markdown-cicero/types/lib/CiceroMarkTransformer");
    /**
     * Converts a CiceroMark DOM to an html string
     * @param {MarkdownDomInput} input - CiceroMark DOM object
     * @returns {string} the html string
     */
    toHtml(input: MarkdownDomInput): string;
    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @returns {CiceroMarkJson} CiceroMark DOM
     */
    toCiceroMark(input: string): CiceroMarkJson;
}
declare namespace HtmlTransformer {
    export { CommonMarkJson, CiceroMarkJson, ConcertoTypedNode, MarkdownDomInput };
}
type MarkdownDomInput = {
    [key: string]: unknown;
    $class: string;
} | {
    [key: string]: unknown;
    $class: string;
} | {
    accept: Function;
    getType?: Function;
};
type CiceroMarkJson = {
    [key: string]: unknown;
    $class: string;
};
type CommonMarkJson = {
    [key: string]: unknown;
    $class: string;
};
type ConcertoTypedNode = {
    accept: Function;
    getType?: Function;
};
