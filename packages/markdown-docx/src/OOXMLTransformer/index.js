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

const ToCiceroMarkVisitor = require('../ToCiceroMarkVisitor');
const ToOOXMLVisitor = require('../ToOOXMLVisitor');

/**
 * Transforms OOXML to/from CiceroMark
 */
class OOXMLTransformer {
    /**
     * Converts OOXML to CiceroMarkJSON
     *
     * @param {string} input OOXML string to be converted
     * @returns {object} CiceroMark JSON
     */
    toCiceroMark(input) {
        const visitor = new ToCiceroMarkVisitor();
        return visitor.toCiceroMark(input);
    }

    /**
     * Converts CiceroMark to OOXML
     *
     * @param {object} input CiceroMark object
     * @returns {string} OOXML string
     */
    toOOXML(input) {
        const visitor = new ToOOXMLVisitor();
        return visitor.toOOXML(input);
    }
}

module.exports = OOXMLTransformer;
