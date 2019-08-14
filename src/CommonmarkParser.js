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

const commonmark = require('commonmark');
const sax = require('sax');
const NS_PREFIX = 'org.accordproject.commonmark.';
const ModelManager = require('composer-concerto').ModelManager;
const Factory = require('composer-concerto').Factory;
const Serializer = require('composer-concerto').Serializer;
const Stack = require('./Stack');
/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonmarkParser {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     * @param {boolean} [options.trimText] trims all text nodes
     * @param {boolean} [options.disableValidation] returns unvalidated JSON, rather than a Concerto model
     */
    constructor(options) {
        this.options = options;
        const modelManager = new ModelManager();
        modelManager.addModelFile( modelFile, 'commonmark.cto');
        const factory = new Factory(modelManager);
        this.serializer = new Serializer(factory, modelManager);
    }

    /**
     * Parses a markdown string into a Concerto DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    parse(markdown) {
        let stack = new Stack();
        const that = this;
        const parser = sax.parser(true, {position: true});

        parser.onerror = function (e) {
            throw e;
        };

        parser.ontext = function (t) {

            if(that.options && that.options.trimText) {
                t = t.trim();
            }

            const head = stack.peek();
            if(t.length > 0 && head) {
                stack.peek().text = t;
            }
        };
        parser.onopentag = function (node) {
            const newNode = {};
            newNode.$class = CommonmarkParser.toClass(node.name);
            newNode.line = parser.line;
            newNode.column = parser.column;
            newNode.position = parser.position;
            newNode.startTagPosition = parser.startTagPosition;

            // hoist the attributes into the parent object
            Object.keys(node.attributes).forEach(key => {
                newNode[key] = node.attributes[key];
            });
            const head = stack.peek();

            if(head) {
                if(!head.nodes) {
                    head.nodes = [];
                }
                stack.push(newNode);
            }
            else {
                stack.push(newNode, false);
            }
        };
        parser.onclosetag = function (name) {
            // ensure the document node is left on the stack
            // so that we can retrieve it as the result
            if(name !== 'document') {
                stack.pop();
            }
        };

        const reader = new commonmark.Parser();
        const writer = new commonmark.XmlRenderer();
        const parsed = reader.parse(markdown);
        const xml = writer.render(parsed);
        // console.log('====== XML =======');
        // console.log(xml);
        parser.write(xml).close();
        // console.log('====== JSON =======');
        const json = stack.peek();
        // console.log(JSON.stringify(json, null, 4));

        if(this.options && this.options.disableValidation) {
            return json;
        }

        // validate the object using the model
        const concertoObject = this.serializer.fromJSON(json);
        return concertoObject;
    }

    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer() {
        return this.serializer;
    }

    /**
     *
     * @param {string} string the string to capitalize
     * @returns {string} the string capitalized
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     *
     * @param {string} name the name of the commonmark type
     * @returns {string} the concerto type name
     */
    static toClass(name) {
        const camelCased = name.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
        return NS_PREFIX + CommonmarkParser.capitalizeFirstLetter(camelCased);
    }
}

const modelFile = `
namespace org.accordproject.commonmark

/**
 * A model for a commonmark format markdown file
 */

abstract concept Node {
    o String text optional
    o Node[] nodes optional
    o Integer line optional
    o Integer column optional
    o Integer position optional
    o Integer startTagPosition optional
}

abstract concept Root extends Node {
}

abstract concept Child extends Node {
}

concept Text extends Child {
}

concept CodeBlock extends Child {
    o String info optional
}

concept Code extends Child {
    o String info optional
}

concept HtmlInline extends Child {
}

concept HtmlBlock extends Child {
}

concept Emph extends Child {
}

concept Strong extends Child {
}

concept BlockQuote extends Child {
}

concept Heading extends Child {
    o String level
}

concept ThematicBreak extends Child {
}

concept Link extends Child {
    o String destination
    o String title
}

concept Paragraph extends Child {
}

concept List extends Child {
    o String type
    o String start optional
    o String tight
    o String delimiter optional
}

concept Item extends Child {
}

concept Document extends Root {
    o String xmlns
}
`;

module.exports = CommonmarkParser;