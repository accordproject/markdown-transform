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

/**
 * Core drafting components
 */

/**
 * Creates a drafter for Double
 * @param {object} value the double
 * @returns {object} the text
 */
function doubleDrafter(value) {
    if (Math.floor(value) == value) return (new Number(value)).toFixed(1); // Make sure there is always decimal point
    else return '' + value;
}

/**
 * Creates a drafter for Integer
 * @param {object} value the Integer
 * @returns {object} the text
 */
function integerDrafter(value) {
    return '' + value;
}

/**
 * Creates a drafter for String
 * @param {object} value the String
 * @returns {object} the text
 */
function stringDrafter(value) {
    return '' + '"' + value + '"';
}

module.exports.doubleDrafter = doubleDrafter;
module.exports.integerDrafter = integerDrafter;
module.exports.stringDrafter = stringDrafter;
