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

const Fs = require('fs');
const Logger = require('@accordproject/concerto-core').Logger;
const parserOfTemplateAst = require('./lib/FromTemplateAst').parserOfTemplateAst;

require('yargs')
    .scriptName('markus')
    .usage('$0 <cmd> [args]')
    .demandCommand(1, '# Please specify a command')
    .recommendCommands()
    .strict()
    .command('parse', 'parse a string against a template', (yargs) => {
        yargs.option('input', {
            describe: 'path to the input',
            type: 'string'
        });
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`transform input ${argv.input} file`);
        }

        try {
            const template = JSON.parse(Fs.readFileSync(argv.template, 'utf8'));
            const text = Fs.readFileSync(argv.input, 'utf8');
            const result = parserOfTemplateAst(template).parse(text);
            if (result.status) {
                Logger.info('\n'+JSON.stringify(result.value));
            } else {
                Logger.error(JSON.stringify(result));
            }
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
