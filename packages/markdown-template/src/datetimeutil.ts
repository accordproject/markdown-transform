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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

/**
 * Ensures there is a proper current time
 */
export function setCurrentTime(currentTime?: string): dayjs.Dayjs {
    if (!currentTime) {
        return dayjs.utc();
    }
    try {
        return dayjs.utc(currentTime);
    } catch (err: any) {
        throw new Error(`${currentTime} is not a valid date and time: ${err.message}`);
    }
}
