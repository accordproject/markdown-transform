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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto');

const Stack = require('./Stack');
const ToMarkdownStringVisitor = require('./ToMarkdownStringVisitor');
const ToHtmlStringVisitor = require('./ToHtmlStringVisitor');

const { DOMParser } = require('xmldom');
const { COMMON_NS_PREFIX, commonmarkModel } = require('./Models');

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonMark {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     * @param {boolean} [options.trimText] trims all text nodes
     * @param {boolean} [options.disableValidation] returns unvalidated JSON, rather than a Concerto model
     * @param {boolean} [options.enableSourceLocation] if true then location information is returned
     * @param {boolean} [options.noIndex] do not index ordered list (i.e., use 1. everywhere)
     * @param {boolean} [options.tagInfo] Construct tags for HTML elements
     */
    constructor(options) {
        this.options = options;
        const modelManager = new ModelManager();
        modelManager.addModelFile(commonmarkModel, 'commonmark.cto');
        const factory = new Factory(modelManager);
        this.serializer = new Serializer(factory, modelManager);
    }

    /**
     * Converts a JS object for the AST to a concerto object
     * @param {*} json the JS Object for the AST
     * @returns {*} the validated concerto object
     */
    convertToConcertoObject(json) {
        return this.serializer.fromJSON(json);
    }

    /**
     * Is it a leaf node?
     * @param {*} json the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isLeafNode(json) {
        return (json.$class === (COMMON_NS_PREFIX + 'Text') ||
                json.$class === (COMMON_NS_PREFIX + 'CodeBlock') ||
                json.$class === (COMMON_NS_PREFIX + 'HtmlInline') ||
                json.$class === (COMMON_NS_PREFIX + 'HtmlBlock') ||
                json.$class === (COMMON_NS_PREFIX + 'Code'));
    }

    /**
     * Is it a HTML node? (html blocks or html inlines)
     * @param {*} json the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isHtmlNode(json) {
        return (json.$class === (COMMON_NS_PREFIX + 'HtmlInline') ||
                json.$class === (COMMON_NS_PREFIX + 'HtmlBlock'));
    }

    /**
     * Is it a Code Block node?
     * @param {*} json the JS Object for the AST
     * @return {boolean} whether it's a leaf node
     */
    static isCodeBlockNode(json) {
        return json.$class === (COMMON_NS_PREFIX + 'CodeBlock');
    }

    /**
     * Parses a markdown string into a Concerto DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromMarkdownStringConcerto(markdown) {
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
                if (CommonMark.isLeafNode(head)) {
                    head.text = t;
                }
                if (CommonMark.isHtmlNode(head) || CommonMark.isCodeBlockNode(head)) {
                    const maybeHtmlText = CommonMark.isHtmlNode(head) ? head.text : head.info;
                    const tagInfo = that.options && that.options.tagInfo ? CommonMark.parseHtmlBlock(maybeHtmlText) : null;
                    if (tagInfo) {
                        head.tag = {};
                        head.tag.$class = COMMON_NS_PREFIX + 'TagInfo';
                        head.tag.tagName = tagInfo.tag;
                        head.tag.attributeString = tagInfo.attributeString;
                        head.tag.attributes = [];
                        for (const attName in tagInfo.attributes) {
                            if (tagInfo.attributes.hasOwnProperty(attName)) {
                                const attValue = tagInfo.attributes[attName];
                                head.tag.attributes.push({
                                    '$class': COMMON_NS_PREFIX + 'Attribute',
                                    'name': attName,
                                    'value': attValue,
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
            newNode.$class = CommonMark.toClass(node.name);
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
        return this.convertToConcertoObject(json);
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
        return COMMON_NS_PREFIX + CommonMark.capitalizeFirstLetter(camelCased);
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

    /**
     * Converts a commonmark document to a markdown string
     * @param {*} concertoObject - concerto commonmark object
     * @returns {string} the markdown string
     */
    toMarkdownStringConcerto(concertoObject) {
        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToMarkdownStringVisitor(this.options);
        concertoObject.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Converts a commonmark document to an html string
     * @param {*} concertoObject - concerto commonmark object
     * @returns {string} the html string
     */
    toHtmlStringConcerto(concertoObject) {
        const parameters = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToHtmlStringVisitor(this.options);
        concertoObject.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Parses a markdown string into a DOM object in JSON format.
     *
     * @param {string} markdown the string to parse
     * @returns {*} a JSON object (DOM) for the markdown content
     */
    fromMarkdownString(markdown) {
        const options = this.options;
        if (this.options) {
            this.options.disableValidation = false;
        }
        let concertoObject = this.fromMarkdownStringConcerto(markdown);
        this.options = options;
        return this.serializer.toJSON(concertoObject);
    }

    /**
     * Converts a commonmark document to a markdown string
     * @param {*} json - JSON commonmark object
     * @param {*} options - options (e.g., wrapVariables)
     * @returns {string} the markdown string
     */
    toMarkdownString(json, options) {
        return this.toMarkdownStringConcerto(this.serializer.fromJSON(json));
    }

    /**
     * Converts a commonmark document to an html string
     * @param {*} json - JSON commonmark object
     * @param {*} options - options (e.g., wrapVariables)
     * @returns {string} the html string
     */
    toHtmlString(json, options) {
        return this.toHtmlStringConcerto(this.serializer.fromJSON(json));
    }
}

module.exports = CommonMark;