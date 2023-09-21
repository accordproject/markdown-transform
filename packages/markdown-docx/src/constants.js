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

const {CommonMarkModel,CiceroMarkModel} = require('@accordproject/markdown-common');

const TRANSFORMED_NODES = {
    code: `${CommonMarkModel.NAMESPACE}.Code`,
    codeBlock: `${CommonMarkModel.NAMESPACE}.CodeBlock`,
    computedVariable: `${CiceroMarkModel.NAMESPACE}.ComputedVariable`,
    conditional: `${CiceroMarkModel.NAMESPACE}.Conditional`,
    optional: `${CiceroMarkModel.NAMESPACE}.Optional`,
    document: `${CommonMarkModel.NAMESPACE}.Document`,
    emphasize: `${CommonMarkModel.NAMESPACE}.Emph`,
    formula: `${CiceroMarkModel.NAMESPACE}.Formula`,
    heading: `${CommonMarkModel.NAMESPACE}.Heading`,
    item: `${CommonMarkModel.NAMESPACE}.Item`,
    link: `${CommonMarkModel.NAMESPACE}.Link`,
    paragraph: `${CommonMarkModel.NAMESPACE}.Paragraph`,
    softbreak: `${CommonMarkModel.NAMESPACE}.Softbreak`,
    strong: `${CommonMarkModel.NAMESPACE}.Strong`,
    text: `${CommonMarkModel.NAMESPACE}.Text`,
    thematicBreak: `${CommonMarkModel.NAMESPACE}.ThematicBreak`,
    variable: `${CiceroMarkModel.NAMESPACE}.Variable`,
    clause: `${CiceroMarkModel.NAMESPACE}.Clause`,
};

// Two relationships for numbering and style are already present
// and since we need to accommodate for link styles as well, we need a unique ID
// to represent them. Hence, 2 is added to offset the enumeration of `rId`.
// Used in './ToOOXMLVisitor/index.js'
const RELATIONSHIP_OFFSET = 2;

// Used to separate entities in w:tag and w:alias
// example <w:tag w:val="org.accordproject.ciceromark@0.6.0.Variable | shipper"/>
// Then use the separator to extract those entities while transforming
// from ooxml to ciceromark.
const SEPARATOR = ' | ';

module.exports = { TRANSFORMED_NODES, RELATIONSHIP_OFFSET, SEPARATOR };
