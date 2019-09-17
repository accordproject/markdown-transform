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
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/Commands');

describe('markdown-cli', () => {
    const sample = path.resolve(__dirname, 'data', 'acceptance.md');
    const sampleExpectedJson = fs.readFileSync(path.resolve(__dirname, 'data', 'acceptance.json'), 'utf8');
    const sampleExpectedText = `HELLO! This is the contract editor.
====

And below is a **clause**.

\`\`\` <clause src="ap://acceptance-of-delivery@0.12.1#721d1aa0999a5d278653e211ae2a64b75fdd8ca6fa1f34255533c942404c5c1f" clauseid="479adbb4-dc55-4d1a-ab12-b6c5e16900c0"/>
Acceptance of Delivery. <variable id="shipper" value="%22Party%20A%22"/> will be deemed to have completed its delivery obligations if in <variable id="receiver" value="%22Party%20B%22"/>'s opinion, the <variable id="deliverable" value="%22Widgets%22"/> satisfies the Acceptance Criteria, and <variable id="receiver" value="%22Party%20B%22"/> notifies <variable id="shipper" value="%22Party%20A%22"/> in writing that it is accepting the <variable id="deliverable" value="%22Widgets%22"/>.

Inspection and Notice. <variable id="receiver" value="%22Party%20B%22"/> will have <variable id="businessDays" value="10"/> Business Days' to inspect and evaluate the <variable id="deliverable" value="%22Widgets%22"/> on the delivery date before notifying <variable id="shipper" value="%22Party%20A%22"/> that it is either accepting or rejecting the <variable id="deliverable" value="%22Widgets%22"/>.

Acceptance Criteria. The "Acceptance Criteria" are the specifications the <variable id="deliverable" value="%22Widgets%22"/> must meet for the <variable id="shipper" value="%22Party%20A%22"/> to comply with its requirements and obligations under this agreement, detailed in <variable id="attachment" value="%22Attachment%20X%22"/>, attached to this agreement.
\`\`\``;

    describe('#parse', () => {
        it('should parse a markdown file', async () => {
            const options = {};
            options.roundtrip = false;
            options.cicero = false;
            options.slate = false;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            result.should.eql(sampleExpectedJson);
        });
    });

    describe('#generateMarkdown', () => {
        it('should generate the text for a markdown file', async () => {
            const options = {};
            options.roundtrip = true;
            options.cicero = false;
            options.slate = false;
            options.noWrap = true;
            const result = await Commands.parse(sample, null, options);
            result.should.eql(sampleExpectedText);
        });
    });
});
