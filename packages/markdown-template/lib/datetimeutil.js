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
 * Ensures there is a proper current time
 *
 * @param {string} currentTime - the definition of 'now'
 * @returns {object} if valid, the dayjs object for the current time
 */
function setCurrentTime(currentTime) {
  if (!currentTime) {
    // Defaults to current local time
    return dayjs.utc();
  }
  try {
    return dayjs.utc(currentTime);
  } catch (err) {
    throw new Error("".concat(currentTime, " is not a valid date and time: ").concat(err.message));
  }
}
module.exports = {
  setCurrentTime
};