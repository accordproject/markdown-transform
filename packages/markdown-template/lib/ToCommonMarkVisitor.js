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
class ToCommonMarkVisitor {
    /**
     * Construct the visitor
     */
    constructor() {
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

            ToCommonMarkVisitor.visitChildren(this, thing, parameters);
            // Revert to CodeBlock
            jsonTarget.$class = NS_PREFIX_CommonMarkModel + 'CodeBlock';

            // Get the content
            const clauseJson = parameters.serializer.toJSON(thing);
            jsonSource.$class = NS_PREFIX_CommonMarkModel + 'Document';
            jsonSource.xmlns = 'http://commonmark.org/xml/1.0';
            jsonSource.nodes = clauseJson.nodes;

            const content = parameters.commonMark.toMarkdown(jsonSource);
            const attributeString = `src="${clauseJson.src}" name="${clauseJson.name}"`;

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
            attribute1.value = clauseJson.src ? clauseJson.src : '';
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'name';
            attribute2.value = clauseJson.name;
            tag.attributes.push(attribute2);

            jsonTarget.tag = tag;

            let validatedTarget = parameters.serializer.fromJSON(jsonTarget);

            delete thing.elementType;
            delete thing.name;
            delete thing.src;

            thing.$classDeclaration = validatedTarget.$classDeclaration;
            thing.tag = validatedTarget.tag;
            thing.nodes = validatedTarget.nodes;
            thing.text = validatedTarget.text;
            thing.info = `<clause ${attributeString}/>`;
        }
            break;
        case 'ListBlock': {
            let jsonSource = {};
            let jsonTarget = {};

            ToCommonMarkVisitor.visitChildren(this, thing, parameters);

            const ciceroMarkTag = NS_PREFIX_CommonMarkModel + 'List';
            thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);

            delete thing.name;
            delete thing.elementType;
        }
            break;
        case 'Variable':
        case 'EnumVariable':
        case 'FormattedVariable': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'Text');
            thing.text = decodeURIComponent(thing.value);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.format;
            delete thing.enumValues;
        }
            break;
        case 'Formula': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'Text');
            thing.text = decodeURIComponent(thing.value);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.format;
        }
            break;
        case 'Conditional': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'Text');
            thing.text = decodeURIComponent(thing.value);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.whenTrue;
            delete thing.whenFalse;
        }
            break;
        default:
            ToCommonMarkVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = ToCommonMarkVisitor;