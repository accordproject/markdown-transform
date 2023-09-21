#!/usr/bin/env node

'use strict';

/* eslint-env es6 */

const shell = require('shelljs');

shell.rm('-rf', 'demo');
shell.mkdir('demo');

shell.exec('scripts/demodata.js > lib/sample.json');

shell.exec('node_modules/.bin/pug lib/index.pug --pretty \
--obj lib/sample.json \
--out demo');

shell.exec('node_modules/.bin/stylus -u autoprefixer-stylus \
< lib/index.styl \
> demo/index.css');

shell.cp('lib/templatemark.css', 'demo/templatemark.css');

shell.rm('-rf', 'lib/sample.json');

shell.exec('node_modules/.bin/browserify lib/index.js -t [ babelify --presets [ @babel/preset-env ] --plugins [ @babel/plugin-transform-runtime ] ] \
> demo/index.js');
