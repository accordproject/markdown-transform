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

const draftDoubleIEEE = require('../Double/format').draftDoubleIEEE;
const draftDoubleFormat = require('../Double/format').draftDoubleFormat;
const symbols = require('./symbols.json');

/**
 * Creates a drafter for monetary amount with no format
 * @param {object} value the monetary amount
 * @returns {string} the text
 */
function monetaryAmountDefaultDrafter(value) {
    return '' + draftDoubleIEEE(value.doubleValue) + ' ' + value.currencyCode;
}

/**
 * Symbol from a currency code
 * @param {string} code - the currency code 
 * @returns {string} the symbol
 */
function codeSymbol(c) {
    return symbols[c] ? symbols[c] : c;
}

/**
 * Creates a drafter for monetary amount with a given format
 * @param {object} value the monetary amount
 * @returns {string} the text
 */
function monetaryAmountFormatDrafter(value,format) {
    return draftDoubleFormat(value.doubleValue,
                             format
                             .replace(/K/gi,codeSymbol(value.currencyCode))
                             .replace(/CCC/gi,value.currencyCode));
}

/**
 * Creates a drafter for a monetary amount
 * @param {object} value the monetary amount
 * @returns {string} the text
 */
function monetaryAmountDrafter(value,format) {
    if (format) {
        return monetaryAmountFormatDrafter(value,format);
    } else {
        return monetaryAmountDefaultDrafter(value);
    }
}

module.exports = monetaryAmountDrafter;
