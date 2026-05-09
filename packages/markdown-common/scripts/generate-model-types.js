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

const { CodeGen } = require('@accordproject/concerto-codegen');
const { ModelManager } = require('@accordproject/concerto-core');
const fs = require('fs');
const path = require('path');

const { CommonMarkModel, CiceroMarkModel, ConcertoMetaModel, TemplateMarkModel } = require('../index');

// Map raw namespace filename → clean output name.
// Update this map if any CTO namespace version bumps.
const NAME_MAP = {
    'concerto@1.0.0':                          'concerto-base',
    'concerto.metamodel@1.0.0':                'concerto-metamodel',
    'org.accordproject.commonmark@0.5.0':      'commonmark',
    'org.accordproject.ciceromark@0.6.0':      'ciceromark',
    'org.accordproject.templatemark@0.5.0':    'templatemark',
};

// Namespaces auto-generated but not useful in the public API
const SKIP = new Set(['concerto.decorator@1.0.0']);

const mm = new ModelManager({ strict: true });
mm.addCTOModel(ConcertoMetaModel.MODEL, 'metamodel.cto');
mm.addCTOModel(CommonMarkModel.MODEL,   'commonmark.cto');
mm.addCTOModel(CiceroMarkModel.MODEL,   'ciceromark.cto');
mm.addCTOModel(TemplateMarkModel.MODEL, 'templatemark.cto');

const outDir = path.resolve(__dirname, '../types/model');
fs.mkdirSync(outDir, { recursive: true });

const files = {};
mm.accept(new CodeGen.TypescriptVisitor(), {
    fileWriter: {
        openFile:  (f) => { files[f] = ''; },
        writeLine: (i, l) => { files[Object.keys(files).at(-1)] += '  '.repeat(i) + l + '\n'; },
        closeFile: () => {}
    }
});

for (const [rawFile, content] of Object.entries(files)) {
    const ns = rawFile.replace(/\.ts$/, '');
    if (SKIP.has(ns)) continue;
    const cleanName = NAME_MAP[ns];
    if (!cleanName) { console.warn('unmapped namespace:', ns); continue; }

    // Rewrite cross-file import paths to clean names
    let out = content;
    for (const [rawNs, clean] of Object.entries(NAME_MAP)) {
        out = out.replaceAll(`'./${rawNs}'`, `'./${clean}'`);
    }
    // Strip generated eslint-disable comment
    out = out.replace(/\/\* eslint-disable.*?\*\/\n/, '');

    const outPath = path.join(outDir, `${cleanName}.d.ts`);
    fs.writeFileSync(outPath, out);
    console.log(`wrote types/model/${cleanName}.d.ts`);
}
