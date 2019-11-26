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

/**
 * Converts a CiceroMark DOM to a CommonMark DOM
 */
class FromCiceroVisitor {
    /**
     * Construct the visitor
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options ? options : { wrapVariables: true };
    }

    /**
     * Visits a sub-tree and return the CommonMark DOM
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
        const thingType = thing.getType();
        switch(thingType) {
        case 'Clause': {
            let jsonSource = {};
            let jsonTarget = {};

            FromCiceroVisitor.visitChildren(this, thing, parameters);
            // Revert to CodeBlock
            jsonTarget.$class = NS_PREFIX_CommonMarkModel + 'CodeBlock';

            // Get the content
            const clauseJson = parameters.serializer.toJSON(thing);
            jsonSource.$class = NS_PREFIX_CommonMarkModel + 'Document';
            jsonSource.xmlns = 'http://commonmark.org/xml/1.0';
            jsonSource.nodes = clauseJson.nodes;

            const content = parameters.commonMark.toMarkdown(jsonSource);
            const attributeString = `src="${clauseJson.src}" clauseid="${clauseJson.clauseid}"`;

            jsonTarget.text = content + '\n';

            // Create the proper tag
            let tag = {};
            tag.$class = NS_PREFIX_CommonMarkModel + 'TagInfo';
            tag.tagName = 'clause';
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = false;
            tag.attributes = [];

            let attribute1 = {};
            attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute1.name = 'src';
            attribute1.value = clauseJson.src;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'clauseid';
            attribute2.value = clauseJson.clauseid;
            tag.attributes.push(attribute2);

            jsonTarget.tag = tag;

            let validatedTarget = parameters.serializer.fromJSON(jsonTarget);

            delete thing.clauseid;
            delete thing.src;

            thing.$classDeclaration = validatedTarget.$classDeclaration;
            thing.tag = validatedTarget.tag;
            thing.nodes = validatedTarget.nodes;
            thing.text = validatedTarget.text;
            thing.info = `<clause ${attributeString}/>`;
        }
            break;
        case 'Variable':
        case 'IfVariable':
        case 'ComputedVariable': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'HtmlInline');

            // Create the text for that document
            const content = '';
            const attributeString =
                  thingType === 'ComputedVariable'
                      ? `value="${encodeURIComponent(thing.value)}"`
                      : `id="${thing.id}" value="${encodeURIComponent(thing.value)}"`
            ;
            const tagName =
                  thingType === 'ComputedVariable'
                      ? 'computed'
                      : thingType === 'IfVariable' ? 'if' : 'variable';
            if (this.options && !this.options.wrapVariables) {
                thing.text = thingType === 'ComputedVariable' ? `{{${thing.value}}}` : thing.value;
            } else {
                thing.text = `<${tagName} ${attributeString}/>`;
            }

            // Create the proper tag
            let tag = {};
            tag.$class = NS_PREFIX_CommonMarkModel + 'TagInfo';
            tag.tagName = tagName;
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = true;
            tag.attributes = [];

            if (thingType !== 'ComputedVariable') {
                let attribute1 = {};
                attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
                attribute1.name = 'id';
                attribute1.value = thing.id;
                tag.attributes.push(attribute1);
            }

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'value';
            attribute2.value = thing.value;
            tag.attributes.push(attribute2);

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.id;
            delete thing.value;
        }
            break;
        default:
            FromCiceroVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = FromCiceroVisitor;