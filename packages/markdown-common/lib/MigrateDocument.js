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
const TEMPLATEMARK_OLD_RE = /^(org\.accordproject\.templatemark)\.(\w+)$/;
const COMMONMARK_OLD_RE = /^(org\.accordproject\.commonmark)\.(\w+)$/;
const CONCERTOMETAMODEL_OLD_RE = /^(concerto\.metamodel)\.(\w+)$/;
const CICEROMARK_OLD_RE = /^(org\.accordproject\.ciceromark)\.(\w+)$/;

// const CONCERTOMETAMODEL_BAD_RE = /^(concerto\.metamodel@1.0.0)\.\.(\w+)$/;

/**
 * Migrates a JSON document without namespace versions to the latest
 * version of the namespaces
 * to a document with namespace versions.
 * @param {*} document - the TemplateMark JSON document
 * @returns {*} the TemplateMark JSON with namespace versions
 */
function migrateDocument(document) {
    return traverse(document).map(function (x) {
        if (x && typeof x === 'object' && x.$class && typeof x.$class === 'string') {
            const nodeClass = x.$class;
            {
                const match = nodeClass.match(TEMPLATEMARK_OLD_RE);
                if (match && match.length > 1) {
                    x.$class = `${TemplateMarkModel.NAMESPACE}.${match[2]}`;
                }
            }
            {
                const match = nodeClass.match(COMMONMARK_OLD_RE);
                if (match && match.length > 1) {
                    x.$class = `${CommonMarkModel.NAMESPACE}.${match[2]}`;
                }
            }
            {
                const match = nodeClass.match(CONCERTOMETAMODEL_OLD_RE);
                if (match && match.length > 1) {
                    x.$class = `${ConcertoMetaModel.NAMESPACE}.${match[2]}`;
                }
            }
            {
                const match = nodeClass.match(CICEROMARK_OLD_RE);
                if (match && match.length > 1) {
                    x.$class = `${CiceroMarkModel.NAMESPACE}.${match[2]}`;
                }
            }
            // {
            //     const match = nodeClass.match(CONCERTOMETAMODEL_BAD_RE);
            //     if (match && match.length > 1) {
            //         x.$class = `${ConcertoMetaModel.NAMESPACE}.${match[2]}`;
            //     }
            // }
        }
        this.update(x);
    });
}

module.exports = migrateDocument;