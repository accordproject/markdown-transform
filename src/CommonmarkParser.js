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

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonmarkParser {

    /**
     * Construct the parser.
     * @param {*} [options] configuration options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Parses a markdown string into a Concerto DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    parse(markdown) {
        let parseResult = '';
        let inTag = false;

        const that = this;
        const parser = sax.parser(true);

        parser.onerror = function (e) {
            throw e;
        };

        parser.ontext = function (t) {

            if(that.options && that.options.trimText) {
                t = t.trim();
            }

            if(t.length > 0) {
                if(inTag) {
                    if(parseResult.endsWith('}')) {
                        parseResult += ',';
                    }

                    parseResult += `{
                            "$class" : "${CommonmarkParser.toClass('text')}",
                            "text" : ${JSON.stringify(t)}
                        }`;
                }
            }
        };
        parser.onopentag = function (node) {
            if(node.name !== 'text') {
                console.log(`onopentag: ${node.name}`);
                if(parseResult.endsWith('}')) {
                    parseResult += ',';
                }

                // hoist the attributes into the parent object
                let attributes = ',\n';
                Object.keys(node.attributes).forEach(key => {
                    attributes += `"${key}" : ${JSON.stringify(node.attributes[key])},\n`;
                });

                parseResult += `{
                    "$class" : "${CommonmarkParser.toClass(node.name)}"
                    ${attributes}
                    "nodes" : [\n
                `;
                inTag = true;
            }
        };
        parser.onclosetag = function (name) {
            if(name !== 'text') {
                parseResult += `
            ]
            }`;
                inTag = false;
            }
        };
        parser.onend = function () {
            inTag = false;
        };

        const reader = new commonmark.Parser();
        const writer = new commonmark.XmlRenderer();
        const parsed = reader.parse(markdown);
        const xml = writer.render(parsed);
        console.log('====== XML =======');
        console.log(xml);
        parser.write(xml).close();
        // console.log('====== TEXT =======');
        // console.log(parseResult);
        const json = JSON.parse(parseResult);
        console.log('====== JSON =======');
        console.log(JSON.stringify(json, null, 4));

        // validate the object using the model
        const modelManager = new ModelManager();
        modelManager.addModelFile( modelFile, 'commonmark.cto');
        const factory = new Factory(modelManager);
        const serializer = new Serializer(factory, modelManager);
        const concertoObject = serializer.fromJSON(json);
        return serializer.toJSON(concertoObject);
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
    o Node[] nodes optional
}

concept Text extends Node {
    o String text
}

concept CodeBlock extends Node {
    o String info optional
}

concept Code extends Node {
    o String info optional
}

concept HtmlInline extends Node {
}

concept HtmlBlock extends Node {
}

concept Emph extends Node {
}

concept Strong extends Node {
}

concept BlockQuote extends Node {
}

concept Heading extends Node {
    o String level
}

concept ThematicBreak extends Node {
}

concept Link extends Node {
    o String destination
    o String title
}

concept Paragraph extends Node {
}

concept List extends Node {
    o String type
    o String start optional
    o String tight
    o String delimiter optional
}

concept Item extends Node {
}

concept Document {
    o String xmlns
    o Node[] nodes
}
`;

module.exports = CommonmarkParser;