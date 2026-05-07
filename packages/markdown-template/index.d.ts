export interface TemplateInput {
    fileName?: string;
    content: string;
}

export interface TemplateOptions {
    verbose?: boolean;
    [name: string]: unknown;
}

export declare const util: Record<string, unknown>;
export declare const templatemarkutil: Record<string, unknown>;
export declare const datetimeutil: Record<string, unknown>;

export declare function normalizeNLs(input: string): string;

export declare class TemplateException extends Error {
    constructor(message?: string);
}

export declare class TemplateMarkTransformer {
    toTokens(templateInput: TemplateInput): unknown;
    tokensToMarkdownTemplate(
        tokenStream: unknown,
        modelManager: unknown,
        templateKind: string,
        options?: TemplateOptions,
        conceptFullyQualifiedName?: string
    ): unknown;
    fromMarkdownTemplate(
        templateInput: TemplateInput,
        modelManager: unknown,
        templateKind: string,
        options?: TemplateOptions,
        conceptFullyQualifiedName?: string
    ): unknown;
    toMarkdownTemplate(input: unknown): string;
    getSerializer(): unknown;
}
