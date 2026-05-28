export = Commands;
/**
 * Utility class that implements the commands exposed by the CLI.
 * @class
 */
declare class Commands {
    /**
     * Load an input file
     * @param {*} engine - the transformation engine
     * @param {string} filePath - the file name
     * @param {string} format - the format
     * @returns {*} the content - of the file
     */
    static loadFormatFromFile(engine: any, filePath: string, format: string): any;
    /**
     * Prints a format to string
     * @param {*} engine - the transformation engine
     * @param {*} input - the input
     * @param {string} format - the format
     * @returns {string} the string representation
     */
    static printFormatToString(engine: any, input: any, format: string): string;
    /**
     * Prints a format to file
     * @param {*} engine - the transformation engine
     * @param {*} input the input
     * @param {string} format the format
     * @param {string} filePath the file name
     */
    static printFormatToFile(engine: any, input: any, format: string, filePath: string): void;
    /**
     * Set a default for a file argument
     *
     * @param {object} argv the inbound argument values object
     * @param {string} argName the argument name
     * @param {string} argDefaultName the argument default name
     * @param {Function} argDefaultFun how to compute the argument default
     * @returns {object} a modified argument object
     */
    static setDefaultFileArg(argv: object, argName: string, argDefaultName: string, argDefaultFun: Function): object;
    /**
     * Set default params before we transform
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateTransformArgs(argv: object): object;
    /**
     * Transform between formats
     *
     * @param {string} inputPath to the input file
     * @param {string} from the source format
     * @param {string[]} via intermediate formats
     * @param {string} to the target format
     * @param {string} outputPath to an output file
     * @param {object} parameters the transform parameters
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @param {boolean} [options.roundtrip] roundtrip transform back to source format
     * @returns {object} Promise to the result of parsing
     */
    static transform(inputPath: string, from: string, via: string[], to: string, outputPath: string, parameters: object, options?: {
        verbose?: boolean;
        roundtrip?: boolean;
    }): object;
}
