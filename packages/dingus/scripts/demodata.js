#!/usr/bin/env node

// Build demo data for embedding into html

/*eslint-disable no-console*/
'use strict';

var fs   = require('fs');
var path = require('path');
var packageJson = require('../package.json');

console.log(JSON.stringify({
  self: {
    demo: {
      source: fs.readFileSync(path.join(__dirname, '../lib/sample.md'), 'utf8'),
      version: packageJson.version
    }
  }
}, null, 2));
