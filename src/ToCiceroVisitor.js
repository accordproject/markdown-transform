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

/**
 * Converts a commonmark model instance to a markdown string.
 *
 * Note that there are several ways of representing the same markdown AST as text,
 * so this transformation is not guaranteed to equivalent if you roundtrip
 * markdown content. The resulting AST *should* be equivalent however.
 */
class ToCiceroVisitor {

    /**
     * Visits a sub-tree and return the markdown
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            thing.nodes.forEach(node => {
                node.accept(visitor, parameters);
            });
        }
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
                    thing.nodes = parameters.parser.parse(tag.content).nodes; // Parse text as markdown (in the nodes for the root)
                    thing.text = null; // Remove text
                    delete thing.tag;
                }
                else if (tag.attributes[1].name === 'src' &&
                         tag.attributes[0].name === 'clauseid') {
                    thing.$classDeclaration = parameters.modelManager.getType(CICERO_NS_PREFIX + 'Clause');
                    thing.clauseid = tag.attributes[0].value;
                    thing.src = tag.attributes[1].value;
                    thing.nodes = parameters.parser.parse(tag.content).nodes; // Parse text as markdown (in the nodes for the root)
                    thing.text = null; // Remove text
                    delete thing.tag;
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
            ToCiceroVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = ToCiceroVisitor;