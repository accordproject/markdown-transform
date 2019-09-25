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

const { CICERO_NS_PREFIX } = require('./Models');
const { COMMON_NS_PREFIX } = require('@accordproject/markdown-common').Models;

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class ToCiceroMarkVisitor {

    /**
     * Visits a sub-tree and return the markdown
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            ToCiceroMarkVisitor.visitNodes(visitor, thing.nodes, parameters);
        }
    }

    /**
     * Visits a list of nodes and return the markdown
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor, things, parameters) {
        things.forEach(node => {
            node.accept(visitor, parameters);
        });
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        switch(thing.getType()) {
        case 'CodeBlock':
            if (thing.tag && thing.tag.tagName === 'clause' && thing.tag.attributes.length === 2) {
                const tag = thing.tag;
                //console.log('CONTENT! : ' + tag.content);
                if (tag.attributes[0].name === 'src' &&
                    tag.attributes[1].name === 'clauseid') {
                    thing.$classDeclaration = parameters.modelManager.getType(CICERO_NS_PREFIX + 'Clause');
                    thing.src = tag.attributes[0].value;
                    thing.clauseid = tag.attributes[1].value;

                    thing.nodes = parameters.commonMark.fromMarkdownStringConcerto(thing.text).nodes;
                    ToCiceroMarkVisitor.visitNodes(this, thing.nodes, parameters);

                    thing.text = null; // Remove text
                    thing.clauseText = '';
                    delete thing.tag;
                    delete thing.info;

                    // Go over the loaded clause to generate the unwrapped text
                    let clone = parameters.serializer.toJSON(thing);
                    clone.$class = COMMON_NS_PREFIX + 'Paragraph';
                    delete clone.clauseid;
                    delete clone.src;
                    delete clone.clauseText;
                    clone = parameters.serializer.fromJSON(clone);
                    thing.clauseText = parameters.ciceroMark.toMarkdownStringConcerto(clone, { wrapVariables: false });
                }
                else if (tag.attributes[1].name === 'src' &&
                         tag.attributes[0].name === 'clauseid') {
                    thing.$classDeclaration = parameters.commonMark.fromString.getType(CICERO_NS_PREFIX + 'Clause');
                    thing.clauseid = tag.attributes[0].value;
                    thing.src = tag.attributes[1].value;

                    thing.nodes = parameters.commonMark.fromMarkdownStringConcerto(thing.text).nodes;
                    ToCiceroMarkVisitor.visitNodes(this, thing.nodes, parameters);
                    thing.text = null; // Remove text
                    thing.clauseText = '';
                    delete thing.tag;
                    delete thing.info;

                    // Go over the loaded clause to generate the unwrapped text
                    let clone = parameters.serializer.toJSON(thing);
                    clone.$class = COMMON_NS_PREFIX + 'Paragraph';
                    delete clone.clauseid;
                    delete clone.src;
                    delete clone.clauseText;
                    clone = parameters.serializer.fromJSON(clone);
                    thing.clauseText = parameters.ciceroMark.toMarkdownStringConcerto(clone, { wrapVariables: false });
                } else {
                    //console.log('Found Clause but without \'clauseid\' and \'src\' attributes ');
                }
            }
            break;
        case 'HtmlInline':
        //case 'HtmlBlock':
            if (thing.tag && thing.tag.tagName === 'variable' && thing.tag.attributes.length === 2) {
                const tag = thing.tag;
                if (tag.attributes[0].name === 'id' &&
                    tag.attributes[1].name === 'value') {
                    thing.$classDeclaration = parameters.modelManager.getType(CICERO_NS_PREFIX + 'Variable');
                    thing.id = tag.attributes[0].value;
                    thing.value = tag.attributes[1].value;
                    delete thing.tag;
                }
                else if (tag.attributes[1].name === 'id' &&
                         tag.attributes[0].name === 'value') {
                    thing.$classDeclaration = parameters.modelManager.getType(CICERO_NS_PREFIX + 'Clause');
                    thing.value = tag.attributes[0].value;
                    thing.id  = tag.attributes[1].value;
                    delete thing.tag;
                } else {
                    //console.log('Found Variable but without \'id\' and \'value\' attributes ');
                }
            }
            if (thing.tag && thing.tag.tagName === 'computed' && thing.tag.attributes.length === 1) {
                const tag = thing.tag;
                if (tag.attributes[0].name === 'value') {
                    thing.$classDeclaration = parameters.modelManager.getType(CICERO_NS_PREFIX + 'ComputedVariable');
                    thing.value = tag.attributes[0].value;
                    delete thing.tag;
                }
                else {
                    //console.log('Found ComputedVariable but without \'value\' attributes ');
                }
            }
            break;
        default:
            ToCiceroMarkVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = ToCiceroMarkVisitor;