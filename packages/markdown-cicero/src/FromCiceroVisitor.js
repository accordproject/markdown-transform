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

            FromCiceroVisitor.visitChildren(this, thing, parameters);
            // Revert to CodeBlock
            jsonTarget.$class = NS_PREFIX_CommonMarkModel + 'CodeBlock';

            // Get the content
            const ciceroMarkTag = NS_PREFIX_CommonMarkModel + 'List';
            const listName = thing.name;
            delete thing.name;

            thing.$classDeclaration = parameters.modelManager.getType(ciceroMarkTag);
            const listJson = parameters.serializer.toJSON(thing);
            jsonSource.$class = NS_PREFIX_CommonMarkModel + 'Document';
            jsonSource.xmlns = 'http://commonmark.org/xml/1.0';
            jsonSource.nodes = [listJson];

            const content = parameters.commonMark.toMarkdown(jsonSource);
            const attributeString = `name="${listName}"`;

            jsonTarget.text = content + '\n';

            // Create the proper tag
            let tag = {};
            tag.$class = NS_PREFIX_CommonMarkModel + 'TagInfo';
            tag.tagName = 'list';
            tag.attributeString = attributeString;
            tag.content = content;
            tag.closed = false;
            tag.attributes = [];

            let attribute1 = {};
            attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute1.name = 'name';
            attribute1.value = listName;
            tag.attributes.push(attribute1);

            jsonTarget.tag = tag;

            let validatedTarget = parameters.serializer.fromJSON(jsonTarget);

            delete thing.type;
            delete thing.elementType;
            delete thing.start;
            delete thing.tight;
            delete thing.delimiter;

            thing.$classDeclaration = validatedTarget.$classDeclaration;
            thing.tag = validatedTarget.tag;
            thing.nodes = validatedTarget.nodes;
            thing.text = validatedTarget.text;
            thing.info = `<list ${attributeString}/>`;
        }
            break;
        case 'Variable':
        case 'EnumVariable':
        case 'FormattedVariable': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'HtmlInline');

            // Create the text for that document
            const content = '';
            const format = thing.format ? encodeURIComponent(thing.format) : '';
            const formatString = thing.format ? ` format="${format}"` : '';
            const enumValues = thing.enumValues ? encodeURIComponent(JSON.stringify(thing.enumValues)) : '';
            const enumValuesString = thing.enumValues ? ` enumValues="${enumValues}"` : '';
            const attributeString = `name="${thing.name}" value="${encodeURIComponent(thing.value)}"${formatString}${enumValuesString}`;
            const tagName = 'variable';
            if (this.options && !this.options.wrapVariables) {
                thing.text = thing.value;
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

            let attribute1 = {};
            attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute1.name = 'name';
            attribute1.value = thing.name;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'value';
            attribute2.value = thing.value;
            tag.attributes.push(attribute2);

            if (thing.format) {
                let attribute3 = {};
                attribute3.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
                attribute3.name = 'format';
                attribute3.value = format;
                tag.attributes.push(attribute3);
            }

            if (thing.enumValues) {
                let attribute4 = {};
                attribute4.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
                attribute4.name = 'enumValues';
                attribute4.value = enumValues;
                tag.attributes.push(attribute4);
            }

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.format;
            delete thing.enumValues;
        }
            break;
        case 'Formula': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'HtmlInline');

            // Create the text for that document
            const content = '';
            const formatString = thing.format ? ` format="${encodeURIComponent(thing.format)}"` : '';
            const attributeString = `name="${thing.name}" value="${encodeURIComponent(thing.value)}"${formatString}`;
            const tagName = 'formula';
            if (this.options && !this.options.wrapVariables) {
                thing.text = `{{${thing.value}}}`;
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

            let attribute1 = {};
            attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute1.name = 'name';
            attribute1.value = thing.name;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'value';
            attribute2.value = thing.value;
            tag.attributes.push(attribute2);

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.code;
            delete thing.dependencies;
        }
            break;
        case 'Conditional': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'HtmlInline');

            const valueText = thing.nodes[0].text;
            const whenTrueText = thing.whenTrue[0] ? thing.whenTrue[0].text : '';
            const whenFalseText = thing.whenFalse[0] ? thing.whenFalse[0].text : '';

            // Create the text for that document
            const content = '';
            const attributeString =
                  `name="${thing.name}" value="${encodeURIComponent(valueText)}" whenTrue="${encodeURIComponent(whenTrueText)}" whenFalse="${encodeURIComponent(whenFalseText)}"`
            ;
            const tagName = 'if';
            if (this.options && !this.options.wrapVariables) {
                thing.text = valueText;
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

            let attribute1 = {};
            attribute1.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute1.name = 'name';
            attribute1.value = thing.name;
            tag.attributes.push(attribute1);

            let attribute2 = {};
            attribute2.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute2.name = 'value';
            attribute2.value = valueText;
            tag.attributes.push(attribute2);

            let attribute3 = {};
            attribute3.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute3.name = 'whenTrue';
            attribute3.value = whenTrueText;
            tag.attributes.push(attribute3);

            let attribute4 = {};
            attribute4.$class = NS_PREFIX_CommonMarkModel + 'Attribute';
            attribute4.name = 'whenFalse';
            attribute4.value = whenFalseText;
            tag.attributes.push(attribute4);

            thing.tag = parameters.serializer.fromJSON(tag);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.whenTrue;
            delete thing.whenFalse;
            delete thing.nodes;
        }
            break;
        default:
            FromCiceroVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = FromCiceroVisitor;