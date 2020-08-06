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

const crypto = require('crypto');

/**
 * Flatten an array of array
 * @param {*[]} arr the input array
 * @return {*[]} the flattened array
 */
function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Returns a unique chosen name for a formula
 * @param {string} code - the formula code
 * @return {string} the unique name
 */
function formulaName(code) {
    const hasher = crypto.createHash('sha256');
    hasher.update(code);
    return 'formula_' + hasher.digest('hex');
}

module.exports.flatten = flatten;
module.exports.formulaName = formulaName;
