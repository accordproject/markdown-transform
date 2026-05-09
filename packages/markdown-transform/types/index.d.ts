export const formatDescriptor: (format: string) => object;
export const transform: (source: object | string, sourceFormat: string, destinationFormat: string[], parameters: object, options?: object) => Promise<object | string>;
export const TransformEngine: typeof import("./lib/transformEngine");
export const builtinTransformationGraph: {
    markdown_template: {
        docs: string;
        fileFormat: string;
        templatemark_tokens: (input: any, parameters: any, options: any) => object;
    };
    templatemark_tokens: {
        docs: string;
        fileFormat: string;
        templatemark: (input: any, parameters: any, options: any) => Promise<object>;
    };
    templatemark: {
        docs: string;
        fileFormat: string;
        markdown_template: (input: any, parameters: any, options: any) => string;
    };
    markdown: {
        docs: string;
        fileFormat: string;
        commonmark_tokens: (input: any, parameters: any, options: any) => object[];
    };
    commonmark_tokens: {
        docs: string;
        fileFormat: string;
        commonmark: (input: any, parameters: any, options: any) => Promise<import("@accordproject/markdown-common/types/model/commonmark").IDocument>;
    };
    markdown_cicero: {
        docs: string;
        fileFormat: string;
        ciceromark_tokens: (input: any, parameters: any, options: any) => object[];
    };
    ciceromark_tokens: {
        docs: string;
        fileFormat: string;
        ciceromark: (input: any, parameters: any, options: any) => Promise<import("@accordproject/markdown-common/types/model/commonmark").IDocument>;
    };
    commonmark: {
        docs: string;
        fileFormat: string;
        markdown: (input: any, parameters: any, options: any) => string;
        ciceromark: (input: any, parameters: any, options: any) => import("@accordproject/markdown-common/types/model/commonmark").IDocument;
        plaintext: (input: any, parameters: any, options: any) => string;
    };
    ciceromark: {
        docs: string;
        fileFormat: string;
        markdown_cicero: (input: any, parameters: any, options: any) => string;
        commonmark: (input: any, parameters: any, options: any) => import("@accordproject/markdown-common/types/model/commonmark").IDocument;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
    ciceromark_parsed: {
        docs: string;
        fileFormat: string;
        html: (input: any, parameters: any, options: any) => string;
        ciceromark: (input: any, parameters: any, options: any) => import("@accordproject/markdown-common/types/model/commonmark").IDocument;
        ciceromark_unquoted: (input: any, parameters: any, options: any) => import("@accordproject/markdown-common/types/model/commonmark").IDocument;
    };
    plaintext: {
        docs: string;
        fileFormat: string;
        markdown: (input: any, parameters: any, options: any) => any;
    };
    ciceroedit: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => import("@accordproject/markdown-common/types/model/commonmark").IDocument;
    };
    ciceromark_unquoted: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
    html: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => object;
    };
};
