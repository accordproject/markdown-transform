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
const fs = require('fs')
const mkdirp = require('mkdirp')
const url = require('url');
const handlebars = require('handlebars');

const scriptDir = path.join(__dirname,'..','..');
const modelsJson = require('./models.json');
const targetDir = modelsJson.target;

const ModelLoader = require('@accordproject/concerto-core').ModelLoader;

/**
 * Fetches all external for a set of models dependencies and
 * saves all the models to a target directory
 *
 * @param {string[]} ctoFiles the CTO files (can be local file paths or URLs)
 * @param {string} output the output directory
 */
async function get(ctoFiles, output) {
    const modelManager = await ModelLoader.loadModelManager(ctoFiles);
    mkdirp.sync(output);
    modelManager.writeModelsToFileSystem(output);
    return `Loaded external models in '${output}'.`;
}

/**
 * Translate CTO URL to a file name
 *
 * @param {string} requestUrl - the URL of the CTO file
 * @param {string} the file name
 */
function mapName(requestUrl) {
    let parsedUrl = url.parse(requestUrl);
    // external ModelFiles have a name that starts with '@'
    // (so that they are identified as external when an archive is read back in)
    const name = (parsedUrl.host + parsedUrl.pathname).replace(/\//g, '.');
    return '@' + name;
}

async function fetchExternalModels() {
    const downloadCtos = modelsJson.models.map(m => m.from);
    const result = await get(downloadCtos, targetDir);
    console.log(result);
}

function buildExternalModels() {
    const buildModelsTemplate = path.join(__dirname,'Models.hbs');

    const source = fs.readFileSync(buildModelsTemplate,'utf8');
    const template = handlebars.compile(source);

    const contextArray = modelsJson.models.map(m => {
        const modelText = fs.readFileSync(path.join(scriptDir,targetDir,mapName(m.from)), 'utf-8');
        // XXX Escape so it can be embedded in a string
        const model = modelText.replace(/\\/g, '\\\\');
        return { ...m, model };
    });
    //console.log('contextArray --- ' + JSON.stringify(contextArray));

    contextArray.forEach(function(context) {
        // Only create a corresponding JS file if the js field exists
        if (context.js) {
            const result = template(context);
            const buildModelsJs = path.join(scriptDir,context.js,context.name + '.js');
            console.log('Creating: ' + buildModelsJs);
            fs.writeFileSync(buildModelsJs,result);
        }
    });
}
async function run() {
    fetchExternalModels().then(() => { buildExternalModels(); console.log('DONE!'); });
}
run();
