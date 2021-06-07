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
 * Transforms the ciceromark to OOXML
 */
class CiceroMarkToOOXMLTransfomer {

    definedNodes = {
        computedVariable: 'org.accordproject.ciceromark.ComputedVariable',
        heading: 'org.accordproject.commonmark.Heading',
        item: 'org.accordproject.commonmark.Item',
        list: 'org.accordproject.commonmark.List',
        listBlock: 'org.accordproject.ciceromark.ListBlock',
        paragraph: 'org.accordproject.commonmark.Paragraph',
        softbreak: 'org.accordproject.commonmark.Softbreak',
        text: 'org.accordproject.commonmark.Text',
        variable: 'org.accordproject.ciceromark.Variable',
        emphasize: 'org.accordproject.commonmark.Emph',
    };

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @param {Object} counter    Counter for different variables based on node name
     * @param {string} ooxml      Initial OOXML string
     * @returns {string} Converted OOXML string i.e. CicecoMark->OOXML
     */
    toOOXML(ciceromark, counter, ooxml) {
        let globalOOXML = ooxml;
        return globalOOXML;
    }
}

module.exports = CiceroMarkToOOXMLTransfomer;