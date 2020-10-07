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

const draftInteger = require('./format').draftInteger;
const draftIntegerFormat = require('./format').draftIntegerFormat;

/**
 * Creates a drafter for an Integer
 * @param {number} value - the integer
 * @param {string} format - the format
 * @returns {string} the text
 */
function integerDrafter(value,format) {
    if (format) {
        return draftIntegerFormat(value,format);
    } else {
        return draftInteger(value);
    }
}

module.exports = integerDrafter;
