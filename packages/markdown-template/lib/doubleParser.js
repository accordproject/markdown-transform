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
const textParser = require('./coreparsers').textParser;
const seqParser = require('./coreparsers').seqParser;
const choiceStringsParser = require('./coreparsers').choiceStringsParser;

/**
 * Creates a parser for IEEE Double
 * @param {object} variable the variable ast node
 * @returns {object} the parser
 */
function doubleIEEEParser() {
    return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/).map(function(x) {
        return Number(x);
    }).desc('A Double literal');
}

function amountFormatParser(field) {
    const escapeRegex = x => x.replace(/[-\/\\^$*+?.()|\[\]{}]/g, '\\$&');

    let sep1 = null;
    let sep2 = null;
    let digits = null;
    const match = field.match(/0(.)0((.)(0+))?/);
    sep1 = escapeRegex(match[1]);
    if (match[2]) {
        sep2 = escapeRegex(match[3]);
        digits = match[4].length;
    }
    let amount = '';
    amount += '[0-9]?[0-9]?[0-9]('+sep1+'([0-9][0-9][0-9]))*';
    if (sep2) {
        amount += sep2 + '[0-9]'.repeat(digits);
    }
    const AMOUNT_RE = new RegExp(amount);
    return P.regexp(AMOUNT_RE)
        .desc('An amount with format "' + field + '"')
        .map(function(x) {
            let numberText = x.replace(new RegExp(sep1, 'g'), '');
            if (sep2) {
                numberText = numberText.replace(new RegExp(sep2, 'g'), '.');
            }
            return Number(numberText);
        });

}

/**
 * Given a format field (like '0,0.00') this method returns
 * a logical name for the field. Note the logical names
 * have been picked to align with the moment constructor that takes an object.
 * @param {string} field - the input format field
 * @returns {string} the field designator
 */
function parserOfField(field) {
    if (/0.0(?:.0+)?/.test(field)) {
        return amountFormatParser(field);
    } else {
        return textParser(field);
    }
}

/**
 * Creates a parser for a Double variable
 * @param {string} format the format
 * @returns {object} the parser
 */
function doubleParser(format) {
    if (format) {
        let fields = format.split(/(0.0(?:.0+)?)/);
        // remove null or empty strings
        fields = fields.filter(x => x !== '' && x !== null);
        const parsers = fields.map(parserOfField);
        return seqParser(parsers);
    } else {
        return doubleIEEEParser();
    }
}

module.exports.doubleParser = doubleParser;
