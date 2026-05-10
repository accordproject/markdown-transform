export = TemplateMarkTransformer;
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
 * @typedef {{ $class: string, [key: string]: unknown }} TemplateMarkJson
 */
/**
 * @typedef {{ fileName?: string, content: string }} TemplateInput
 */
/**
 * @typedef {'clause' | 'contract'} TemplateKind
 */
/**
 * @typedef {{ verbose?: boolean }} TemplateTransformOptions
 */
/**
 * Support for TemplateMark Templates
 */
declare class TemplateMarkTransformer {
    /**
     * Converts a template string to a token stream
     * @param {TemplateInput} templateInput the template template
     * @returns {MarkdownTokenStream} the token stream
     */
    toTokens(templateInput: TemplateInput): {
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
     * Converts a template token strean string to a TemplateMark DOM
     * @param {MarkdownTokenStream} tokenStream the template token stream
     * @param {import('@accordproject/concerto-core').ModelManager} modelManager - the model manager for this template
     * @param {TemplateKind} templateKind - either 'clause' or 'contract'
     * @param {TemplateTransformOptions} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
    * @returns {TemplateMarkJson} the result of parsing
     */
    tokensToMarkdownTemplate(tokenStream: {
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
    }[], modelManager: import('@accordproject/concerto-core').ModelManager, templateKind: TemplateKind, options?: TemplateTransformOptions, conceptFullyQualifiedName?: string): TemplateMarkJson;
    /**
     * Converts a markdown string to a TemplateMark DOM
     * @param {TemplateInput} templateInput the template template
     * @param {import('@accordproject/concerto-core').ModelManager} modelManager - the model manager for this template
     * @param {TemplateKind} templateKind - either 'clause' or 'contract'
     * @param {TemplateTransformOptions} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
     * @returns {TemplateMarkJson} the result of parsing
     */
    fromMarkdownTemplate(templateInput: TemplateInput, modelManager: import('@accordproject/concerto-core').ModelManager, templateKind: TemplateKind, options?: TemplateTransformOptions, conceptFullyQualifiedName?: string): TemplateMarkJson;
    /**
     * Converts a TemplateMark DOM to a template markdown string
     * @param {TemplateMarkJson} input TemplateMark DOM
     * @returns {string} the template markdown text
     */
    toMarkdownTemplate(input: TemplateMarkJson): string;
    /**
     * Get TemplateMark serializer
     * @return {import('@accordproject/concerto-core').Serializer} templatemark serializer
     */
    getSerializer(): import('@accordproject/concerto-core').Serializer;
}
declare namespace TemplateMarkTransformer {
    export { MarkdownToken, MarkdownTokenStream, TemplateMarkJson, TemplateInput, TemplateKind, TemplateTransformOptions };
}
type TemplateInput = {
    fileName?: string;
    content: string;
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
type TemplateKind = "contract" | "clause";
type TemplateTransformOptions = {
    verbose?: boolean;
};
type TemplateMarkJson = {
    [key: string]: unknown;
    $class: string;
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
