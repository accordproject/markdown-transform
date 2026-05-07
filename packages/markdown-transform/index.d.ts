export type FileFormat = 'utf8' | 'json' | 'binary' | string;

export interface FormatDescriptor {
    docs: string;
    fileFormat: FileFormat;
    [name: string]: unknown;
}

export interface TransformParameters {
    inputFileName?: string;
    model?: string[];
    template?: unknown;
    templateFileName?: string;
    [name: string]: unknown;
}

export interface TransformOptions {
    verbose?: boolean;
    source?: unknown;
    [name: string]: unknown;
}

export type TransformFunction = (
    input: unknown,
    parameters?: TransformParameters,
    options?: TransformOptions
) => unknown | Promise<unknown>;

export interface TransformExtension {
    format?: {
        name: string;
        docs: string;
        fileFormat: FileFormat;
    };
    transforms?: Record<string, Record<string, TransformFunction>>;
}

export declare function formatDescriptor(format: string): FormatDescriptor;
export declare function transform(
    source: unknown,
    sourceFormat: string,
    destinationFormat: string[],
    parameters?: TransformParameters,
    options?: TransformOptions
): Promise<unknown>;
export declare function generateTransformationDiagram(): string;

export declare const builtinTransformationGraph: Record<string, FormatDescriptor>;

export declare class TransformEngine {
    constructor(transformationGraph: Record<string, FormatDescriptor>);
    generateTransformationDiagram(): string;
    transformToDestination(
        source: unknown,
        sourceFormat: string,
        destinationFormat: string,
        parameters?: TransformParameters,
        options?: TransformOptions
    ): Promise<unknown>;
    transform(
        source: unknown,
        sourceFormat: string,
        destinationFormat: string[],
        parameters?: TransformParameters,
        options?: TransformOptions
    ): Promise<unknown>;
    formatDescriptor(format: string): FormatDescriptor;
    getTransformationGraph(): Record<string, FormatDescriptor>;
    getAllFormats(): string[];
    getAllTargetFormats(sourceFormat: string): string[];
    registerFormat(sourceFormat: string, docs: string, fileFormat: FileFormat): void;
    registerTransformation(sourceFormat: string, targetFormat: string, transform: TransformFunction): void;
    registerExtension(extension: TransformExtension): void;
}
