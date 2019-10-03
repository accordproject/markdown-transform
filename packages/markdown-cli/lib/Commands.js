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
const Logger = require('@accordproject/markdown-common').Logger;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const SlateTransformer = require('@accordproject/markdown-slate').SlateTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;

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
                if (Fs.existsSync(argv[argName][i]) && argExists) {
                    argExists = true;
                } else {
                    argExists = false;
                }
            }
        } else {
            // This file should exist
            argExists = Fs.existsSync(argv[argName]);
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
     * @param {object} [options] configuration options
     * @param {boolean} [options.roundtrip] whether to transform back to markdown
     * @param {boolean} [options.cicero] whether to further transform for Cicero
     * @param {boolean} [options.slate] whether to further transform for Slate
     * @param {boolean} [options.noWrap] whether to avoid wrapping Cicero variables in XML tags
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     * @returns {object} Promise to the result of parsing
     */
    static parse(samplePath, outPath, options) {
        const { roundtrip, cicero, slate, html, noWrap, noIndex } = options;
        const commonOptions = {};
        commonOptions.tagInfo = true;
        commonOptions.noIndex = noIndex ? true : false;

        const commonMark = new CommonMarkTransformer(commonOptions);
        const ciceroMark = new CiceroMarkTransformer();
        const slateMark = new SlateTransformer();
        const htmlMark = new HtmlTransformer();

        const markdownText = Fs.readFileSync(samplePath, 'utf8');
        let result = commonMark.fromMarkdown(markdownText, 'json');

        if (cicero) {
            result = ciceroMark.fromCommonMark(result, 'json');
        }
        else if (slate) {
            result = ciceroMark.fromCommonMark(result, 'json');
            result = slateMark.fromCiceroMark(result);
        } else if (html) {
            result = ciceroMark.fromCommonMark(result, 'json');
            result = htmlMark.toHtml(result);
        }

        if (roundtrip) {
            if (cicero) {
                const ciceroOptions = {};
                ciceroOptions.wrapVariables = noWrap ? false : true;
                result = ciceroMark.toCommonMark(result, ciceroOptions);
            } else if (slate) {
                result = slateMark.toCiceroMark(result);
                const ciceroOptions = {};
                ciceroOptions.wrapVariables = noWrap ? false : true;
                result = ciceroMark.toCommonMark(result, ciceroOptions);
            } else if (html) {
                throw new Error('Cannot roundtrip from HTML');
            }
            result = commonMark.toMarkdown(result);
        } else if (!html) {
            result = JSON.stringify(result);
        }
        if (outPath) {
            Logger.info('Creating file: ' + outPath);
            Fs.writeFileSync(outPath, result);
        }
        return Promise.resolve(result);
    }

}

module.exports = Commands;
