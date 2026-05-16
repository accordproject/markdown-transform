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
     * @param {HtmlInput} input - CiceroMark DOM object
     * @returns {string} the html string
     */
    toHtml(input: HtmlInput): string;
    /**
     * Converts an html string to a CiceroMark DOM
     * @param {string} input - html string
     * @returns {IDocument} CiceroMark DOM
     */
    toCiceroMark(input: string): IDocument;
}
declare namespace HtmlTransformer {
    export { IDocument, Typed, HtmlInput };
}
type IDocument = import("@accordproject/markdown-common/types/model/commonmark").IDocument;
type Typed = import("@accordproject/concerto-core").Typed;
type HtmlInput = IDocument | Typed;
