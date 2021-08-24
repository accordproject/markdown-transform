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

const uuid = require('uuid');

const createTemplate = require('./templateTemplate');
const createTab = (pageNumber, w, x, y, tabLabel, recipientId) => {
    // XXX Tabs are boxes so we have to adjust dimensions for centering
    const xPosition = Math.round(x - 3).toString(); // Start box a little to the left
    const yPosition = Math.round(y - 2).toString(); // Start box a little above the line
    const width = Math.round(w + 5).toString();   // Make the box a little bigger than the variable
    return {
        documentId: '1',
        height: '18', // XXX This will have to be figured out
        pageNumber: Math.round(pageNumber).toString(),
        recipientId,
        tabId: uuid.v4(),
        tabType: 'text', // XXX Only supports text tabs
        templateLocked: 'false',
        templateRequired: 'false',
        width,
        xPosition,
        yPosition,
        font: 'helvetica', // XXX What's possible here?
        fontColor: 'black',
        fontSize: 'size9',
        localePolicy: {},
        tabLabel,
        concealValueOnDocument: 'false',
        disableAutoSize: 'false',
        locked: 'false',
        maxLength: '4000',
        required: 'true',
        value: tabLabel, // XXX Maybe play with this, see what happens?
        requireAll: 'false',
        requireInitialOnSharedChange: 'false',
        shared: 'false',
        validationMessage: '',
        validationPattern: ''
    };
};
const findParticipantIndex = (role, roles) => {
    const index = roles.indexOf(role);
    if (index < 0) { return 0; }
    return index;
};
const createDocuSignTemplate = (name, roles = ['Recipient1'], pdfBase64, nbPages, variables) => {
    const newTemplate = createTemplate(name, roles, pdfBase64, nbPages);
    variables.forEach((variable) => {
        const index = findParticipantIndex(variable.role, roles);
        const recipient = newTemplate.recipients.signers[index];
        const recipientId = (index + 1).toString(); // DocuSign does not allow 0 as identifier
        recipient.tabs.textTabs.push(createTab(
            variable.pageNb,
            variable.options.textWidth,
            variable.x,
            variable.y,
            variable.name,
            recipientId,
        ));
    });
    return newTemplate;
};

module.exports = { createDocuSignTemplate };
