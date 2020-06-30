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

const path = require('path');
const logger = require('@accordproject/concerto-core').Logger;
const commands = require('./lib/commands');

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
        yargs.option('via', {
            describe: 'intermediate formats',
            type: 'string',
            array: true,
            default: []
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
        yargs.option('sourcePos', {
            describe: 'enable source position',
            type: 'boolean',
            default: false
        });
        yargs.option('roundtrip', {
            describe: 'roundtrip transform',
            type: 'boolean',
            default: false
        });
        yargs.option('ctoFiles', {
            describe: 'array of CTO files',
            type: 'string',
            array: true
        });
        yargs.option('plugin', {
            describe: 'path to the parser plugin',
            type: 'string'
        });
        yargs.option('grammar', {
            describe: 'template grammar',
            type: 'string'
        });
        yargs.option('contract', {
            describe: 'contract template',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            logger.info(`transform input ${argv.input} file`);
        }

        try {
            argv = commands.validateTransformArgs(argv);
            const parameters = {};
            parameters.inputFileName = argv.input;
            parameters.ctoFiles = argv.ctoFiles;
            // Load the plugin if given
            let plugin = {};
            if (argv.plugin) {
                plugin = require(path.resolve(process.cwd(),argv.plugin));
            }
            parameters.plugin = plugin;
            parameters.grammar = argv.grammar;
            parameters.templateKind = argv.contract ? 'contract' : 'clause';
            const options = {};
            options.verbose = argv.verbose;
            options.sourcePos = argv.sourcePos;
            options.roundtrip = argv.roundtrip;
            return commands.transform(argv.input, argv.from, argv.via, argv.to, argv.output, parameters, options)
                .then((result) => {
                    if(result) {logger.info('\n'+result);}
                })
                .catch((err) => {
                    logger.error(err);
                });
        } catch (err){
            logger.error(err);
            return;
        }
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .help()
    .parse();
