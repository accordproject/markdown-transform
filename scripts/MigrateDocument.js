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

const ConcertoMetaModel = require('../packages/markdown-common/lib/externalModels/ConcertoMetaModel');
const TemplateMarkModel = require('../packages/markdown-common/lib/externalModels/TemplateMarkModel');
const CommonMarkModel = require('../packages/markdown-common/lib/externalModels/CommonMarkModel');
const CiceroMarkModel = require('../packages/markdown-common/lib/externalModels/CiceroMarkModel');

/**
 * An array of migration command: when a regex pattern is detected
 * it is migrated to the value of namespace
 */
const COMMANDS = [
    {
        pattern: /^(org\.accordproject\.templatemark@0.3.0)\.(\w+)$/,
        namespace: TemplateMarkModel.NAMESPACE
    },
    {
        pattern: /^(org\.accordproject\.commonmark)\.(\w+)$/,
        namespace: CommonMarkModel.NAMESPACE
    },
    {
        pattern: /^(concerto\.metamodel)\.(\w+)$/,
        namespace: ConcertoMetaModel.NAMESPACE
    },
    {
        pattern: /^(org\.accordproject\.ciceromark@0.5.0)\.(\w+)$/,
        namespace: CiceroMarkModel.NAMESPACE
    },
    {
        pattern: /^(org\.accordproject\.acceptanceofdelivery)\.(\w+)$/,
        namespace: 'org.accordproject.acceptanceofdelivery@1.0.0'
    },
    {
        pattern: /^(org\.accordproject\.organization)\.(\w+)$/,
        namespace: 'org.accordproject.organization@0.2.0'
    }
]

/**
 * Migrates a property, applying all commands
 * @param {*} thing the object being processed
 * @param {*} propertyName the name of the property
 */
function migrateProperty(thing, propertyName) {
    if (thing && typeof thing === 'object' && thing[propertyName] && typeof thing[propertyName] === 'string') {
        const nodeClass = thing[propertyName];
        COMMANDS.forEach( command => {
            const match = nodeClass.match(command.pattern);
            if (match && match.length > 1) {
                thing[propertyName] = `${command.namespace}.${match[2]}`;
            }
        })
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