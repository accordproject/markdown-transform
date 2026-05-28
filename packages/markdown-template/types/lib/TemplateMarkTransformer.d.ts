export = TemplateMarkTransformer;
/**
 * Support for TemplateMark Templates
 */
declare class TemplateMarkTransformer {
    /**
     * Converts a template string to a token stream
     * @param {object} templateInput the template template
     * @returns {object} the token stream
     */
    toTokens(templateInput: object): object;
    /**
     * Converts a template token strean string to a TemplateMark DOM
     * @param {object} tokenStream the template token stream
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
    * @returns {object} the result of parsing
     */
    tokensToMarkdownTemplate(tokenStream: object, modelManager: object, templateKind: string, options?: {
        verbose?: boolean;
    }, conceptFullyQualifiedName?: string): object;
    /**
     * Converts a markdown string to a TemplateMark DOM
     * @param {{fileName:string,content:string}} templateInput the template template
     * @param {object} modelManager - the model manager for this template
     * @param {string} templateKind - either 'clause' or 'contract'
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
     * @returns {object} the result of parsing
     */
    fromMarkdownTemplate(templateInput: {
        fileName: string;
        content: string;
    }, modelManager: object, templateKind: string, options?: {
        verbose?: boolean;
    }, conceptFullyQualifiedName?: string): object;
    /**
     * Converts a TemplateMark DOM to a template markdown string
     * @param {object} input TemplateMark DOM
     * @returns {string} the template markdown text
     */
    toMarkdownTemplate(input: object): string;
    /**
     * Get TemplateMark serializer
     * @return {*} templatemark serializer
     */
    getSerializer(): any;
}
