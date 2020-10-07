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

const P = require('parsimmon');

/**
 * Creates a parser for Integer
 * @returns {object} the parser
 */
function parseInteger() {
    return P.regexp(/-?[0-9]+/).map(function(x) {
        return Number(x);
    }).desc('An Integer literal');
}

/**
 * Creates a drafter for Integer
 * @param {number} value - the integer
 * @returns {string} the text
 */
function draftInteger(value) {
    return '' + value;
}

/**
 * Creates a parser for a formatted Integer
 * @param {string} format - the format
 * @returns {object} the parser
 */
function parseIntegerFormat(format) {
    const escapeRegex = x => x.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    let sep1 = null;
    const match = format.match(/0(.)0/);
    sep1 = escapeRegex(match[1]);
    let amount = '';
    amount += '-?[0-9]?[0-9]?[0-9]('+sep1+'([0-9][0-9][0-9]))*';
    const AMOUNT_RE = new RegExp(amount);
    return P.regexp(AMOUNT_RE)
        .desc('An amount with format "' + format + '"')
        .map(function(x) {
            let numberText = x.replace(new RegExp(sep1, 'g'), '');
            return Number(numberText);
        });
}

/**
 * Creates a drafter for a formatted Integer
 * @param {number} value - the Integer
 * @param {string} format - the format
 * @returns {object} the parser
 */
function draftIntegerFormat(value,format) {
    return format.replace(/0(.)0/gi, function(_a,sep1,_b){
        const vs = value.toFixed(0);
        let res = '';
        let i = vs.substring(0,vs.length);
        while (i.length > 3) {
            res = sep1 + i.substring(i.length - 3) + res;
            i = i.substring(0, i.length - 3);
        }
        return i + res;
    });
}

module.exports.parseInteger = parseInteger;
module.exports.draftInteger = draftInteger;
module.exports.parseIntegerFormat = parseIntegerFormat;
module.exports.draftIntegerFormat = draftIntegerFormat;
