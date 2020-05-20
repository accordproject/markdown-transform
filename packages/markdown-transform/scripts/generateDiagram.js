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

const Axios = require('axios').default;
const Fs = require('fs');
const Path = require('path');
const plantumlEncoder = require('plantuml-encoder');
const generateTransformationDiagram = require('../lib/transform').generateTransformationDiagram;

/**
 * Downloads a file from a URL
 * @param {string} url the URL to download
 * @param {string} filename the local file name used to store the file
 */
async function downloadImage (url, filename) {
    const path = Path.resolve(__dirname, '..', filename);
    const writer = Fs.createWriteStream(path);

    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
const plantUML = generateTransformationDiagram();
console.log('PLANT! ' + plantUML);
const encoded = plantumlEncoder.encode(plantUML);
const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
downloadImage(url, 'transformations.png');
console.log('Generated transformations.png');