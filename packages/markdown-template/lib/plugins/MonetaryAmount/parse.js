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
const textParser = require('../../combinators').textParser;
const seqParser = require('../../combinators').seqParser;
const enumParser = require('../../combinators').enumParser;
const mkVariable = require('../../combinators').mkVariable;
const mkCompoundVariable = require('../../combinators').mkCompoundVariable;

const parseDoubleIEEE = require('../Double/format').parseDoubleIEEE;
const parseDoubleFormat = require('../Double/format').parseDoubleFormat;
const symbols = require('./symbols.json');

// This should rather be obtained from the model itself
const currencyCodes = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BOV","BRL","BSD","BTN","BWP","BYN","BZD","CAD","CDF","CHE","CHF","CHW","CLF","CLP","CNY","COP","COU","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU","MUR","MVR","MWK","MXN","MXV","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP","STN","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","USN","UYI","UYU","UZS","VEF","VND","VUV","WST","XAF","XAG","XAU","XBA","XBB","XBC","XBD","XCD","XDR","XOF","XPD","XPF","XPT","XSU","XTS","XUA","XXX","YER","ZAR","ZMW","ZWL"];

// Reverse symbol table
const reverseSymbols = (symbols) => {
    const result = {};
    for (let i = 0; i < currencyCodes.length; i++) {
        const code = currencyCodes[i];
        if (symbols[code]) {
            result[symbols[code]] = code;
        } else {
            result[code] = code;
        }
    }
    return result;
};
const fromSymbols = reverseSymbols(symbols);

/**
 * Given a format field (like '0,0.00') this method returns
 * a logical name for the field. Note the logical names
 * have been picked to align with the moment constructor that takes an object.
 * @param {string} field - the input format field
 * @returns {string} the field designator
 */
function parserOfField(field) {
    if (/0.0(?:.0+)?/.test(field)) {
        return parseDoubleFormat(field).map((value) => mkVariable({
            name: 'doubleValue',
            elementType: 'Double',
        },value));
    } else if (field === 'CCC') {
        return enumParser(currencyCodes).map((value) => mkVariable({
            name: 'currencyCode',
        },value));
    } else if (field === 'K') {
        return enumParser(Object.keys(fromSymbols)).map((value) => mkVariable({
            name: 'currencyCode',
        },fromSymbols[value]));
    } else {
        return textParser(field).map((x) => null);
    }
}

/**
 * Creates a parser for a Double variable
 * @param {string} format the format
 * @returns {object} the parser
 */
function monetaryAmountParser(format) {
    let parsers;
    if (format) {
        let fields = format.split(/(CCC|K|0.0.00?0?)/);
        // remove null or empty strings
        fields = fields.filter(x => x !== '' && x !== null);
        parsers = fields.map(parserOfField);
    } else {
        parsers = [
            parseDoubleIEEE().map((value) => mkVariable({
                name: 'doubleValue',
                elementType: 'Double',
            },value)),
            P.string(' ').map((x) => null),
            enumParser(currencyCodes).map((value) => mkVariable({
                name: 'currencyCode',
            },value))
        ];
    }
    return seqParser(parsers).map((value) => {
        return mkCompoundVariable('org.accordproject.money.MonetaryAmount',value.filter(x => x))
    });
}

module.exports = (format) => (r) => monetaryAmountParser(format);
