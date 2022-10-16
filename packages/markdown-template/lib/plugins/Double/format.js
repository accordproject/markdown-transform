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

/**
 * Creates a parser for IEEE Double
 * @param {object} variable the variable ast node
 * @returns {object} the parser
 */
function parseDoubleIEEE() {
  return P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/).map(function (x) {
    return Number(x);
  }).desc('A Double amount');
}

/**
 * Creates a drafter for Double
 * @param {number} value - the double
 * @returns {string} the text
 */
function draftDoubleIEEE(value) {
  if (Math.floor(value) === value) {
    return new Number(value).toFixed(1); // Make sure there is always decimal point
  } else {
    return '' + value;
  }
}

/**
 * Creates a parser for a formatted Double
 * @param {string} format - the format
 * @returns {object} the parser
 */
function parseDoubleFormat(format) {
  var escapeRegex = x => x.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  var sep1 = null;
  var sep2 = null;
  var digits = null;
  var match = format.match(/0(.)0((.)(0+))?/);
  sep1 = escapeRegex(match[1]);
  if (match[2]) {
    sep2 = escapeRegex(match[3]);
    digits = match[4].length;
  }
  var amount = '';
  amount += '-?[0-9]?[0-9]?[0-9](' + sep1 + '([0-9][0-9][0-9]))*';
  if (sep2) {
    amount += sep2 + '[0-9]'.repeat(digits);
  }
  var AMOUNT_RE = new RegExp(amount);
  return P.regexp(AMOUNT_RE).desc('An amount with format "' + format + '"').map(function (x) {
    var numberText = x.replace(new RegExp(sep1, 'g'), '');
    if (sep2) {
      numberText = numberText.replace(new RegExp(sep2, 'g'), '.');
    }
    return Number(numberText);
  });
}

/**
 * Creates a drafter for a formatted Double
 * @param {number} value - the Double
 * @param {string} format - the format
 * @returns {object} the parser
 */
function draftDoubleFormat(value, format) {
  return format.replace(/0(.)0((.)(0+))?/gi, function (_a, sep1, _b, sep2, digits) {
    var len = digits ? digits.length : 0;
    var vs = value.toFixed(len);
    var res = '';
    if (sep2) {
      var d = vs.substring(vs.length - len);
      res += sep2 + d;
    }
    var i = vs.substring(0, vs.length - (len === 0 ? 0 : len + 1));
    while (i.length > 3) {
      res = sep1 + i.substring(i.length - 3) + res;
      i = i.substring(0, i.length - 3);
    }
    return i + res;
  });
}
module.exports.parseDoubleIEEE = parseDoubleIEEE;
module.exports.draftDoubleIEEE = draftDoubleIEEE;
module.exports.parseDoubleFormat = parseDoubleFormat;
module.exports.draftDoubleFormat = draftDoubleFormat;