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
        argExists = Fs.existsSync(argv[argName]);

        if (!argExists){
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName}.`);
        } else {
            return argv;
        }
    }

    /**
     * Set default params before we parse a sample text
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateParseArgs(argv) {
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return argDefaultName; }));

        if(argv.verbose) {
            Logger.info(`parse sample ${argv.sample} printing intermediate transformations.`);
        }

        return argv;
    }

    /**
     * Parse a sample markdown
     *
     * @param {string} samplePath to the sample file
     * @param {string} outputPath to an output file
     * @param {object} [options] configuration options
     * @param {boolean} [options.cicero] whether to further transform for Cicero
     * @param {boolean} [options.slate] whether to further transform for Slate
     * @param {boolean} [options.html] whether to further transform for HTML
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} Promise to the result of parsing
     */
    static parse(samplePath, outputPath, options) {
        const { cicero, slate, html, verbose } = options;
        const commonOptions = {};
        commonOptions.tagInfo = true;

        const commonMark = new CommonMarkTransformer(commonOptions);
        const ciceroMark = new CiceroMarkTransformer();
        const slateMark = new SlateTransformer();
        const htmlMark = new HtmlTransformer();

        const markdownText = Fs.readFileSync(samplePath, 'utf8');
        let result = commonMark.fromMarkdown(markdownText, 'json');
        if(verbose) {
            Logger.info('=== CommonMark ===');
            Logger.info(JSON.stringify(result, null, 4));
        }

        if (cicero) {
            result = ciceroMark.fromCommonMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        }
        else if (slate) {
            result = ciceroMark.fromCommonMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
            result = slateMark.fromCiceroMark(result);
            if(verbose) {
                Logger.info('=== Slate DOM ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        } else if (html) {
            result = ciceroMark.fromCommonMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
            result = htmlMark.toHtml(result);
        }
        if (!html) {
            result = JSON.stringify(result, null, 4);
        }
        if (outputPath) {
            Logger.info('Creating file: ' + outputPath);
            Fs.writeFileSync(outputPath, result);
        }
        return Promise.resolve(result);
    }

    /**
     * Set default params before we draft a sample text
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateDraftArgs(argv) {
        argv = Commands.setDefaultFileArg(argv, 'data', 'data.json', ((argv, argDefaultName) => { return argDefaultName; }));

        if(argv.verbose) {
            Logger.info(`draft sample from ${argv.data} printing intermediate transformations.`);
        }

        return argv;
    }

    /**
     * Parse a sample markdown
     *
     * @param {string} dataPath to the sample file
     * @param {string} outputPath to an output file
     * @param {object} [options] configuration options
     * @param {boolean} [options.cicero] whether to further transform for Cicero
     * @param {boolean} [options.slate] whether to further transform for Slate
     * @param {boolean} [options.noWrap] whether to avoid wrapping Cicero variables in XML tags
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} Promise to the result of parsing
     */
    static draft(dataPath, outputPath, options) {
        const { cicero, slate, noWrap, noIndex, verbose } = options;
        const commonOptions = {};
        commonOptions.tagInfo = true;
        commonOptions.noIndex = noIndex ? true : false;

        const commonMark = new CommonMarkTransformer(commonOptions);
        const ciceroMark = new CiceroMarkTransformer();
        const slateMark = new SlateTransformer();

        let result = JSON.parse(Fs.readFileSync(dataPath, 'utf8'));
        if (cicero) {
            const ciceroOptions = {};
            ciceroOptions.wrapVariables = noWrap ? false : true;
            result = ciceroMark.toCommonMark(result, ciceroOptions);
            if(verbose) {
                Logger.info('=== CommonMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        } else if (slate) {
            result = slateMark.toCiceroMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
            const ciceroOptions = {};
            ciceroOptions.wrapVariables = noWrap ? false : true;
            result = ciceroMark.toCommonMark(result, ciceroOptions);
            if(verbose) {
                Logger.info('=== CommonMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        }
        result = commonMark.toMarkdown(result);
        if (outputPath) {
            Logger.info('Creating file: ' + outputPath);
            Fs.writeFileSync(outputPath, result);
        }
        return Promise.resolve(result);
    }

    /**
     * Set default params before we normalize a sample text
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateNormalizeArgs(argv) {
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return argDefaultName; }));

        if(argv.verbose) {
            Logger.info(`normalize sample ${argv.sample} printing intermediate transformations.`);
        }

        return argv;
    }

    /**
     * Normalize a sample markdown
     *
     * @param {string} samplePath to the sample file
     * @param {string} outputPath to an output file
     * @param {object} [options] configuration options
     * @param {boolean} [options.cicero] whether to further transform for Cicero
     * @param {boolean} [options.slate] whether to further transform for Slate
     * @param {boolean} [options.noWrap] whether to avoid wrapping Cicero variables in XML tags
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     * @param {boolean} [options.verbose] verbose output
     * @returns {object} Promise to the result of parsing
     */
    static normalize(samplePath, outputPath, options) {
        const { cicero, slate, noWrap, noIndex, verbose } = options;
        const commonOptions = {};
        commonOptions.tagInfo = true;
        commonOptions.noIndex = noIndex ? true : false;

        const commonMark = new CommonMarkTransformer(commonOptions);
        const ciceroMark = new CiceroMarkTransformer();
        const slateMark = new SlateTransformer();

        const markdownText = Fs.readFileSync(samplePath, 'utf8');
        let result = commonMark.fromMarkdown(markdownText, 'json');
        if(verbose) {
            Logger.info('=== CommonMark ===');
            Logger.info(JSON.stringify(result, null, 4));
        }

        if (cicero) {
            result = ciceroMark.fromCommonMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        }
        else if (slate) {
            result = ciceroMark.fromCommonMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
            result = slateMark.fromCiceroMark(result);
            if(verbose) {
                Logger.info('=== Slate DOM ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        }

        if (cicero) {
            const ciceroOptions = {};
            ciceroOptions.wrapVariables = noWrap ? false : true;
            result = ciceroMark.toCommonMark(result, ciceroOptions);
            if(verbose) {
                Logger.info('=== CommonMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        } else if (slate) {
            result = slateMark.toCiceroMark(result, 'json');
            if(verbose) {
                Logger.info('=== CiceroMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
            const ciceroOptions = {};
            ciceroOptions.wrapVariables = noWrap ? false : true;
            result = ciceroMark.toCommonMark(result, ciceroOptions);
            if(verbose) {
                Logger.info('=== CommonMark ===');
                Logger.info(JSON.stringify(result, null, 4));
            }
        }
        result = commonMark.toMarkdown(result);
        if (outputPath) {
            Logger.info('Creating file: ' + outputPath);
            Fs.writeFileSync(outputPath, result);
        }
        return Promise.resolve(result);
    }

}

module.exports = Commands;
