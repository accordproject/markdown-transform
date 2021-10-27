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

const fs = require('fs');
const logger = require('@accordproject/concerto-core').Logger;
const { TransformEngine, builtinTransformationGraph } = require('@accordproject/markdown-transform');

/**
 * Utility class that implements the commands exposed by the CLI.
 * @class
 */
class Commands {
    /**
     * Load an input file
     * @param {*} engine - the transformation engine
     * @param {string} filePath - the file name
     * @param {string} format - the format
     * @returns {*} the content - of the file
     */
    static loadFormatFromFile(engine,filePath,format) {
        const fileFormat = engine.formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else if (fileFormat === 'binary') {
            return fs.readFileSync(filePath);
        } else {
            return fs.readFileSync(filePath, 'utf8');
        }
    }

    /**
     * Prints a format to string
     * @param {*} engine - the transformation engine
     * @param {*} input - the input
     * @param {string} format - the format
     * @returns {string} the string representation
     */
    static printFormatToString(engine,input,format) {
        const fileFormat = engine.formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.stringify(input);
        } else {
            return input;
        }
    }

    /**
     * Prints a format to file
     * @param {*} engine - the transformation engine
     * @param {*} input the input
     * @param {string} format the format
     * @param {string} filePath the file name
     */
    static printFormatToFile(engine,input,format,filePath) {
        logger.info('Creating file: ' + filePath);
        fs.writeFileSync(filePath, Commands.printFormatToString(engine,input,format));
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
            logger.info(`Loading a default ${argDefaultName} file.`);
            argv[argName] = argDefaultFun(argv, argDefaultName);
        }

        let argExists = true;
        argExists = fs.existsSync(argv[argName]);

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
            logger.info(`transform input ${argv.input} printing intermediate transformations.`);
        }

        return argv;
    }

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
    static async transform(inputPath, from, via, to, outputPath, parameters, options) {
        // Initialize the transform engine
        const engine = new TransformEngine(builtinTransformationGraph);
        // Get extensions
        const { extensions, ...otherOptions } = options;
        if (extensions) {
            extensions.forEach((thisExtension) => {
                engine.registerExtension(thisExtension);
            });
        }
        const input = Commands.loadFormatFromFile(engine, inputPath, from);
        parameters.inputFileName = inputPath;
        if (parameters.template) {
            parameters.templateFileName = parameters.template;
            parameters.template = Commands.loadFormatFromFile(engine, parameters.template, 'markdown_template');
        }
        const pathTo = via.concat([to]);
        let result = await engine.transform(input, from, pathTo, parameters, otherOptions);
        let finalFormat = to;
        if (otherOptions && otherOptions.roundtrip) {
            const pathFrom = via.reverse().concat([from]);
            result = await engine.transform(result, to, pathFrom, parameters, otherOptions);
            finalFormat = from;
        }

        if (outputPath) {
            Commands.printFormatToFile(engine,result,finalFormat,outputPath);
            return Promise.resolve({});
        }
        return Promise.resolve(Commands.printFormatToString(engine,result,finalFormat))
            .then((result) => {
                const targetFormat = engine.formatDescriptor(finalFormat);
                return { result, targetFormat };
            });
    }
}

module.exports = Commands;
