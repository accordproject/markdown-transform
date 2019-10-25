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
const modelsJson = require('./models.json');

const { ModelManager } = require('@accordproject/concerto-core');
const ModelFile = require('@accordproject/concerto-core').ModelFile;
const DefaultModelFileLoader = require('@accordproject/concerto-core').DefaultModelFileLoader;

const defaultSystemContent = `namespace org.accordproject.base
abstract asset Asset {  }
abstract participant Participant {  }
abstract transaction Transaction identified by transactionId {
  o String transactionId
}
abstract event Event identified by eventId {
  o String eventId
}`;
const defaultSystemName = '@org.accordproject.base';

/**
 * Add model file
 *
 * @param {object} modelFileLoader - the model loader
 * @param {object} modelManager - the model manager
 * @param {string} ctoFile - the model file
 * @param {boolean} system - whether this is a system model
 * @return {object} the model manager
 */
async function addModel(modelFileLoader, modelManager, ctoFile, system) {
    let modelFile = null;
    if (system && !ctoFile) {
        modelFile = new ModelFile(modelManager, defaultSystemContent, defaultSystemName, true);
    } else if(modelFileLoader.accepts(ctoFile)) {
        modelFile = await modelFileLoader.load(ctoFile);
    } else {
        const content = fs.readFileSync(ctoFile, 'utf8');
        modelFile = new ModelFile(modelManager, content, ctoFile);
    }

    if (system) {
        modelManager.addModelFile(modelFile, modelFile.getName(), false, true);
    } else {
        modelManager.addModelFile(modelFile, modelFile.getName(), true, false);
    }

    return modelManager;
}

/**
 * Load system and models in a new model manager
 *
 * @param {string} ctoSystemFile - the system model file
 * @param {string[]} ctoFiles - the CTO files (can be local file paths or URLs)
 * @return {object} the model manager
 */
async function loadModelManager(ctoSystemFile, ctoFiles) {
    let modelManager = new ModelManager();
    const modelFileLoader = new DefaultModelFileLoader(modelManager);

    // Load system model
    modelManager = await addModel(modelFileLoader,modelManager,ctoSystemFile,true);

    // Load user models
    for( let ctoFile of ctoFiles ) {
        modelManager = await addModel(modelFileLoader,modelManager,ctoFile,false);
    }

    // Validate update models
    await modelManager.updateExternalModels();
    return modelManager;
}

/**
 * Fetches all external for a set of models dependencies and
 * saves all the models to a target directory
 *
 * @param {string[]} ctoFiles the CTO files (can be local file paths or URLs)
 * @param {string} output the output directory
 */
async function get(ctoFiles, output) {
    const modelManager = await loadModelManager(null, ctoFiles);
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
    const downloadCtos = modelsJson.map(m => m.from);
    const result = await get(downloadCtos, 'scripts/tmp');
    console.log(result);
}

function buildExternalModels() {
    const buildModelsTemplate = path.join(__dirname,'..','src','externalModels','Models.hbs');

    const source = fs.readFileSync(buildModelsTemplate,'utf8');
    const template = handlebars.compile(source);

    const contextArray = modelsJson.map(m => { return { ...m, model: fs.readFileSync(path.join(__dirname,'tmp', mapName(m.from)), 'utf8') } });
    //console.log('contextArray --- ' + JSON.stringify(contextArray));

    contextArray.forEach(function(context) {
        const result = template(context);
        const buildModelsJs = path.join(__dirname,'..','src','externalModels',context.name + '.js');
        console.log('Creating: ' + buildModelsJs);
        fs.writeFileSync(buildModelsJs,result);
    });
}
async function run() {
    fetchExternalModels().then(() => { buildExternalModels(); console.log('DONE!'); });
}
run();
