export function formatDescriptor(format: string): object;
export function transform(source: object | string, sourceFormat: string, destinationFormat: string[], parameters: object, options?: object): Promise<object | string>;
export function generateTransformationDiagram(): string;
/**
 * This is instantiated here for backward compatibility
 * @type {TransformEngine}
 */
export const builtinEngine: TransformEngine;
import TransformEngine = require("./transformEngine");
