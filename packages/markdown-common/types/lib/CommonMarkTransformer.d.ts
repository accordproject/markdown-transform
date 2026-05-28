export = CommonMarkTransformer;
/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
declare class CommonMarkTransformer {
    serializer: Serializer;
    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (in JSON)
     * @returns {string} the markdown string
     */
    toMarkdown(input: any): string;
    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     * @param {*} input - CommonMark DOM (in JSON)
     * @returns {string} the CommonMark DOM with formatting nodes removed
     */
    removeFormatting(input: any): string;
    /**
     * Converts a markdown string into a token stream
     *
     * @param {string} markdown the string to parse
     * @returns {*} a markdown-it token stream
     */
    toTokens(markdown: string): any;
    /**
     * Converts a token stream into a CommonMark DOM object.
     *
     * @param {object} tokenStream the token stream
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromTokens(tokenStream: object): any;
    /**
     * Converts a markdown string into a CommonMark DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {object} a CommonMark DOM (JSON) for the markdown content
     */
    fromMarkdown(markdown: string): object;
    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     */
    getSerializer(): any;
}
import { Serializer } from "@accordproject/concerto-core";
