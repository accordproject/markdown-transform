#!/usr/bin/env node
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

const Logger = require('@accordproject/concerto-core').Logger;
const Commands = require('./lib/commands');

require('yargs')
    .scriptName('markus')
    .usage('$0 <cmd> [args]')
    .demandCommand(1, '# Please specify a command')
    .recommendCommands()
    .strict()
    .command('parse', 'parse and transform a sample markdown', (yargs) => {
        yargs.option('sample', {
            describe: 'path to the markdown text',
            type: 'string'
        });
        yargs.option('target', {
            describe: 'target format',
            type: 'string',
            default: 'commonmark'
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('verbose', {
            describe: 'verbose output',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`parse sample ${argv.sample} markdown`);
        }

        try {
            argv = Commands.validateParseArgs(argv);
            const options = {};
            options.verbose = argv.verbose;
            return Commands.parse(argv.sample, argv.target, argv.output, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err);
                });
        } catch (err){
            Logger.error(err);
            return;
        }
    })
    .command('draft', 'create markdown text from data', (yargs) => {
        yargs.option('data', {
            describe: 'path to the data',
            type: 'string'
        });
        yargs.option('source', {
            describe: 'source format',
            type: 'string',
            default: 'commonmark'
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('verbose', {
            describe: 'verbose output',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`draft sample markdown from ${argv.data}`);
        }

        try {
            argv = Commands.validateDraftArgs(argv);
            const options = {};
            options.verbose = argv.verbose;
            return Commands.draft(argv.data, argv.source, argv.output, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err);
                });
        } catch (err){
            Logger.error(err);
            return;
        }
    })
    .command('normalize', 'normalize a sample markdown (parse & redraft)', (yargs) => {
        yargs.option('sample', {
            describe: 'path to the markdown text',
            type: 'string'
        });
        yargs.option('target', {
            describe: 'target format',
            type: 'string',
            default: 'commonmark'
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('verbose', {
            describe: 'verbose output',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`normalize ${argv.sample} markdown`);
        }

        try {
            argv = Commands.validateNormalizeArgs(argv);
            const options = {};
            options.verbose = argv.verbose;
            return Commands.normalize(argv.sample, argv.target, argv.output, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err);
                });
        } catch (err){
            Logger.error(err);
            return;
        }
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .help()
    .parse();
