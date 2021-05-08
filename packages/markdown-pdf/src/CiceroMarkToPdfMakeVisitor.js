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

const ToPdfMakeVisitor = require('./ToPdfMakeVisitor');
const ciceromarkrules = require('./ciceromarkrules');

/**
 * Converts a CiceroMark DOM to a PDF Make JSON.
 * http://pdfmake.org/playground.html
 */
class CiceroMarkToPdfMakeVisitor extends ToPdfMakeVisitor {

    /**
     * Construct the visitor
     * @param {object} rules how to process each node type
     */
    constructor() {
        super();
        this.rules = Object.assign(this.rules, ciceromarkrules);
    }
}

module.exports = CiceroMarkToPdfMakeVisitor;