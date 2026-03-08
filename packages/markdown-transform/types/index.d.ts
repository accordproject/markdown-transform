export const formatDescriptor: (format: any) => any;
export const transform: (source: any, sourceFormat: any, destinationFormat: any, parameters: any, options: any) => any;
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
        commonmark_tokens: (input: any, parameters: any, options: any) => any;
    };
    commonmark_tokens: {
        docs: string;
        fileFormat: string;
        commonmark: (input: any, parameters: any, options: any) => Promise<any>;
    };
    markdown_cicero: {
        docs: string;
        fileFormat: string;
        ciceromark_tokens: (input: any, parameters: any, options: any) => any;
    };
    ciceromark_tokens: {
        docs: string;
        fileFormat: string;
        ciceromark: (input: any, parameters: any, options: any) => Promise<any>;
    };
    commonmark: {
        docs: string;
        fileFormat: string;
        markdown: (input: any, parameters: any, options: any) => string;
        ciceromark: (input: any, parameters: any, options: any) => any;
        plaintext: (input: any, parameters: any, options: any) => string;
    };
    ciceromark: {
        docs: string;
        fileFormat: string;
        markdown_cicero: (input: any, parameters: any, options: any) => string;
        commonmark: (input: any, parameters: any, options: any) => any;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
    ciceromark_parsed: {
        docs: string;
        fileFormat: string;
        html: (input: any, parameters: any, options: any) => string;
        ciceromark: (input: any, parameters: any, options: any) => any;
        ciceromark_unquoted: (input: any, parameters: any, options: any) => object;
    };
    plaintext: {
        docs: string;
        fileFormat: string;
        markdown: (input: any, parameters: any, options: any) => any;
    };
    ciceroedit: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
    ciceromark_unquoted: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
    html: {
        docs: string;
        fileFormat: string;
        ciceromark_parsed: (input: any, parameters: any, options: any) => any;
    };
};
