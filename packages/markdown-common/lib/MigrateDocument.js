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

const traverse = require('traverse');

const ConcertoMetaModel = require('./externalModels/ConcertoMetaModel');
const TemplateMarkModel = require('./externalModels/TemplateMarkModel');
const CommonMarkModel = require('./externalModels/CommonMarkModel');
const CiceroMarkModel = require('./externalModels/CiceroMarkModel');

// used to migrate old template mark json to latest namespaces
const TEMPLATEMARK_OLD_RE = /^(org\.accordproject\.templatemark@0.2.0)\.(\w+)$/;
const COMMONMARK_OLD_RE = /^(org\.accordproject\.commonmark)\.(\w+)$/;
const CONCERTOMETAMODEL_OLD_RE = /^(concerto\.metamodel)\.(\w+)$/;
const CICEROMARK_OLD_RE = /^(org\.accordproject\.ciceromark@0.4.0)\.(\w+)$/;

const AOD_OLD_RE = /^(org\.accordproject\.acceptanceofdelivery)\.(\w+)$/;
const NEW_AOD_NS = 'org.accordproject.acceptanceofdelivery@1.0.0';

const ORG_OLD_RE = /^(org\.accordproject\.organization)\.(\w+)$/;
const NEW_ORG_NS = 'org.accordproject.organization@0.2.0';

/**
 * Migrates a property
 * @param {*} thing the object being processed
 * @param {*} propertyName the name of the property
 */
function migrateProperty(thing, propertyName) {
    if (thing && typeof thing === 'object' && thing[propertyName] && typeof thing[propertyName] === 'string') {
        const nodeClass = thing[propertyName];
        {
            const match = nodeClass.match(TEMPLATEMARK_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${TemplateMarkModel.NAMESPACE}.${match[2]}`;
            }
        }
        {
            const match = nodeClass.match(COMMONMARK_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${CommonMarkModel.NAMESPACE}.${match[2]}`;
            }
        }
        {
            const match = nodeClass.match(CONCERTOMETAMODEL_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${ConcertoMetaModel.NAMESPACE}.${match[2]}`;
            }
        }
        {
            const match = nodeClass.match(CICEROMARK_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${CiceroMarkModel.NAMESPACE}.${match[2]}`;
            }
        }
        {
            const match = nodeClass.match(AOD_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${NEW_AOD_NS}.${match[2]}`;
            }
        }
        {
            const match = nodeClass.match(ORG_OLD_RE);
            if (match && match.length > 1) {
                thing[propertyName] = `${NEW_ORG_NS}.${match[2]}`;
            }
        }
    }
}
/**
 * Migrates a JSON document without namespace versions to the latest
 * version of the namespaces
 * to a document with namespace versions.
 * @param {*} document - the TemplateMark JSON document
 * @returns {*} the TemplateMark JSON with namespace versions
 */
function migrateDocument(document) {
    return traverse(document).map(function (x) {
        migrateProperty(x, '$class');
        migrateProperty(x, 'elementType');
        this.update(x);
    });
}

module.exports = migrateDocument;