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
     * @param {object} input - CommonMark DOM (in JSON)
     * @returns {string} the markdown string
     */
    toMarkdown(input: object): string;
    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     * @param {object} input - CommonMark DOM (in JSON)
     * @returns {object} the CommonMark DOM with formatting nodes removed
     */
    removeFormatting(input: object): object;
    /**
     * Converts a markdown string into a token stream
     *
     * @param {string} markdown the string to parse
     * @returns {object[]} a markdown-it token stream
     */
    toTokens(markdown: string): object[];
    /**
     * Converts a token stream into a CommonMark DOM object.
     *
     * @param {object[]} tokenStream the token stream
     * @returns {object} a Concerto object (DOM) for the markdown content
     */
    fromTokens(tokenStream: object[]): object;
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
     * @returns {Serializer} a serializer capable of dealing with the Concerto
     */
    getSerializer(): Serializer;
}
import { Serializer } from "@accordproject/concerto-core";
