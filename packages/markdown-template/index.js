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
 * @module markdown-template
 */

module.exports.TemplateMarkModel = require('./lib/externalModels/TemplateMarkModel');

module.exports.util = require('./lib/util');
module.exports.templatemarkutil = require('./lib/templatemarkutil');
module.exports.datetimeutil = require('./lib/datetimeutil');
module.exports.normalizeNLs = require('./lib/normalize').normalizeNLs;
module.exports.ParserManager = require('./lib/parsermanager');
module.exports.TemplateException = require('./lib/templateexception');
module.exports.TemplateMarkTransformer = require('./lib/TemplateMarkTransformer');
