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

const { COMMON_NS_PREFIX } = require('@accordproject/markdown-common').Models;

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
        switch(thing.getType()) {
        case 'Clause': {
            let jsonSource = {};
            let jsonTarget = {};

            FromCiceroVisitor.visitChildren(this, thing, parameters);
            // Revert to CodeBlock
            jsonTarget.$class = COMMON_NS_PREFIX + 'CodeBlock';

            // Get the content
            const clauseJson = parameters.serializer.toJSON(thing);
            jsonSource.$class = COMMON_NS_PREFIX + 'Document';
            jsonSource.xmlns = 'http://commonmark.org/xml/1.0';
            jsonSource.nodes = clauseJson.nodes;

            const content = parameters.commonMark.toMarkdown(jsonSource);
            const attributeString = `src="${clauseJson.src}" clauseid="${clauseJson.clauseid}"`;

            jsonTarget.text = content + '\n';

            // Create the proper tag
            let tag = {};
            tag.$class = COMMON_NS_PREFIX + 'TagInfo';
            tag.tagName = 'clause';
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = false;
            tag.attributes = [];

            let attribute1 = {};
            attribute1.$class = COMMON_NS_PREFIX + 'Attribute';
            attribute1.name = 'src';
            attribute1.value = clauseJson.src;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = COMMON_NS_PREFIX + 'Attribute';
            attribute2.name = 'clauseid';
            attribute2.value = clauseJson.clauseid;
            tag.attributes.push(attribute2);

            jsonTarget.tag = tag;

            let validatedTarget = parameters.serializer.fromJSON(jsonTarget);

            delete thing.clauseid;
            delete thing.src;
            delete thing.clauseText;

            thing.$classDeclaration = validatedTarget.$classDeclaration;
            thing.tag = validatedTarget.tag;
            thing.nodes = validatedTarget.nodes;
            thing.text = validatedTarget.text;
            thing.info = `<clause ${attributeString}/>`;
        }
            break;
        case 'Variable': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(COMMON_NS_PREFIX + 'HtmlInline');

            // Create the text for that document
            const content = '';
            const attributeString = `id="${thing.id}" value="${thing.value}"`;
            if (this.options && !this.options.wrapVariables) {
                thing.text = decodeURI(thing.value); // to decode
            } else {
                thing.text = `<variable ${attributeString}/>`;
            }

            // Create the proper tag
            let tag = {};
            tag.$class = COMMON_NS_PREFIX + 'TagInfo';
            tag.tagName = 'variable';
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = true;
            tag.attributes = [];

            let attribute1 = {};
            attribute1.$class = COMMON_NS_PREFIX + 'Attribute';
            attribute1.name = 'id';
            attribute1.value = thing.id;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = COMMON_NS_PREFIX + 'Attribute';
            attribute2.name = 'value';
            attribute2.value = thing.value;
            tag.attributes.push(attribute2);

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.id;
            delete thing.value;
        }
            break;
        case 'ComputedVariable': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(COMMON_NS_PREFIX + 'HtmlInline');

            // Create the text for that document
            const content = '';
            const attributeString = `value="${thing.value}"`;
            if (this.options && !this.options.wrapVariables) {
                thing.text = decodeURI(thing.value); // to decode
            } else {
                thing.text = `<computed ${attributeString}/>`;
            }

            // Create the proper tag
            let tag = {};
            tag.$class = COMMON_NS_PREFIX + 'TagInfo';
            tag.tagName = 'computed';
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = true;
            tag.attributes = [];

            let attribute1 = {};
            attribute1.$class = COMMON_NS_PREFIX + 'Attribute';
            attribute1.name = 'value';
            attribute1.value = thing.value;
            tag.attributes.push(attribute1);

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.value;
        }
            break;
        default:
            FromCiceroVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = FromCiceroVisitor;