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

const doubleParser = require('./doubleParser').doubleParser;
const integerParser = require('./coreparsers').integerParser;
const stringParser = require('./coreparsers').stringParser;
const dateTimeParser = require('./dateTimeParser').dateTimeParser;

const doubleDrafter = require('./doubleDrafter').doubleDrafter;
const integerDrafter = require('./coredrafters').integerDrafter;
const stringDrafter = require('./coredrafters').stringDrafter;
const dateTimeDrafter = require('./dateTimeDrafter').dateTimeDrafter;
const resourceDrafter = require('./coredrafters').resourceDrafter;

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const defaultParsingTable = {
    'Integer' : { parse: integerParser, draft: integerDrafter },
    'Long' : { parse: integerParser, draft: integerDrafter },
    'Double' : { parse: doubleParser, draft: doubleDrafter },
    'String' : { parse: stringParser, draft: stringDrafter },
    'DateTime' : { parse: dateTimeParser, draft: dateTimeDrafter },
    'Resource' : { parse: stringParser, draft: resourceDrafter },
};

/**
 * Maintains a parsing table
 * @class
 */
class ParsingTable {
    /**
     * Create the ParsingTable
     * @param {object} template - the template instance
     */
    constructor() {
        // Mapping from types to parsers/drafters
        this.parsingTable = defaultParsingTable;
    }

    /**
     * Gets parsing table for variables
     * @return {object} the parsing table
     */
    getParsingTable() {
        return this.parsingTable;
    }

    /**
     * Sets parsing table for variables
     * @param {object} table the parsing table
     */
    setParsingTable(table) {
        this.parsingTable = table;
    }

    /**
     * Gets parser for a given type
     * @param {string} elementType the type
     * @return {*} the parser
     */
    getParser(elementType) {
        const entry = this.getParsingTable()[elementType];
        if (entry) {
            return entry.parse;
        } else {
            throw new Error('No known parser for type ' + elementType);
        }
    }

    /**
     * Gets drafter for a given type
     * @param {string} elementType the type
     * @return {*} the drafter
     */
    getDrafter(elementType) {
        const entry = this.getParsingTable()[elementType];
        if (entry) {
            return entry.draft;
        } else {
            throw new Error('No known drafter for type ' + elementType);
        }
    }

}

module.exports = ParsingTable;
