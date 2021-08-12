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

const createSigner = (roleName, index) => {
    const recipientId = (index + 1).toString();
    return {
        accessCode: '',
        completedCount: '0',
        deliveryMethod: 'email',
        inheritEmailNotificationConfiguration: 'false',
        note: '',
        recipientId,
        recipientIdGuid: '00000000-0000-0000-0000-000000000000',
        recipientType: 'signer',
        requireIdLookup: 'false',
        roleName,
        routingOrder: '1',
        templateAccessCodeRequired: 'false',
        templateLocked: 'false',
        templateRequired: 'false',
        email: '',
        name: '',
        agentCanEditEmail: 'false',
        agentCanEditName: 'false',
        defaultRecipient: 'false',
        requireUploadSignature: 'false',
        signInEachLocation: 'false',
        tabs: {
            tabGroups: [
                {
                    documentId: '1',
                    pageNumber: '1',
                    recipientId,
                    tabId: uuid.v4(),
                    tabType: 'tabgroup',
                    templateLocked: 'false',
                    templateRequired: 'false',
                    xPosition: '0',
                    yPosition: '0',
                    groupLabel: `Checkbox Group ${uuid.v4()}`,
                    groupRule: 'SelectAtLeast',
                    maximumAllowed: '1',
                    minimumRequired: '0',
                    tabScope: 'Document'
                }
            ],
            textTabs: []
        }
    };
};

const createTemplate = (name, roles, pdfBase64, nbPages) => {
    const pageCount = nbPages.toString();
    return {
        allowComments: 'true',
        allowMarkup: 'false',
        allowReassign: 'true',
        anySigner: null,
        authoritativeCopy: 'false',
        autoNavigation: 'true',
        customFields: {
            listCustomFields: [],
            textCustomFields: [
                {
                    fieldId: '10559962267',
                    name: 'templateUsageRestriction',
                    required: 'false',
                    show: 'false',
                    value: 'allOptions'
                }
            ]
        },
        disableResponsiveDocument: 'true',
        emailBlurb: '',
        emailSubject: `Please DocuSign: ${name}.pdf`,
        enableWetSign: 'true',
        enforceSignerVisibility: 'false',
        envelopeIdStamping: 'true',
        envelopeLocation: 'current_site',
        notification: {
            expirations: {
                expireAfter: '120',
                expireEnabled: 'true',
                expireWarn: '0'
            },
            reminders: {
                reminderDelay: '0',
                reminderEnabled: 'false',
                reminderFrequency: '0'
            }
        },
        recipients: {
            agents: [],
            carbonCopies: [],
            certifiedDeliveries: [],
            editors: [],
            inPersonSigners: [],
            intermediaries: [],
            notaries: [],
            recipientCount: '2',
            seals: [],
            signers: roles.map(createSigner),
            witnesses: []
        },
        signingLocation: 'Online',
        autoMatch: 'true',
        autoMatchSpecifiedByUser: 'false',
        created: '2021-04-29T14:55:38.1200000Z',
        description: `Sample template generated from ${name}`,
        documents: [
            {
                display: 'inline',
                documentBase64: pdfBase64,
                documentId: '1',
                includeInDownload: 'true',
                name: `${name}.pdf`,
                order: '1',
                pages: pageCount,
                signerMustAcknowledge: 'no_interaction',
                templateLocked: 'false',
                templateRequired: 'false',
            }
        ],
        folderName: 'Templates',
        lastModified: '2021-04-29T15:25:20.4400000Z',
        lastUsed: '2021-04-29T15:01:21.1300000Z',
        name,
        pageCount,
        passwordProtected: 'false',
        shared: 'false',
    };
};

module.exports = createTemplate;
