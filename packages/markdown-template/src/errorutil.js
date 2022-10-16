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

const ParseException = require('@accordproject/concerto-cto').ParseException;
const TemplateException = require('./templateexception');

/**
 * Minimum length of expected token
 * @param {object} expected the expected token
 * @return {number} the minimum length
 */
function maxOfExpected(expected) {
    return Math.max.apply(null,expected.map((x) => x.length));
}

/**
 * Clean up expected tokens
 * @param {object} expected the expected token
 * @return {object} nicer looking expected tokens
 */
function cleanExpected(expected) {
    return expected.map((x) => new RegExp(/'[^']*'/).test(x) ? x.substr(1,x.length -2) : x);
}

/**
 * Throw a parse exception
 * @param {string} markdown a markdown string
 * @param {object} result the parsing failure
 * @param {string} [fileName] - the fileName for the markdown (optional)
 */
function _throwParseException(markdown,result,fileName) {
    // File location
    const fileLocation = {};
    let shortMessage;
    let longMessage;
    if (typeof result !== 'string') {
        // Short message
        shortMessage = `Parse error at line ${result.index.line} column ${result.index.column}`;

        // Location
        const start = result.index;
        const end = Object.assign({},start);
        end.offset = end.offset+1;
        end.column = end.column+1;
        fileLocation.start = start;
        fileLocation.end = end;

        const lines = markdown.split('\n');
        const expected = result.expected;
        const underline = ((line) => {
            const maxLength = line.length - (start.column-1);
            const maxExpected = maxOfExpected(cleanExpected(expected));
            return '^'.repeat(maxLength < maxExpected ? maxLength : maxExpected);
        });
        const line = lines[start.line - 1];
        const snippet = line + '\n' + ' '.repeat(start.column-1) + underline(line);
        const isEOF = (x) => {
            if (x[0] && x[0] === 'EOF') {
                return true;
            } else {
                return false;
            }
        };

        // Long message
        const expectedMessage = 'Expected: ' + (isEOF(expected) ? 'End of text' : expected.join(' or '));
        longMessage = shortMessage + '\n' + snippet + '\n' + expectedMessage;
    } else {
        shortMessage = result;
        longMessage = shortMessage;
        fileLocation.start = { offset: -1, column: -1 };
        fileLocation.end = { offset: -1, column: -1 };
    }

    throw new ParseException(shortMessage, fileLocation, fileName, longMessage, 'markdown-template');
}

/**
 * Throw a template exception for the element
 * @param {string} message - the error message
 * @param {object} element the AST
 * @throws {TemplateException}
 */
function _throwTemplateExceptionForElement(message, element) {
    const fileName = 'text/grammar.tem.md';
    //let column = element.fieldName.col;
    //let line = element.fieldName.line;
    let column = -1;
    let line = -1;

    let token = element && element.value ? element.value : ' ';
    const endColumn = column + token.length;

    const fileLocation = {
        start: {
            line,
            column,
        },
        end: {
            line,
            endColumn,//XXX
        },
    };

    throw new TemplateException(message, fileLocation, fileName, null, 'markdown-template');
}

module.exports._throwTemplateExceptionForElement = _throwTemplateExceptionForElement;
module.exports._throwParseException = _throwParseException;
