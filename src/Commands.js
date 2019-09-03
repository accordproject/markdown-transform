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
const Logger = require('./Logger');
const CommonmarkParser = require('./CommonmarkParser');
const CommonmarkToString = require('./CommonmarkToString');

/**
 * Utility class that implements the commands exposed by the CLI.
 * @class
 */
class Commands {
    /**
     * Set a default for a file argument
     *
     * @param {object} argv the inbound argument values object
     * @param {string} argName the argument name
     * @param {string} argDefaultName the argument default name
     * @param {Function} argDefaultFun how to compute the argument default
     * @param {object} argDefaultValue an optional default value if all else fails
     * @returns {object} a modified argument object
     */
    static setDefaultFileArg(argv, argName, argDefaultName, argDefaultFun) {
        if(!argv[argName]){
            Logger.info(`Loading a default ${argDefaultName} file.`);
            argv[argName] = argDefaultFun(argv, argDefaultName);
        }

        let argExists = true;
        if (Array.isArray(argv[argName])) {
            // All files should exist
            for (let i = 0; i < argv[argName].length; i++) {
                if (fs.existsSync(argv[argName][i]) && argExists) {
                    argExists = true;
                } else {
                    argExists = false;
                }
            }
        } else {
            // This file should exist
            argExists = fs.existsSync(argv[argName]);
        }

        if (!argExists){
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName} in the root folder of your template.`);
        } else {
            return argv;
        }
    }

    /**
     * Set default params before we parse a sample text using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateParseArgs(argv) {
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return argDefaultName; }));

        if(argv.verbose) {
            Logger.info(`parse sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Parse a sample markdown
     *
     * @param {string} samplePath to the sample file
     * @param {string} outPath to an output file
     * @param {boolean} generateMarkdown whether to transform back to markdown
     * @returns {object} Promise to the result of parsing
     */
    static parse(samplePath, outPath, generateMarkdown) {
        const parser = new CommonmarkParser();
        const markdownText = fs.readFileSync(samplePath, 'utf8');
        const concertoObject = parser.parse(markdownText);
        let result;
        if (generateMarkdown) {
            result = CommonmarkToString(concertoObject);
        } else {
            const json = parser.getSerializer().toJSON(concertoObject);
            result = JSON.stringify(json);
        }
        if (outPath) {
            Logger.info('Creating file: ' + outPath);
            fs.writeFileSync(outPath, result);
        }
        return Promise.resolve(result);
    }

}

module.exports = Commands;
