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

const dateTimeParser = require('../lib/dateTimeParser').dateTimeParser;

describe('#date', () => {
    it('should parse valid date [default]', async () => {
        dateTimeParser().parse('12/31/2020').status.should.equal(true);
    });
    it('should parse valid date [YYYY/MM/DD]', async () => {
        dateTimeParser('YYYY/MM/DD').parse('2020/12/31').status.should.equal(true);
    });
    it('should parse valid date [MMM DD, YYYY]', async () => {
        dateTimeParser('MMM DD, YYYY').parse('Dec 31, 2020').status.should.equal(true);
    });
    it('should parse valid date [YYYY M D]', async () => {
        dateTimeParser('YYYY M D').parse('2020 1 1').status.should.equal(true);
    });
    it('should parse valid date [MMMM DD, YYYY]', async () => {
        dateTimeParser('MMMM DD, YYYY').parse('December 31, 2020').status.should.equal(true);
    });

    it('should not parse invalid date [default]', async () => {
        dateTimeParser().parse('31/12/2020').status.should.equal(false);
    });
    it('should not parse invalid date [DD/MM/YYYY]', async () => {
        dateTimeParser('DD/MM/YYYY').parse('12/31/2020').status.should.equal(false);
    });
    it('should not parse invalid date [MMMM DD, YYYY]', async () => {
        dateTimeParser('MMMM DD, YYYY').parse('Dec 31, 2020').status.should.equal(false);
    });
});

describe('#dateTime', () => {
    it('should parse valid dateTime [ISO]', async () => {
        dateTimeParser('YYYY-MM-DDTHH:mm:ssZ').parse('2020-12-31T20:39:42-00:00').status.should.equal(true);
    });
    it('should parse valid dateTime [fractional seconds]', async () => {
        dateTimeParser('YYYY-MM-DDTHH:mm:ss.SSS').parse('2020-12-31T20:39:42.314').status.should.equal(true);
    });
    it('should parse valid dateTime [YYYY MM DD(H:mm:ss)]', async () => {
        dateTimeParser('YYYY MM DD(H:mm:ss)').parse('2020 12 31(1:03:42)').status.should.equal(true);
    });
});

describe('#time', () => {
    it('should parse valid time', async () => {
        dateTimeParser('HH:mm:ssZ').parse('20:39:42-00:00').status.should.equal(true);
    });
});
