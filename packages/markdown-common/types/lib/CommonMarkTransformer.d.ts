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
     * @param {INode} input - CommonMark DOM (in JSON)
     * @returns {string} the markdown string
     */
    toMarkdown(input: INode): string;
    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     * @param {IDocument} input - CommonMark DOM (in JSON)
     * @returns {IDocument} the CommonMark DOM with formatting nodes removed
     */
    removeFormatting(input: IDocument): IDocument;
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
     * @returns {IDocument} a Concerto object (DOM) for the markdown content
     */
    fromTokens(tokenStream: object[]): IDocument;
    /**
     * Converts a markdown string into a CommonMark DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {IDocument} a CommonMark DOM (JSON) for the markdown content
     */
    fromMarkdown(markdown: string): IDocument;
    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {Serializer} a serializer capable of dealing with the Concerto
     */
    getSerializer(): Serializer;
}
declare namespace CommonMarkTransformer {
    export { IDocument, INode };
}
import { Serializer } from "@accordproject/concerto-core";
type IDocument = import("@accordproject/markdown-common/types/model/commonmark").IDocument;
type INode = import("@accordproject/markdown-common/types/model/commonmark").INode;
