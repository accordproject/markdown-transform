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

const TemplateException = require('./templateexception');

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
