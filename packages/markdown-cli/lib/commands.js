/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Fs = require('fs');
const Logger = require('@accordproject/concerto-core').Logger;

const { transform, formatDescriptor } = require('@accordproject/markdown-transform');

/**
 * Utility class that implements the commands exposed by the CLI.
 * @class
 */
class Commands {
    /**
     * Load an input file
     * @param {string} filePath the file name
     * @param {string} format the format
     * @returns {*} the content of the file
     */
    static loadFormatFromFile(filePath,format) {
        const fileFormat = formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.parse(Fs.readFileSync(filePath, 'utf8'));
        } else if (fileFormat === 'binary') {
            return Fs.readFileSync(filePath);
        } else {
            return Fs.readFileSync(filePath, 'utf8');
        }
    }

    /**
     * Prints a format to string
     * @param {*} input the input
     * @param {string} format the format
     * @returns {string} the string representation
     */
    static printFormatToString(input,format) {
        const fileFormat = formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.stringify(input);
        } else {
            return input;
        }
    }

    /**
     * Prints a format to file
     * @param {*} input the input
     * @param {string} format the format
     * @param {string} filePath the file name
     */
    static printFormatToFile(input,format,filePath) {
        Logger.info('Creating file: ' + filePath);
        Fs.writeFileSync(filePath, Commands.printFormatToString(input,format));
    }

    /**
     * Set a default for a file argument
     *
     * @param {object} argv the inbound argument values object
     * @param {string} argName the argument name
     * @param {string} argDefaultName the argument default name
     * @param {Function} argDefaultFun how to compute the argument default
     * @returns {object} a modified argument object
     */
    static setDefaultFileArg(argv, argName, argDefaultName, argDefaultFun) {
        if(!argv[argName]){
            Logger.info(`Loading a default ${argDefaultName} file.`);
            argv[argName] = argDefaultFun(argv, argDefaultName);
        }

        let argExists = true;
        argExists = Fs.existsSync(argv[argName]);

        if (!argExists){
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName}.`);
        } else {
            return argv;
        }
    }

    /**
     * Set default params before we transform
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateTransformArgs(argv) {
        argv = Commands.setDefaultFileArg(argv, 'input', 'input.md', ((argv, argDefaultName) => { return argDefaultName; }));

        if(argv.verbose) {
            Logger.info(`transform input ${argv.input} printing intermediate transformations.`);
        }

        return argv;
    }

    /**
     * Transform between formats
     *
     * @param {string} inputPath to the input file
     * @param {string} source the target format
     * @param {string} target the target format
     * @param {string} outputPath to an output file
     * @param {object} [options] configuration options
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} Promise to the result of parsing
     */
    static async transform(inputPath, source, target, outputPath, options) {
        const input = Commands.loadFormatFromFile(inputPath, source);
        let result = await transform(input, source, [target], options);
        let finalFormat = target;
        if (options && options.roundtrip) {
            result = await transform(result, target, [source], options);
            finalFormat = source;
        }

        if (outputPath) { Commands.printFormatToFile(result,finalFormat,outputPath); }
        return Promise.resolve(Commands.printFormatToString(result,finalFormat));
    }

}

module.exports = Commands;
