#!/usr/bin/env node

'use strict';

/* eslint-env es6 */

const shell = require('shelljs');

shell.rm('-rf', 'demo');
shell.mkdir('demo');

var path = require('path');
var demo = path.resolve('./demo');

var demodata = path.resolve('./scripts/demodata.js');

shell.exec(`node ${demodata} > lib/sample.json`);
var pug = path.resolve('./node_modules/pug-cli/index.js');
var index=path.resolve('./lib/index.pug');
shell.exec(`node ${pug} lib/index.pug --obj lib/sample.json --out ${demo}`);

var stylus=path.resolve('./node_modules/stylus/bin/stylus');
var index_styl= path.resolve('./lib/index.styl');

shell.exec(`node ${stylus} -u autoprefixer-stylus \
< ${index_styl} \
> ./demo/index.css`);

var templateMarkCSS_lib=path.resolve('./lib/templatemark.css');
var templateMarkCSS_demo=path.resolve('./demo/templatemark.css');
shell.cp(templateMarkCSS_lib, templateMarkCSS_demo);

shell.rm('-rf', "lib/sample.json");
index=path.resolve('./node_modules/browserify/bin/cmd.js');

shell.exec(`${index}  lib/index.js \
> demo/index.js --standalone demo/index.html`);
