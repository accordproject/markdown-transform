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

Error.stackTraceLimit = Infinity;
var P = require('parsimmon');
var textParser = require('../../combinators').textParser;
var seqParser = require('../../combinators').seqParser;
var choiceStringsParser = require('../../combinators').choiceStringsParser;
var mkCompoundVariable = require('../../combinators').mkCompoundVariable;

/**
 * English-language months
 */
var MMM = {
  'Jan': 1,
  'Feb': 2,
  'Mar': 3,
  'Apr': 4,
  'May': 5,
  'Jun': 6,
  'Jul': 7,
  'Aug': 8,
  'Sep': 9,
  'Oct': 10,
  'Nov': 11,
  'Dec': 12
};
var MMMM = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12
};

/**
 * Creates a DateTime variable output
 * @param {*} value - the date time components
 * @param {string} utcOffset - the default UTC offset
 * @returns {object} the variable
 */
function mkDateTime(value, utcOffset) {
  var fillNumber = (x, digits, def) => {
    var nb = x ? '' + x : '' + def;
    return nb.padStart(digits, '0');
  };
  var valueObj = mkCompoundVariable('DateTime', value);
  var preHour = '';
  if (valueObj.hour) {
    if (valueObj.halfDay === 'am') {
      preHour = valueObj.hour === 12 ? 0 : valueObj.hour;
    } else if (valueObj.halfDay === 'pm') {
      preHour = valueObj.hour === 12 ? 12 : valueObj.hour + 12;
    } else {
      preHour = valueObj.hour;
    }
  }
  var year = fillNumber(valueObj.year, 4, 0);
  var month = fillNumber(valueObj.month, 2, 1);
  var day = fillNumber(valueObj.day, 2, 1);
  var hour = fillNumber(preHour, 2, 0);
  var minute = fillNumber(valueObj.minute, 2, 0);
  var second = fillNumber(valueObj.second, 2, 0);
  var fracsecond = fillNumber(valueObj.fracsecond, 3, 0);
  var timezone = valueObj.timezone ? '' + valueObj.timezone : utcOffset;
  var result = "".concat(year, "-").concat(month, "-").concat(day, "T").concat(hour, ":").concat(minute, ":").concat(second, ".").concat(fracsecond).concat(timezone);
  return result;
}

/**
 * Creates a field output
 * @param {string} field the field name
 * @param {*} value the variable value
 * @returns {object} the field
 */
function mkField(field, value) {
  var result = {};
  result.name = field;
  result.value = value;
  return result;
}

/**
 * Creates a parser for D format
 * @returns {object} the parser
 */
function parserD() {
  return P.regexp(/([1-2][0-9])|(3[0-1])|[1-9]/).map(function (x) {
    return mkField('day', Number(x));
  });
}

/**
 * Creates a parser for DD format
 * @returns {object} the parser
 */
function parserDD() {
  return P.regexp(/([1-2][0-9])|(3[0-1])|0[1-9]/).map(function (x) {
    return mkField('day', Number(x));
  });
}

/**
 * Creates a parser for M format
 * @returns {object} the parser
 */
function parserM() {
  return P.regexp(/(1[0-2])|[1-9]/).map(function (x) {
    return mkField('month', Number(x));
  });
}

/**
 * Creates a parser for MM format
 * @returns {object} the parser
 */
function parserMM() {
  return P.regexp(/(1[0-2])|0[1-9]/).map(function (x) {
    return mkField('month', Number(x));
  });
}

/**
 * Creates a parser for MMM format
 * @returns {object} the parser
 */
function parserMMM() {
  return choiceStringsParser(Object.keys(MMM)).map(function (x) {
    return mkField('month', MMM[x]);
  });
}

/**
 * Creates a parser for MMMM format
 * @returns {object} the parser
 */
function parserMMMM() {
  return choiceStringsParser(Object.keys(MMMM)).map(function (x) {
    return mkField('month', MMMM[x]);
  });
}

/**
 * Creates a parser for YYYY format
 * @returns {object} the parser
 */
function parserYYYY() {
  return P.regexp(/[0-9][0-9][0-9][0-9]/).map(function (x) {
    return mkField('year', Number(x));
  });
}

/**
 * Creates a parser for H format
 * @returns {object} the parser
 */
