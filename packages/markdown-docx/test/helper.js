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

const fs = require('fs');
const chai = require('chai');

const expect = chai.expect;

const CiceroMarkToOOXMLTransfomer = require('../src/CiceroMarkToOOXML');
const OoxmlTransformer = require('../src/OOXMLTransformer');

/**
 * Loads a ciceroMark file, converts ciceroMark(loaded) -> OOXML ->ciceroMark(generated) and checks the equality of ciceroMark(s).
 *
 * @param {string} filePath Path of the file to be loaded
 */
const checkRoundTripEquality = async filePath => {
    let ciceroMark = await fs.readFileSync(filePath, 'utf-8');
    ciceroMark = JSON.parse(ciceroMark);

    const ciceroMarkTransformer = new CiceroMarkToOOXMLTransfomer();
    const ooxml = ciceroMarkTransformer.toOOXML(ciceroMark);

    const ooxmlTransformer = new OoxmlTransformer();
    const convertedCiceroMark = ooxmlTransformer.toCiceroMark(ooxml);
    expect(convertedCiceroMark).to.deep.equal(ciceroMark);
};

module.exports = { checkRoundTripEquality };