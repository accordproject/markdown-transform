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

import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Logger: logger } = require('@accordproject/concerto-util');
import { Commands } from './commands';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs');

yargs
    .scriptName('markus')
    .usage('$0 <cmd> [args]')
    .demandCommand(1, '# Please specify a command')
    .recommendCommands()
    .strict()
    .command('transform', 'transform between two formats', (yargs: any) => {
        yargs.option('input', { describe: 'path to the input', type: 'string' });
        yargs.option('from', { describe: 'source format', type: 'string', default: 'markdown' });
        yargs.option('to', { describe: 'target format', type: 'string', default: 'commonmark' });
        yargs.option('via', { describe: 'intermediate formats', type: 'string', array: true, default: [] });
        yargs.option('roundtrip', { describe: 'roundtrip transform', type: 'boolean', default: false });
        yargs.option('output', { describe: 'path to the output file', type: 'string' });
        yargs.option('model', { describe: 'array of concerto model files', type: 'string', array: true });
        yargs.option('template', { describe: 'template grammar', type: 'string' });
        yargs.option('contract', { describe: 'contract template', type: 'boolean', default: false });
        yargs.option('currentTime', { describe: 'set current time', type: 'string', default: null });
        yargs.option('plugin', { describe: 'path to a parser plugin', type: 'string' });
        yargs.option('extension', { describe: 'path to a transform extension', type: 'string', array: true });
        yargs.option('sourcePos', { describe: 'enable source position', type: 'boolean', default: false });
        yargs.option('verbose', { describe: 'verbose output', type: 'boolean', default: false });
        yargs.option('offline', { describe: 'do not resolve external models', type: 'boolean', default: false });
    }, (argv: any) => {
        if (argv.verbose) {
            logger.info(`transform input ${argv.input} file`);
        }

        try {
            argv = Commands.validateTransformArgs(argv);
            const parameters: any = {};
            parameters.inputFileName = argv.input;
            parameters.model = argv.model;
            let plugin: any = {};
            if (argv.plugin) {
                plugin = require(path.resolve(process.cwd(), argv.plugin));
            }
            const extensions: any[] = [];
            if (argv.extension) {
                argv.extension.forEach((thisExtension: string) => {
                    let modExtension = require(path.resolve(process.cwd(), thisExtension));
                    if (modExtension.default) {
                        modExtension = modExtension.default;
                    }
                    extensions.push(modExtension);
                });
            }
            parameters.plugin = plugin;
            parameters.template = argv.template;
            parameters.templateKind = argv.contract ? 'contract' : 'clause';
            parameters.currentTime = argv.currentTime;
            const options: any = {};
            options.verbose = argv.verbose;
            options.sourcePos = argv.sourcePos;
            options.roundtrip = argv.roundtrip;
            options.offline = argv.offline;
            options.extensions = extensions;
            return Commands.transform(argv.input, argv.from, argv.via, argv.to, argv.output, parameters, options)
                .then(({ result, targetFormat }) => {
                    if (result) {
                        if (targetFormat && targetFormat.fileFormat !== 'binary') {
                            logger.info('\n' + result);
                        } else {
                            logger.info(`\n<binary ${argv.to} data>`);
                        }
                    }
                })
                .catch((err: any) => {
                    logger.error(err.message);
                });
        } catch (err: any) {
            logger.error(err.message);
            return;
        }
    })
    .option('verbose', { alias: 'v', default: false })
    .help()
    .parse();
