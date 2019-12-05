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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const Stack = require('./Stack');
const ToMarkdownStringVisitor = require('./ToMarkdownStringVisitor');

const { DOMParser } = require('xmldom');
const { NS_PREFIX_CommonMarkModel, CommonMarkModel } = require('./externalModels/CommonMarkModel.js');

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonMarkTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     * @param {boolean} [options.trimText] trims all text nodes
     * @param {boolean} [options.enableSourceLocation] if true then location information is returned
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     * @param {boolean} [options.tagInfo] Construct tags for HTML elements
     */
    constructor(options) {
        this.options = options;
        const modelManager = new ModelManager();
        modelManager.addModelFile(CommonMarkModel, 'commonmark.cto');
        const factory = new Factory(modelManager);
        this.serializer = new Serializer(factory, modelManager);
    }

    /**
     * Is it a leaf node?
     * @param {*} json - the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isLeafNode(json) {
        return (json.$class === (NS_PREFIX_CommonMarkModel + 'Text') ||
                json.$class === (NS_PREFIX_CommonMarkModel + 'CodeBlock') ||
                json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') ||
                json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlBlock') ||
                json.$class === (NS_PREFIX_CommonMarkModel + 'Code'));
    }

    /**
     * Is it a HTML node? (html blocks or html inlines)
     * @param {*} json - the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isHtmlNode(json) {
        return (json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlInline') ||
                json.$class === (NS_PREFIX_CommonMarkModel + 'HtmlBlock'));
    }

    /**
     * Is it a Code Block node?
     * @param {*} json the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isCodeBlockNode(json) {
        return json.$class === (NS_PREFIX_CommonMarkModel + 'CodeBlock');
    }

    /**
     * Removing escapes
     * @param {string} input - escaped
     * @return {string} unescaped
     */
    static unescapeCodeBlock(input) {
        return input.replace(/\\`/g, '`');
    }

    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (in JSON or as a Concerto object)
     * @returns {string} the markdown string
     */
    toMarkdown(input) {
        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }
        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToMarkdownStringVisitor(this.options);
        input.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Converts *the children of the node* to a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (in JSON or as a Concerto object)
     * @returns {string} the markdown string
     */
    toMarkdownChildren(input) {
        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }
        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToMarkdownStringVisitor(this.options);
        const result = ToMarkdownStringVisitor.visitChildren(visitor,input,parameters);
        // console.log('RESULT!' + result.trim());
        return result.trim();
    }

    /**
     * Converts a markdown string into a Concerto DOM object.
     *
     * @param {string} markdown the string to parse
     * @param {string} [format] the format of the object to return. Defaults to 'concerto.
     * Pass 'json' to return the JSON object, skipping Concerto validation
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromMarkdown(markdown, format='concerto') {
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
                if (CommonMarkTransformer.isLeafNode(head)) {
                    head.text = CommonMarkTransformer.isCodeBlockNode(head) ? CommonMarkTransformer.unescapeCodeBlock(t) : t;
                }
                if (CommonMarkTransformer.isHtmlNode(head) || CommonMarkTransformer.isCodeBlockNode(head)) {
                    const maybeHtmlText = CommonMarkTransformer.isHtmlNode(head) ? head.text : head.info;
                    const tagInfo = that.options && that.options.tagInfo ? CommonMarkTransformer.parseHtmlBlock(maybeHtmlText) : null;
                    if (tagInfo) {
                        head.tag = {};
                        head.tag.$class = NS_PREFIX_CommonMarkModel + 'TagInfo';
                        head.tag.tagName = tagInfo.tag;
                        head.tag.attributeString = tagInfo.attributeString;
                        head.tag.attributes = [];
                        for (const attName in tagInfo.attributes) {
                            if (Object.prototype.hasOwnProperty.call(tagInfo.attributes, attName)) {
                                const attValue = tagInfo.attributes[attName];
                                head.tag.attributes.push({
                                    $class : NS_PREFIX_CommonMarkModel + 'Attribute',
                                    name : attName,
                                    value : attValue,
                                });
                            }
                        }
                        head.tag.content = tagInfo.content;
                        head.tag.closed = tagInfo.closed;
                    }
                }
            }
        };
        parser.onopentag = function (node) {
            const newNode = {};
            newNode.$class = CommonMarkTransformer.toClass(node.name);
            if(that.options && that.options.enableSourceLocation) {
                newNode.line = parser.line;
                newNode.column = parser.column;
                newNode.position = parser.position;
                newNode.startTagPosition = parser.startTagPosition;
            }

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
                const json = stack.peek();
                // console.log(JSON.stringify(json, null, 4));
                json.nodes = CommonMarkTransformer.mergeAdjacentTextNodes(json.nodes);
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

        // validate the object using the model
        if(format === 'concerto') {
            return this.serializer.fromJSON(json);
        }
        else {
            const validJson = this.serializer.fromJSON(json);
            return this.serializer.toJSON(validJson);
        }
    }

    /**
     * Merge adjacent text nodes in a list of nodes
     * @param {[*]} nodes a list of nodes
     * @returns {*} a new list of nodes with redundant text nodes removed
     */
    static mergeAdjacentTextNodes(nodes) {
        if(nodes) {
            const result = [];
            for(let n=0; n < nodes.length; n++) {
                const cur = nodes[n];
                const next = n+1 < nodes.length ? nodes[n+1] : null;

                if(next &&
                   cur.$class === (NS_PREFIX_CommonMarkModel + 'Text') &&
                   next.$class === (NS_PREFIX_CommonMarkModel + 'Text')) {
                    next.text = cur.text + next.text;  // Fold text in next node, skip current node
                }
                else {
                    result.push(cur);
                }
            }
            return result;
        }
        else {
            return nodes;
        }
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
        return NS_PREFIX_CommonMarkModel + CommonMarkTransformer.capitalizeFirstLetter(camelCased);
    }

    /**
     * Parses an HTML block and extracts the attributes, tag name and tag contents.
     * Note that this will return null for strings like this: </foo>
     * @param {string} string - the HTML block to parse
     * @return {Object} - a tag object that holds the data for the html block
     */
    static parseHtmlBlock(string) {
        try {
            const doc = (new DOMParser()).parseFromString(string, 'text/html');
            const item = doc.childNodes[0];
            const attributes = item.attributes;
            const attributeObject = {};
            let attributeString = '';

            for (let i = 0; i < attributes.length; i += 1) {
                attributeString += `${attributes[i].name} = "${attributes[i].value}" `;
                attributeObject[attributes[i].name] = attributes[i].value;
            }

            const tag = {
                tag: item.tagName.toLowerCase(),
                attributes: attributeObject,
                attributeString,
                content: item.textContent,
                closed: string.endsWith('/>')
            };

            return tag;
        } catch (err) {
            // no children, so we return null
            return null;
        }
    }
}

module.exports = CommonMarkTransformer;