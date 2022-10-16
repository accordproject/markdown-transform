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

var ParseException = require('@accordproject/concerto-cto').ParseException;
var TemplateException = require('./templateexception');

/**
 * Minimum length of expected token
 * @param {object} expected the expected token
 * @return {number} the minimum length
 */
function maxOfExpected(expected) {
  return Math.max.apply(null, expected.map(x => x.length));
}

/**
 * Clean up expected tokens
 * @param {object} expected the expected token
 * @return {object} nicer looking expected tokens
 */
function cleanExpected(expected) {
  return expected.map(x => new RegExp(/'[^']*'/).test(x) ? x.substr(1, x.length - 2) : x);
}

/**
 * Throw a parse exception
 * @param {string} markdown a markdown string
 * @param {object} result the parsing failure
 * @param {string} [fileName] - the fileName for the markdown (optional)
 */
function _throwParseException(markdown, result, fileName) {
  // File location
  var fileLocation = {};
  var shortMessage;
  var longMessage;
  if (typeof result !== 'string') {
    // Short message
    shortMessage = "Parse error at line ".concat(result.index.line, " column ").concat(result.index.column);

    // Location
    var start = result.index;
    var end = Object.assign({}, start);
    end.offset = end.offset + 1;
    end.column = end.column + 1;
    fileLocation.start = start;
    fileLocation.end = end;
    var lines = markdown.split('\n');
    var expected = result.expected;
    var underline = line => {
      var maxLength = line.length - (start.column - 1);
      var maxExpected = maxOfExpected(cleanExpected(expected));
      return '^'.repeat(maxLength < maxExpected ? maxLength : maxExpected);
    };
    var line = lines[start.line - 1];
    var snippet = line + '\n' + ' '.repeat(start.column - 1) + underline(line);
    var isEOF = x => {
      if (x[0] && x[0] === 'EOF') {
        return true;
      } else {
        return false;
      }
    };

    // Long message
    var expectedMessage = 'Expected: ' + (isEOF(expected) ? 'End of text' : expected.join(' or '));
    longMessage = shortMessage + '\n' + snippet + '\n' + expectedMessage;
  } else {
    shortMessage = result;
    longMessage = shortMessage;
    fileLocation.start = {
      offset: -1,
      column: -1
    };
    fileLocation.end = {
      offset: -1,
      column: -1
    };
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
  var fileName = 'text/grammar.tem.md';
  //let column = element.fieldName.col;
  //let line = element.fieldName.line;
  var column = -1;
  var line = -1;
  var token = element && element.value ? element.value : ' ';
  var endColumn = column + token.length;
  var fileLocation = {
    start: {
      line,
      column
    },
    end: {
      line,
      endColumn //XXX
    }
  };

  throw new TemplateException(message, fileLocation, fileName, null, 'markdown-template');
}
module.exports._throwTemplateExceptionForElement = _throwTemplateExceptionForElement;
module.exports._throwParseException = _throwParseException;