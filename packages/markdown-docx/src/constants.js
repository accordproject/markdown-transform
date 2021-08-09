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

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;

const TRANSFORMED_NODES = {
    code: `${NS_PREFIX_CommonMarkModel}Code`,
    codeBlock: `${NS_PREFIX_CommonMarkModel}CodeBlock`,
    computedVariable: `${NS_PREFIX_CiceroMarkModel}ComputedVariable`,
    document: `${NS_PREFIX_CommonMarkModel}Document`,
    emphasize: `${NS_PREFIX_CommonMarkModel}Emph`,
    heading: `${NS_PREFIX_CommonMarkModel}Heading`,
    item: `${NS_PREFIX_CommonMarkModel}Item`,
    link: `${NS_PREFIX_CommonMarkModel}Link`,
    paragraph: `${NS_PREFIX_CommonMarkModel}Paragraph`,
    softbreak: `${NS_PREFIX_CommonMarkModel}Softbreak`,
    strong: `${NS_PREFIX_CommonMarkModel}Strong`,
    text: `${NS_PREFIX_CommonMarkModel}Text`,
    thematicBreak: `${NS_PREFIX_CommonMarkModel}ThematicBreak`,
    variable: `${NS_PREFIX_CiceroMarkModel}Variable`,
    clause: `${NS_PREFIX_CiceroMarkModel}Clause`,
};

// Two relationships for numbering and style are already present
// and since we need to accommodate for link styles as well, we need a unique ID
// to represent them. Hence, 2 is added to offset the enumeration of `rId`.
// Used in './ToOOXMLVisitor/index.js'
const RELATIONSHIP_OFFSET = 2;

module.exports = { TRANSFORMED_NODES, RELATIONSHIP_OFFSET };
