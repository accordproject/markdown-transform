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
const CommonMarkUtils = require('./CommonMarkUtils');
const ToMarkdownStringVisitor = require('./ToMarkdownStringVisitor');
const removeFormatting = require('./removeFormatting');
const CommonMarkModel = require('./externalModels/CommonMarkModel').CommonMarkModel;

const mkLineMap = (initMap, text) => {
    const result = text.split(/\r?\n/g).map(x => x.length+1);
    return initMap.concat(result.slice(0,result.length-1));
};
const mkOffset = (map,line,column) => map.slice(0,line-1).reduce((a, b) => a+b, 0)+column;

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonMarkTransformer {

    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     * @param {boolean} [options.sourcePos] if true then source potision information is returned
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
        parameters.stack = [];
        const visitor = new ToMarkdownStringVisitor(this.options);
        input.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Converts a CommonMark DOM to a CommonMark DOM with formatting removed
     * @param {*} input - CommonMark DOM (in JSON)
     * @returns {string} the CommonMark DOM with formatting nodes removed
     */
    removeFormatting(input) {
        return removeFormatting(input);
    }

    /**
     * Converts a markdown string into a Concerto DOM object.
     *
     * @param {string} markdown the string to parse
     * @param {string} [format] the format of the object to return. Defaults to 'concerto.
     * @param {Number[]} [initMap] optional line map
     * Pass 'json' to return the JSON object, skipping Concerto validation
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromMarkdown(markdown, format='concerto', initMap=[]) {
        let stack = new Stack();
        const that = this;
        const sourcepos = that.options && that.options.sourcePos;
        const parser = sax.parser(true, {position:false});

        // Used to calculate offset for source position
        let prevLines = initMap.length;
        const lineMap = mkLineMap(initMap, markdown);

        parser.onerror = function (e) {
            throw e;
        };

        parser.ontext = function (t) {
            const head = stack.peek();
            if(t.length > 0 && head) {
                if (CommonMarkUtils.isLeafNode(head)) {
                    head.text = CommonMarkUtils.isCodeBlockNode(head) ? CommonMarkUtils.unescapeCodeBlock(t) : t;
                }
                if (CommonMarkUtils.isHtmlNode(head) || CommonMarkUtils.isCodeBlockNode(head)) {
                    const maybeHtmlText = CommonMarkUtils.isHtmlNode(head) ? head.text : head.info;
                    const tagInfo = that.options && that.options.tagInfo ? CommonMarkUtils.parseHtmlBlock(maybeHtmlText) : null;
                    if (tagInfo) {
                        head.tag = tagInfo;
                    }
                }
            }
        };
        parser.onopentag = function (node) {
            const newNode = {};
            newNode.$class = CommonMarkUtils.toClass(node.name);
            if(sourcepos) {
                const textPos = node.attributes.sourcepos;
                if (textPos) {
                    const posRegex = /([0-9]+):([0-9]+)-([0-9]+):([0-9]+)/g;
                    const match = posRegex.exec(textPos);
                    newNode.startPos = { '$class': 'org.accordproject.commonmark.SourcePos' };
                    newNode.startPos.line = match[1] ? Number(match[1]) + prevLines : -1;
                    newNode.startPos.column = match[2] ? Number(match[2]) : -1;
                    newNode.startPos.offset = mkOffset(lineMap,newNode.startPos.line,newNode.startPos.column);
                    newNode.endPos = { '$class': 'org.accordproject.commonmark.SourcePos' };
                    newNode.endPos.line = match[3] ? Number(match[3]) + prevLines: -1;
                    newNode.endPos.column = match[4] ? Number(match[4]) : -1;
                    newNode.endPos.offset = mkOffset(lineMap,newNode.endPos.line,newNode.endPos.column);
                }
            }

            // hoist the attributes into the parent object
            Object.keys(node.attributes).forEach(key => {
                if (key !== 'sourcepos') {
                    newNode[key] = node.attributes[key];
                }
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
                json.nodes = CommonMarkUtils.mergeAdjacentTextNodes(json.nodes);
                json.nodes = CommonMarkUtils.mergeAdjacentHtmlNodes(json.nodes, that.options && that.options.tagInfo);
                stack.pop();
            }
        };

        const reader = new commonmark.Parser();
        const writer = new commonmark.XmlRenderer({sourcepos});
        const parsed = reader.parse(markdown);
        const xml = writer.render(parsed);
        // console.log('====== XML =======');
        // console.log(xml);
        parser.write(xml).close();
        // console.log('====== JSON =======');
        let json = stack.peek();
        if (!json.nodes || json.nodes.length === 0) {
            json.nodes = [{
                '$class': 'org.accordproject.commonmark.Paragraph',
                'nodes': [ { '$class': 'org.accordproject.commonmark.Text', 'text': '' } ]
            }];
        }
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
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer() {
        return this.serializer;
    }

}

module.exports = CommonMarkTransformer;