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

var draftDoubleIEEE = require('./format').draftDoubleIEEE;
var draftDoubleFormat = require('./format').draftDoubleFormat;

/**
 * Creates a drafter for a double
 * @param {number} value - the Double
 * @param {string} format - the format
 * @returns {string} the text
 */
function doubleDrafter(value, format) {
  if (format) {
    return draftDoubleFormat(value, format);
  } else {
    return draftDoubleIEEE(value);
  }
}
module.exports = doubleDrafter;