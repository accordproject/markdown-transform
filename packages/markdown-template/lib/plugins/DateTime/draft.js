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

var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

/**
 * Creates a drafter for DateTime
 * @param {object} value the DateTime
 * @param {object} format the the format
 * @returns {string} the text
 */
function dateTimeDrafter(value, format) {
  var f = format ? format : 'MM/DD/YYYY';
  return dayjs.utc(value).format(f);
}
module.exports = dateTimeDrafter;