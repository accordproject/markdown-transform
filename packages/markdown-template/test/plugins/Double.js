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

const chai = require('chai');
chai.use(require('chai-string'));

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

// Double parser
const Double = require('../../lib/plugins/Double');

describe('#Double', () => {
    describe('#parse', () => {
        it('should parse double', async () => {
            Double.javascript.parse()().parse('123.313e-33').status.should.equal(true);
            Double.javascript.parse()().parse('123.313e33').status.should.equal(true);
            Double.javascript.parse()().parse('123e33').status.should.equal(true);
            Double.javascript.parse()().parse('0e+33').status.should.equal(true);
            Double.javascript.parse()().parse('-123.313e-33').status.should.equal(true);
            Double.javascript.parse()().parse('-123.313e33').status.should.equal(true);
            Double.javascript.parse()().parse('-123e33').status.should.equal(true);
            Double.javascript.parse()().parse('-0e+33').status.should.equal(true);
        });
        it('should not parse if not double', async () => {
            Double.javascript.parse()().parse('123.a313e-33').status.should.equal(false);
            Double.javascript.parse()().parse('000e+33').status.should.equal(false);
        });
    });
});
