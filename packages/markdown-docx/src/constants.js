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

const DEFINED_NODES = {
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
    strong: 'org.accordproject.commonmark.Strong',
    code: 'org.accordproject.commonmark.Code',
};

module.exports = { DEFINED_NODES };
