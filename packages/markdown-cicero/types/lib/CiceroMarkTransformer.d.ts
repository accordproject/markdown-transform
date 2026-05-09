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
     * @param {object} input CiceroMark DOM
     * @returns {string} markdown_cicero string
     */
    getClauseText(input: object): string;
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
     * @returns {object} CiceroMark DOM
     */
    fromCiceroEdit(input: string): object;
    /**
     * Converts a CiceroMark DOM to a CiceroMark Unwrapped DOM
     * @param {object} input - CiceroMark DOM (JSON)
     * @param {object} [options] configuration options
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {object} CiceroMark DOM
     */
    toCiceroMarkUnwrapped(input: object, options?: {
        unquoteVariables?: boolean;
    }): object;
    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {object} input - CommonMark DOM (in JSON)
     * @returns {object} CiceroMark DOM
     */
    fromCommonMark(input: object): object;
    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @returns {object} ciceromark object (JSON)
     */
    fromMarkdown(markdown: string): object;
    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {object} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {string} markdown string
     */
    toMarkdown(input: object, options?: object): string;
    /**
     * Converts a cicero markdown string to a CiceroMark DOM
     * @param {string} markdown a cicero markdown string
     * @param {object} [options] configuration options
     * @returns {object} ciceromark object (JSON)
     */
    fromMarkdownCicero(markdown: string, options?: object): object;
    /**
     * Converts a CiceroMark DOM to a cicero markdown string
     * @param {object} input CiceroMark DOM
     * @returns {string} json commonmark object
     */
    toMarkdownCicero(input: object): string;
    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {object} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @param {boolean} [options.removeFormatting] if true the formatting nodes are removed
     * @param {boolean} [options.unquoteVariables] if true variable quotations are removed
     * @returns {object} json commonmark object
     */
    toCommonMark(input: object, options?: {
        removeFormatting?: boolean;
        unquoteVariables?: boolean;
    }): object;
    /**
     * Unquotes a CiceroMark DOM
     * @param {object} input CiceroMark DOM
     * @returns {object} unquoted CiceroMark DOM
     */
    unquote(input: object): object;
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
     * @returns {object} the CiceroMark DOM (JSON)
     */
    fromTokens(tokenStream: object[]): object;
}
import { ModelManager } from "@accordproject/concerto-core";
import { Serializer } from "@accordproject/concerto-core";
