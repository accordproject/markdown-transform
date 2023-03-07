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

/**
 * Export the framework and plugins
 * @module markdown-common
 */

module.exports.Stack = require('./lib/Stack');

// models
module.exports.CommonMarkModel = require('./lib/externalModels/CommonMarkModel');
module.exports.CiceroMarkModel = require('./lib/externalModels/CiceroMarkModel');
module.exports.ConcertoMetaModel = require('./lib/externalModels/ConcertoMetaModel');
module.exports.TemplateMarkModel = require('./lib/externalModels/TemplateMarkModel');

module.exports.CommonMarkUtils = require('./lib/CommonMarkUtils');
module.exports.FromCommonMarkVisitor = require('./lib/FromCommonMarkVisitor');
module.exports.fromcommonmarkrules = require('./lib/fromcommonmarkrules');

module.exports.CommonMarkTransformer = require('./lib/CommonMarkTransformer');
module.exports.ToMarkdownVisitor = require('./lib/ToMarkdownVisitor');
module.exports.FromMarkdownIt =  require('./lib/FromMarkdownIt');

module.exports.migrateDocument = require('./lib/MigrateDocument');