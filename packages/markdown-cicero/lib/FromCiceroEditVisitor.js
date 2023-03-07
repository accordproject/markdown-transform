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

const { CiceroMarkModel, CommonMarkModel } = require('@accordproject/markdown-common');

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class FromCiceroEditVisitor {
    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            FromCiceroEditVisitor.visitNodes(visitor, thing.nodes, parameters);
        }
    }

    /**
     * Visits a list of nodes and return the CiceroMark DOM
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
        case 'CodeBlock': {
            const tag = thing.tag;
            if (tag && tag.tagName === 'clause' && tag.attributes.length === 2) {
                const ciceroMarkTag = `${CiceroMarkModel.NAMESPACE}.Clause`;
                // Remove last new line, needed by CommonMark parser to identify ending code block (\n```)
                const clauseText = thing.text;

                //console.log('CONTENT! : ' + tag.content);
                if (FromCiceroEditVisitor.getAttribute(tag.attributes, 'src') &&
                    FromCiceroEditVisitor.getAttribute(tag.attributes, 'clauseid')) {
                    thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
                    thing.src = FromCiceroEditVisitor.getAttribute(tag.attributes, 'src').value;
                    thing.name = FromCiceroEditVisitor.getAttribute(tag.attributes, 'clauseid').value;

                    const commonMark = parameters.commonMark.fromMarkdown(clauseText);
                    thing.nodes = parameters.serializer.fromJSON(commonMark).nodes;
                    FromCiceroEditVisitor.visitNodes(this, thing.nodes, parameters);

                    thing.text = null; // Remove text
                    delete thing.tag;
                    delete thing.info;
                }
            } else if (tag && tag.tagName === 'list' && tag.attributes.length === 0) {
                const ciceroMarkTag = `${CiceroMarkModel.NAMESPACE}.ListBlock`;
                // Remove last new line, needed by CommonMark parser to identify ending code block (\n```)
                const listText = thing.text;

                const commonMark = parameters.commonMark.fromMarkdown(listText);
                const newNodes = parameters.serializer.fromJSON(commonMark).nodes;
                if (newNodes.length === 1 && newNodes[0].getType() === 'List') {
                    const listNode = newNodes[0];
                    thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
                    thing.name = ''; // XXX Hack -- since there is no name in CiceroEdit -- will be filled in later
                    thing.type = listNode.type;
                    thing.start = listNode.start;
                    thing.tight = listNode.tight;
                    thing.delimiter = listNode.delimiter;
                    thing.nodes = listNode.nodes;
                    FromCiceroEditVisitor.visitNodes(this, thing.nodes, parameters);

                    thing.text = null; // Remove text
                    delete thing.tag;
                    delete thing.info;
                }
            }
        }
            break;
        //case 'HtmlBlock':
        case 'HtmlInline': {
            if (thing.tag &&
                thing.tag.tagName === 'variable' &&
                (thing.tag.attributes.length === 2 || thing.tag.attributes.length === 3)) {
                const tag = thing.tag;
                if (FromCiceroEditVisitor.getAttribute(tag.attributes, 'id') &&
                    FromCiceroEditVisitor.getAttribute(tag.attributes, 'value')) {
                    const format = FromCiceroEditVisitor.getAttribute(tag.attributes, 'format');
                    const ciceroMarkTag = format ? `${CiceroMarkModel.NAMESPACE}.FormattedVariable` : `${CiceroMarkModel.NAMESPACE}.Variable`;
                    thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
                    thing.name = FromCiceroEditVisitor.getAttribute(tag.attributes, 'id').value;
                    thing.value = decodeURIComponent(FromCiceroEditVisitor.getAttribute(tag.attributes, 'value').value);
                    if (format) { // For FormattedVariables
                        thing.format = decodeURIComponent(format.value);
                    }
                    delete thing.tag;
                    delete thing.text;
                }
            }
            if (thing.tag &&
                thing.tag.tagName === 'if' &&
                thing.tag.attributes.length === 4) {
                const tag = thing.tag;
                if (FromCiceroEditVisitor.getAttribute(tag.attributes, 'id') &&
                    FromCiceroEditVisitor.getAttribute(tag.attributes, 'value') &&
                    FromCiceroEditVisitor.getAttribute(tag.attributes, 'whenTrue') &&
                    FromCiceroEditVisitor.getAttribute(tag.attributes, 'whenFalse')) {
                    const ciceroMarkTag = `${CiceroMarkModel.NAMESPACE}.Conditional`;
                    thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
                    thing.name = FromCiceroEditVisitor.getAttribute(tag.attributes, 'id').value;
                    const valueText = decodeURIComponent(FromCiceroEditVisitor.getAttribute(tag.attributes, 'value').value);
                    const valueNode = parameters.serializer.fromJSON({
                        $class: `${CommonMarkModel.NAMESPACE}.Text`,
                        text: valueText,
                    });
                    thing.nodes = [valueNode];
                    const whenTrueText = decodeURIComponent(FromCiceroEditVisitor.getAttribute(tag.attributes, 'whenTrue').value);
                    const whenTrueNodes = whenTrueText ? [parameters.serializer.fromJSON({
                        $class: `${CommonMarkModel.NAMESPACE}.Text`,
                        text: whenTrueText,
                    })] : [];
                    thing.isTrue = valueText === whenTrueText;
                    thing.whenTrue = whenTrueNodes;
                    const whenFalseText = decodeURIComponent(FromCiceroEditVisitor.getAttribute(tag.attributes, 'whenFalse').value);
                    const whenFalseNodes = whenFalseText ? [parameters.serializer.fromJSON({
                        $class: `${CommonMarkModel.NAMESPACE}.Text`,
                        text: whenFalseText,
                    })] : [];
                    thing.whenFalse = whenFalseNodes;
                    delete thing.tag;
                    delete thing.text;
                }
            }
            if (thing.tag && thing.tag.tagName === 'computed' && thing.tag.attributes.length === 1) {
                const tag = thing.tag;
                const ciceroMarkTag = `${CiceroMarkModel.NAMESPACE}.Formula`;
                if (FromCiceroEditVisitor.getAttribute(tag.attributes, 'value')) {
                    thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
                    thing.name = ''; // XXX Hack -- since there is no name in CiceroEdit -- will be filled in later
                    thing.value = decodeURIComponent(FromCiceroEditVisitor.getAttribute(tag.attributes, 'value').value);
                    delete thing.tag;
                    delete thing.text;
                }
            }
        }
            break;
        default:
            FromCiceroEditVisitor.visitChildren(this, thing, parameters);
        }
    }

    /**
     * Find an attribute from its name
     * @param {*} attributes - the array of attributes
     * @param {string} name - the name of the attributes
     * @return {*} the attribute or undefined
     */
    static getAttribute(attributes, name) {
        const atts = attributes.filter(x => x.name === name);
        return atts.length === 0 ? null : atts[0];
    }

}

module.exports = FromCiceroEditVisitor;