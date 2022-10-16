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

var P = require('parsimmon');
var textParser = require('../../combinators').textParser;
var seqParser = require('../../combinators').seqParser;
var enumParser = require('../../combinators').enumParser;
var mkVariable = require('../../combinators').mkVariable;
var mkCompoundVariable = require('../../combinators').mkCompoundVariable;
var parseDoubleIEEE = require('../Double/format').parseDoubleIEEE;
var parseDoubleFormat = require('../Double/format').parseDoubleFormat;
var symbols = require('./symbols.json');

// This should rather be obtained from the model itself
var currencyCodes = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'];

// Reverse symbol table
var reverseSymbols = symbols => {
  var result = {};
  for (var i = 0; i < currencyCodes.length; i++) {
    var code = currencyCodes[i];
    if (symbols[code]) {
      result[symbols[code]] = code;
    } else {
      result[code] = code;
    }
  }
  return result;
};
var fromSymbols = reverseSymbols(symbols);

/**
 * Given a format field (like '0,0.00') this method returns
 * a logical name for the field.
 * @param {string} field - the input format field
 * @returns {string} the field designator
 */
function parserOfField(field) {
  if (/0.0(?:.0+)?/.test(field)) {
    return parseDoubleFormat(field).map(value => mkVariable({
      name: 'doubleValue',
      elementType: 'Double'
    }, value));
  } else if (field === 'CCC') {
    return enumParser(currencyCodes).map(value => mkVariable({
      name: 'currencyCode'
    }, value));
  } else if (field === 'K') {
    return enumParser(Object.keys(fromSymbols)).map(value => mkVariable({
      name: 'currencyCode'
    }, fromSymbols[value]));
  } else {
    return textParser(field).map(x => null);
  }
}

/**
 * Creates a parser for a Double variable
 * @param {string} format the format
 * @returns {object} the parser
 */
function monetaryAmountParser(format) {
  var parsers;
  if (format) {
    var fields = format.split(/(CCC|K|0.0(?:.0+)?)/);
    // remove null or empty strings
    fields = fields.filter(x => x !== '' && x !== null);
    parsers = fields.map(parserOfField);
  } else {
    parsers = [parseDoubleIEEE().map(value => mkVariable({
      name: 'doubleValue',
      elementType: 'Double'
    }, value)), P.string(' ').map(x => null), enumParser(currencyCodes).map(value => mkVariable({
      name: 'currencyCode'
    }, value))];
  }
  return seqParser(parsers).map(value => {
    return mkCompoundVariable('org.accordproject.money.MonetaryAmount', value.filter(x => x));
  });
}
module.exports = format => r => monetaryAmountParser(format);