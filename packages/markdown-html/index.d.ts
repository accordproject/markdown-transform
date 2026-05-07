export interface HtmlTransformerOptions {
    [name: string]: unknown;
}

export declare class HtmlTransformer {
    constructor(options?: HtmlTransformerOptions);
    toHtml(input: unknown): string;
    toCiceroMark(input: string): unknown;
}

export declare class ToHtmlStringVisitor {
    constructor(options?: HtmlTransformerOptions);
}
