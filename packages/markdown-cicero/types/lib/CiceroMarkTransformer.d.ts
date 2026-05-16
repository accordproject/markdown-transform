export = CiceroMarkTransformer;
/**
 * Converts a CiceroMark DOM to/from a
 * CommonMark DOM.
 *
 * Converts a CiceroMark DOM to/from a markdown string.
 */
declare class CiceroMarkTransformer {
    commonMark: import("@accordproject/markdown-common/types/lib/CommonMarkTransformer");
    modelManager: ModelManager;
    serializer: Serializer;
    /**
     * Obtain the Clause text for a Clause node
     * @param {IClause} input CiceroMark DOM
     * @returns {string} markdown_cicero string
     */
    getClauseText(input: IClause): string;
    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {Serializer} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer(): Serializer;
    /**
     * Converts a CiceroEdit string to a CiceroMark DOM
     * @param {string} input - ciceroedit string
     * @returns {ICiceroDocument} CiceroMark DOM
     */
    fromCiceroEdit(input: string): ICiceroDocument;
    /**
     * Converts a CiceroMark DOM to a CiceroMark Unwrapped DOM
     * @param {ICiceroDocument} input - CiceroMark DOM (JSON)
     * @param {object} [options] configuration options
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {ICiceroDocument} CiceroMark DOM
     */
    toCiceroMarkUnwrapped(input: ICiceroDocument, options?: {
        unquoteVariables?: boolean;
    }): ICiceroDocument;
    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {IDocument} input - CommonMark DOM (in JSON)
     * @returns {ICiceroDocument} CiceroMark DOM
     */
    fromCommonMark(input: IDocument): ICiceroDocument;
    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @returns {ICiceroDocument} ciceromark object (JSON)
     */
    fromMarkdown(markdown: string): ICiceroDocument;
    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {ICiceroDocument} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {string} markdown string
     */
    toMarkdown(input: ICiceroDocument, options?: object): string;
    /**
     * Converts a cicero markdown string to a CiceroMark DOM
     * @param {string} markdown a cicero markdown string
     * @param {object} [options] configuration options
     * @returns {ICiceroDocument} ciceromark object (JSON)
     */
    fromMarkdownCicero(markdown: string, options?: object): ICiceroDocument;
    /**
     * Converts a CiceroMark DOM to a cicero markdown string
     * @param {ICiceroDocument} input CiceroMark DOM
     * @returns {string} cicero markdown string
     */
    toMarkdownCicero(input: ICiceroDocument): string;
    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {ICiceroDocument} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @param {boolean} [options.removeFormatting] if true the formatting nodes are removed
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {IDocument} CommonMark DOM
     */
    toCommonMark(input: ICiceroDocument, options?: {
        removeFormatting?: boolean;
        unquoteVariables?: boolean;
    }): IDocument;
    /**
     * Unquotes a CiceroMark DOM
     * @param {ICiceroDocument} input CiceroMark DOM
     * @returns {ICiceroDocument} unquoted CiceroMark DOM
     */
    unquote(input: ICiceroDocument): ICiceroDocument;
    /**
     * Converts a ciceromark string into a token stream
     *
     * @param {string} input the string to parse
     * @returns {object[]} a markdown-it token stream
     */
    toTokens(input: string): object[];
    /**
     * Converts a token stream into a CiceroMark DOM object.
     *
     * @param {object[]} tokenStream the token stream
     * @returns {ICiceroDocument} the CiceroMark DOM (JSON)
     */
    fromTokens(tokenStream: object[]): ICiceroDocument;
}
declare namespace CiceroMarkTransformer {
    export { IDocument, ICiceroDocument, IClause };
}
import { ModelManager } from "@accordproject/concerto-core";
import { Serializer } from "@accordproject/concerto-core";
type IDocument = import("@accordproject/markdown-common/types/model/commonmark").IDocument;
type ICiceroDocument = import("@accordproject/markdown-common/types/model/commonmark").IDocument;
type IClause = import("@accordproject/markdown-common/types/model/ciceromark").IClause;