function parserH() {
  return P.regexp(/2[0-3]|1[0-9]|[0-9]/).map(function (x) {
    return mkField('hour', Number(x));
  });
}

/**
 * Creates a parser for HH format
 * @returns {object} the parser
 */
function parserHH() {
  return P.regexp(/2[0-3]|[0-1][0-9]/).map(function (x) {
    return mkField('hour', Number(x));
  });
}

/**
 * Creates a parser for hh format
 * @returns {object} the parser
 */
function parserh() {
  return P.regexp(/1[0-2]|[1-9]/).map(function (x) {
    return mkField('hour', Number(x));
  });
}

/**
 * Creates a parser for hh format
 * @returns {object} the parser
 */
function parserhh() {
  return P.regexp(/1[0-2]|0[1-9]/).map(function (x) {
    return mkField('hour', Number(x));
  });
}

/**
 * Creates a parser for mm format
 * @returns {object} the parser
 */
function parsermm() {
  return P.regexp(/[0-5][0-9]/).map(function (x) {
    return mkField('minute', Number(x));
  });
}

/**
 * Creates a parser for ss format
 * @returns {object} the parser
 */
function parserss() {
  return P.regexp(/[0-5][0-9]/).map(function (x) {
    return mkField('second', Number(x));
  });
}

/**
 * Creates a parser for SSS format
 * @returns {object} the parser
 */
function parserSSS() {
  return P.regexp(/[0-9][0-9][0-9]/).map(function (x) {
    return mkField('fracsecond', Number(x));
  });
}

/**
 * Creates a parser for Z format
 * @returns {object} the parser
 */
function parserZ() {
  return P.regexp(/([-]|[+])[0-9][0-9]:[0-9][0-9]/).map(function (x) {
    return mkField('timezone', x);
  });
}

/**
 * Creates a parser for a format
 * @returns {object} the parser
 */
function parsera() {
  return P.alt(P.string('am'), P.string('pm')).map(function (x) {
    return mkField('halfDay', x);
  });
}

/**
 * Creates a parser for a format
 * @returns {object} the parser
 */
function parserA() {
  return P.alt(P.string('AM'), P.string('PM')).map(function (x) {
    return mkField('halfDay', x.toLowerCase());
  });
}

/**
 * Parsing table for variables
 * This maps types to their parser
 */
var parsingTable = {
  'D': parserD,
  'DD': parserDD,
  'M': parserM,
  'MM': parserMM,
  'MMM': parserMMM,
  'MMMM': parserMMMM,
  'YYYY': parserYYYY,
  'H': parserH,
  'HH': parserHH,
  'h': parserh,
  'hh': parserhh,
  'mm': parsermm,
  'ss': parserss,
  'SSS': parserSSS,
  'Z': parserZ,
  'a': parsera,
  'A': parserA
};

/**
 * Given a format field (like HH or D) this method returns
 * a logical name for the field. Note the logical names
 * have been picked to align with the dayjs format.
 * @param {string} field - the input format field
 * @returns {string} the field designator
 */
function parserOfField(field) {
  var parserFun = parsingTable[field];
  if (parserFun) {
    return parserFun();
  } else {
    return textParser(field);
  }
}

/**
 * Creates a parser for a DateTime variable
 * @param {format} format the format
 * @param {*} parserManager - the parser manager
 * @returns {object} the parser
 */
function dateTimeParser(format, parserManager) {
  // Default UTC offset is extracted from passed current time
  var utcOffset = parserManager.getCurrentTime().format('Z');
  if (!format) {
    format = 'MM/DD/YYYY';
  }

  // XXX the format could be parsed as well instead of this split which seems error-prone
  var hasTimeZone = format.charAt(format.length - 1) === 'Z';
  if (hasTimeZone) {
    // strip Z
    format = format.substr(0, format.length - 1);
  }
  var fields = format.split(/(DD|D|MMMM|MMM|MM|M|YYYY|HH|H|hh|h|mm|ss|SSS|a|A)+/);
  if (hasTimeZone) {
    fields.push('Z');
  }
  var parsers = fields.map(parserOfField);
  return seqParser(parsers).map(function (x) {
    return mkDateTime(x, utcOffset);
  });
}
module.exports = (format, parserManager) => r => dateTimeParser(format, parserManager);