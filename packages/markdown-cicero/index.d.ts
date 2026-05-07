export interface CiceroMarkOptions {
    removeFormatting?: boolean;
    unquoteVariables?: boolean;
    [name: string]: unknown;
}

export declare class CiceroMarkTransformer {
    constructor();
    getClauseText(input: unknown): string;
    getSerializer(): unknown;
    fromCiceroEdit(input: string): unknown;
    toCiceroMarkUnwrapped(input: unknown, options?: CiceroMarkOptions): unknown;
    fromCommonMark(input: unknown): unknown;
    fromMarkdown(markdown: string): unknown;
    toMarkdown(input: unknown, options?: CiceroMarkOptions): string;
    fromMarkdownCicero(markdown: string, options?: CiceroMarkOptions): unknown;
    toMarkdownCicero(input: unknown): string;
    toCommonMark(input: unknown, options?: CiceroMarkOptions): unknown;
    unquote(input: unknown): unknown;
    toTokens(input: string): unknown;
    fromTokens(tokenStream: unknown): unknown;
}

export declare class FromCiceroEditVisitor {
    constructor(...args: unknown[]);
}

export declare class ToCommonMarkVisitor {
    constructor(...args: unknown[]);
}

export declare const Decorators: Record<string, unknown>;
