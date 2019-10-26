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
const url = require('url');

const scriptDir = path.join(__dirname,'..','..');
const modelsJson = require('./models.json');
const targetDir = modelsJson.target;

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

function removeFetchedModels() {
    const downloadCtos = modelsJson.models.map(m => m.from);
    downloadCtos.forEach((context) => {
        const ctoFile = path.join(scriptDir,targetDir,mapName(context));
        try {
            fs.unlinkSync(ctoFile);
            console.log('Deleted: ' + ctoFile);
        } catch (err) {
            console.error('Delete failure: ' + ctoFile);
        }
    });
}

function removeBuiltModels() {
    modelsJson.models.forEach(function(context) {
        // Only remove a corresponding JS file if the js field exists
        if (context.js) {
            const jsFile = path.join(scriptDir,context.js,context.name + '.js');
            try {
                fs.unlinkSync(jsFile);
                console.log('Deleted: ' + jsFile);
            } catch (err) {
                console.error('Delete failure: ' + jsFile);
            }
        }
    });
}
function run() {
    removeFetchedModels();
    removeBuiltModels();
    console.log('DONE!');
}
run();
