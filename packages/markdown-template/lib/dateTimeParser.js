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
const mkVariable = require('./coreparsers').mkVariable;
const mkCompoundVariable = require('./coreparsers').mkCompoundVariable;

/**
 * English-language months
 */
const MMM = {
    'Jan':1,
    'Feb':2,
    'Mar':3,
    'Apr':4,
    'May':5,
    'Jun':6,
    'Jul':7,
    'Aug':8,
    'Sep':9,
    'Oct':10,
    'Nov':11,
    'Dec':12,
};
const MMMM = {
    'January':1,
    'February':2,
    'March':3,
    'April':4,
    'May':5,
    'June':6,
    'July':7,
    'August':8,
    'September':9,
    'October':10,
    'November':11,
    'December':12,
};

/**
 * Creates a DateTime variable output
 * @param {*} value the date time components
 * @returns {object} the variable
 */
function mkDateTime(value) {
    const fillNumber = (x,digits,def) => {
        const nb = x ? '' + x : '' + def;
        return nb.padStart(digits,'0');
    };
    const valueObj = mkCompoundVariable('DateTime',value);
    const year = fillNumber(valueObj.year,4,0);
    const month = fillNumber(valueObj.month,2,1);
    const day = fillNumber(valueObj.day,2,1);
    const hour = fillNumber(valueObj.hour,2,0);
    const minute = fillNumber(valueObj.minute,2,0);
    const second = fillNumber(valueObj.second,2,0);
    const fracsecond = fillNumber(valueObj.fracsecond,3,0);
    const timezone = valueObj.timezone ? '' + valueObj.timezone : '+00:00';
    const result = `${year}-${month}-${day}T${hour}:${minute}:${second}.${fracsecond}${timezone}`;
    return result;
}

/**
 * Creates a field output
 * @param {string} field the field name
 * @param {*} value the variable value
 * @returns {object} the field
 */
function mkField(field,value) {
    const result = {};
    result.name = field;
    result.value = value;
    return result;
}

/**
 * Creates a parser for D format
 * @returns {object} the parser
 */
function parserD() {
    return P.regexp(/([1-2][0-9])|(3[0-1])|[1-9]/).map(function(x) {
        return mkField('day',Number(x));
    });
}

/**
 * Creates a parser for DD format
 * @returns {object} the parser
 */
function parserDD() {
    return P.regexp(/([1-2][0-9])|(3[0-1])|0[1-9]/).map(function(x) {
        return mkField('day',Number(x));
    });
}

/**
 * Creates a parser for M format
 * @returns {object} the parser
 */
function parserM() {
    return P.regexp(/(1[0-2])|[1-9]/).map(function(x) {
        return mkField('month',Number(x));
    });
}

/**
 * Creates a parser for MM format
 * @returns {object} the parser
 */
function parserMM() {
    return P.regexp(/(1[0-2])|0[1-9]/).map(function(x) {
        return mkField('month',Number(x));
    });
}

/**
 * Creates a parser for MMM format
 * @returns {object} the parser
 */
function parserMMM() {
    return choiceStringsParser(Object.keys(MMM)).map(function(x) {
        return mkField('month',MMM[x]);
    });
}

/**
 * Creates a parser for MMMM format
 * @returns {object} the parser
 */
function parserMMMM() {
    return choiceStringsParser(Object.keys(MMMM)).map(function(x) {
        return mkField('month',MMMM[x]);
    });
}

/**
 * Creates a parser for YYYY format
 * @returns {object} the parser
 */
function parserYYYY() {
    return P.regexp(/[0-9][0-9][0-9][0-9]/).map(function(x) {
        return mkField('year',Number(x));
    });
}

/**
 * Creates a parser for H format
 * @returns {object} the parser
 */
function parserH() {
    return P.regexp(/2[0-3]|1[0-9]|[0-9]/).map(function(x) {
        return mkField('hour',Number(x));
    });
}

/**
 * Creates a parser for HH format
 * @returns {object} the parser
 */
function parserHH() {
    return P.regexp(/2[0-3]|[0-1][0-9]/).map(function(x) {
        return mkField('hour',Number(x));
    });
}

/**
 * Creates a parser for mm format
 * @returns {object} the parser
 */
function parsermm() {
    return P.regexp(/[0-5][0-9]/).map(function(x) {
        return mkField('minute',Number(x));
    });
}

/**
 * Creates a parser for ss format
 * @returns {object} the parser
 */
function parserss() {
    return P.regexp(/[0-5][0-9]/).map(function(x) {
        return mkField('second',Number(x));
    });
}

/**
 * Creates a parser for SSS format
 * @returns {object} the parser
 */
function parserSSS() {
    return P.regexp(/[0-9][0-9][0-9]/).map(function(x) {
        return mkField('fracsecond',Number(x));
    });
}

/**
 * Creates a parser for Z format
 * @returns {object} the parser
 */
function parserZ() {
    return P.regexp(/([-]|[+])[0-9][0-9]:[0-9][0-9]/).map(function(x) {
        return mkField('timezone',x);
    });
}

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const parsingTable = {
    'D' : parserD,
    'DD' : parserDD,
    'M' : parserM,
    'MM' : parserMM,
    'MMM' : parserMMM,
    'MMMM' : parserMMMM,
    'YYYY' : parserYYYY,
    'H' : parserH,
    'HH' : parserHH,
    'mm' : parsermm,
    'ss' : parserss,
    'SSS' : parserSSS,
    'Z' : parserZ,
};

/**
 * Given a format field (like HH or D) this method returns
 * a logical name for the field. Note the logical names
 * have been picked to align with the moment constructor that takes an object.
 * @param {string} field - the input format field
 * @returns {string} the field designator
 */
function parserOfField(field) {
    const parserFun = parsingTable[field];
    if (parserFun) {
        return parserFun();
    } else {
        return textParser(field);
    }
}

/**
 * Creates a parser for a DateTime variable
 * @param {format} format the format
 * @returns {object} the parser
 */
function dateTimeParser(format = 'MM/DD/YYYY') {
    // XXX the format could be parsed as well instead of this split which seems error-prone
    let hasTimeZone = format.charAt(format.length-1) === 'Z';
    if(hasTimeZone) {
        // strip Z
        format = format.substr(0,format.length-1);
    }

    const fields = format.split(/(DD|D|MMMM|MMM|MM|M|YYYY|HH|H|mm|ss|SSS)+/);
    if(hasTimeZone) {
        fields.push('Z');
    }
    const parsers = fields.map(parserOfField);
    return seqParser(parsers).map(function(x) {
        return mkDateTime(x);
    });
}

module.exports.dateTimeParser = dateTimeParser;
