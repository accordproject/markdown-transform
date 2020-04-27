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
    .command('transform', 'transform between two formats', (yargs) => {
        yargs.option('input', {
            describe: 'path to the input',
            type: 'string'
        });
        yargs.option('from', {
            describe: 'source format',
            type: 'string',
            default: 'markdown'
        });
        yargs.option('to', {
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
        yargs.option('roundtrip', {
            describe: 'roundtrip transform',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`transform input ${argv.input} file`);
        }

        try {
            argv = Commands.validateTransformArgs(argv);
            const options = {};
            options.verbose = argv.verbose;
            options.roundtrip = argv.roundtrip;
            return Commands.transform(argv.input, argv.from, argv.to, argv.output, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('parse', 'parse a string against a template', (yargs) => {
        yargs.option('input', {
            describe: 'path to the input',
            type: 'string'
        });
        yargs.option('grammar', {
            describe: 'path to the template grammar',
            type: 'string'
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
            Logger.info(`transform input ${argv.input} file`);
        }

        try {
            argv = Commands.validateTransformArgs(argv);
            const options = {};
            options.verbose = argv.verbose;
            return Commands.parse(argv.input, argv.grammar, argv.output, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .help()
    .parse();
