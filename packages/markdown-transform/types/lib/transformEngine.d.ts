export = TransformEngine;
/**
 * A generic transformation engine.
 *
 * The format for the graph is a map (a JavaScript object) where each entry is a format, i.e., vertex in the graph with the following content:
 *
 * [sourceFormat]: {
 *   docs: // A format description
 *   fileFormat: // What kind of format it is (i.e., utf8, json, binary)
 *   [targetFormat1]: async (input, parameters, options) => { ... return result }
 *   [targetFormat2]: async (input, parameters, options) => { ... return result }
 *   ...
 * }
 *
 * Each [targetFormat] entry defines an edge in the graph transforming [sourceFormat] to [targetFormat]
 */
declare class TransformEngine {
    /**
     * Construct the transformation engine
     * @param {object} transformationGraph - the transformation graph
     */
    constructor(transformationGraph: object);
    transformationGraph: any;
    /**
     * Converts the graph of transformations into a PlantUML text string
     * @returns {string} the PlantUML string
     */
    generateTransformationDiagram(): string;
    /**
     * Transforms from a source format to a single destination format or
     * throws an exception if the transformation is not possible.
     *
     * @param {*} source the input for the transformation
     * @param {string} sourceFormat the input format
     * @param {string} destinationFormat the destination format
     * @param {object} parameters the transform parameters
     * @param {object} [options] the transform options
     * @param {boolean} [options.verbose] output verbose console logs
     * @returns {*} result of the transformation
     */
    transformToDestination(source: any, sourceFormat: string, destinationFormat: string, parameters: object, options?: {
        verbose?: boolean;
    }): any;
    /**
     * Transforms from a source format to a list of destination formats, or
     * throws an exception if the transformation is not possible.
     *
     * @param {*} source the input for the transformation
     * @param {string} sourceFormat the input format
     * @param {string[]} destinationFormat the destination format as an array,
     * the transformation are applied in order to reach all formats in the array
     * @param {object} parameters the transform parameters
     * @param {object} [options] the transform options
     * @param {boolean} [options.verbose] output verbose console logs
     * @returns {Promise} result of the transformation
     */
    transform(source: any, sourceFormat: string, destinationFormat: string[], parameters: object, options?: {
        verbose?: boolean;
    }): Promise<any>;
    /**
     * Return the format descriptor for a given format
     *
     * @param {string} format the format
     * @return {object} the descriptor for that format
     */
    formatDescriptor(format: string): object;
    /**
     * Return the transformation graph
     *
     * @return {object} the transformation graph
     */
    getTransformationGraph(): object;
    /**
     * Return all the available formats
     *
     * @return {object} the transformation graph
     */
    getAllFormats(): object;
    /**
     * Return all the available targets from a source formats
     *
     * @param {string} sourceFormat - the sourceFormat
     * @return {object} the transformation graph
     */
    getAllTargetFormats(sourceFormat: string): object;
    /**
     * Add a new format
     *
     * @param {string} sourceFormat - the name of the source format
     * @param {string} docs - the format description
     * @param {string} fileFormat - the format type (either 'json', 'utf8' or 'binary')
     */
    registerFormat(sourceFormat: string, docs: string, fileFormat: string): void;
    /**
     * Add a new transform
     *
     * @param {string} sourceFormat - the name of the source format
     * @param {string} targetFormat - the name of the targetFormat format
     * @param {*} transform - the transform (an async function to transform from sourceFormat to targetFormat)
     */
    registerTransformation(sourceFormat: string, targetFormat: string, transform: any): void;
    /**
     * Register a transform extension
     * @param {*} extension - the transform extension, including format and transforms
     */
    registerExtension(extension: any): void;
    /**
     * Refresh raw graph
     * @private
     */
    private refreshRawGraph;
    rawGraph: any;
}
