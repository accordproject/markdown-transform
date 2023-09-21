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

const fs = require('fs');
const { argv } = require('process');

const migrateDocument = require('./MigrateDocument');

const IGNORE_FILES = /.*(symbols\.json|names\.json|lerna\.json|package\.json|package-lock\.json|jsdoc\.json)$/

if(IGNORE_FILES.test(argv[2])) {
    console.log(`   Ignored ${argv[2]}`);
}
else {
    const old = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
    const result = migrateDocument(old);
    
    fs.writeFileSync(argv[2], JSON.stringify(result, null, 2));
    console.log(`Migrated ${argv[2]}`)
}
