export = HtmlTransformer;
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
     * @param {*} input - CiceroMark DOM object
     * @returns {string} the html string
     */
    toHtml(input: any): string;
    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @returns {*} CiceroMark DOM
     */
    toCiceroMark(input: string): any;
}
