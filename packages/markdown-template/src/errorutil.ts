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

import { TemplateException } from './templateexception';

/**
 * Throw a template exception for the element
 */
export function _throwTemplateExceptionForElement(message: string, element: any): never {
    const fileName = 'text/grammar.tem.md';
    const column = -1;
    const line = -1;

    const token = element && element.value ? element.value : ' ';
    const endColumn = column + token.length;

    const fileLocation = {
        start: { line, column },
        end: { line, endColumn },
    };

    throw new TemplateException(message, fileLocation, fileName, undefined, 'markdown-template');
}
