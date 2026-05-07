export interface ModelDefinition {
    MODEL: string;
    NAMESPACE: string;
    [name: string]: unknown;
}

export declare class Stack<T = unknown> {
    constructor(...args: unknown[]);
}

export declare const CommonMarkModel: ModelDefinition;
export declare const CiceroMarkModel: ModelDefinition;
export declare const ConcertoMetaModel: ModelDefinition;
export declare const TemplateMarkModel: ModelDefinition;

export declare const CommonMarkUtils: Record<string, unknown>;
export declare const fromcommonmarkrules: Record<string, unknown>;

export declare class FromCommonMarkVisitor {
    constructor(...args: unknown[]);
}

export declare class ToMarkdownVisitor {
    constructor(...args: unknown[]);
}

export declare class FromMarkdownIt {
    constructor(...args: unknown[]);
    toCommonMark(tokenStream: unknown): unknown;
}

export declare class CommonMarkTransformer {
    constructor();
    toMarkdown(input: unknown): string;
    removeFormatting(input: unknown): unknown;
    toTokens(markdown: string): unknown;
    fromTokens(tokenStream: unknown): unknown;
    fromMarkdown(markdown: string): unknown;
    getSerializer(): unknown;
}
