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

import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Logger: logger } = require('@accordproject/concerto-util');
import { TransformEngine, builtinTransformationGraph } from '@accordproject/markdown-transform';

/**
 * Utility class that implements the commands exposed by the CLI.
 */
export class Commands {
    /**
     * Load an input file
     */
    static loadFormatFromFile(engine: TransformEngine, filePath: string, format: string): any {
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
     */
    static printFormatToString(engine: TransformEngine, input: any, format: string): string {
        const fileFormat = engine.formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.stringify(input);
        } else {
            return input;
        }
    }

    /**
     * Prints a format to file
     */
    static printFormatToFile(engine: TransformEngine, input: any, format: string, filePath: string): void {
        logger.info('Creating file: ' + filePath);
        fs.writeFileSync(filePath, Commands.printFormatToString(engine, input, format));
    }

    /**
     * Set a default for a file argument
     */
    static setDefaultFileArg(
        argv: any,
        argName: string,
        argDefaultName: string,
        argDefaultFun: (argv: any, name: string) => string,
    ): any {
        if (!argv[argName]) {
            logger.info(`Loading a default ${argDefaultName} file.`);
            argv[argName] = argDefaultFun(argv, argDefaultName);
        }

        const argExists = fs.existsSync(argv[argName]);

        if (!argExists) {
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName}.`);
        } else {
            return argv;
        }
    }

    /**
     * Set default params before we transform
     */
    static validateTransformArgs(argv: any): any {
        argv = Commands.setDefaultFileArg(argv, 'input', 'input.md', (_argv, name) => name);

        if (argv.verbose) {
            logger.info(`transform input ${argv.input} printing intermediate transformations.`);
        }

        return argv;
    }

    /**
     * Transform between formats
     */
    static async transform(
        inputPath: string,
        from: string,
        via: string[],
        to: string,
        outputPath: string | undefined,
        parameters: any,
        options: any,
    ): Promise<{ result?: string; targetFormat?: any }> {
        const engine = new TransformEngine(builtinTransformationGraph);
        const { extensions, ...otherOptions } = options || {};
        if (extensions) {
            extensions.forEach((thisExtension: any) => {
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
            Commands.printFormatToFile(engine, result, finalFormat, outputPath);
            return {};
        }
        const resultString = Commands.printFormatToString(engine, result, finalFormat);
        const targetFormat = engine.formatDescriptor(finalFormat);
        return { result: resultString, targetFormat };
    }
}

export default Commands;
