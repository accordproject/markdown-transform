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

const MarkdownIt = require('markdown-it');
const FromMarkdownIt = require('./FromMarkdownIt');

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const ToMarkdownVisitor = require('./ToMarkdownVisitor');
const removeFormatting = require('./removeFormatting');
const CommonMarkModel = require('./externalModels/CommonMarkModel').CommonMarkModel;

/**
 * Parses markdown using the commonmark parser into the
 * intermediate representation: a JSON object that adheres to
 * the 'org.accordproject.commonmark' Concerto model.
 */
class CommonMarkTransformer {
    /**
     * Construct the parser.
     */
    constructor() {
        const modelManager = new ModelManager();
        modelManager.addModelFile(CommonMarkModel, 'commonmark.cto');
        const factory = new Factory(modelManager);
        this.serializer = new Serializer(factory, modelManager);
    }

    /**
     * Converts a CommonMark DOM to a markdown string
     * @param {*} input - CommonMark DOM (in JSON)
     * @returns {string} the markdown string
     */
    toMarkdown(input) {
        const visitor = new ToMarkdownVisitor();
        return visitor.toMarkdown(this.serializer.fromJSON(input));
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
     * Converts a markdown string into a token stream
     *
     * @param {string} markdown the string to parse
     * @returns {*} a markdown-it token stream
     */
    toTokens(markdown) {
        const parser = new MarkdownIt({html:true}); // XXX HTML inlines and code blocks true
        const tokenStream = parser.parse(markdown,{});
        return tokenStream;
    }

    /**
     * Converts a token stream into a CommonMark DOM object.
     *
     * @param {object} tokenStream the token stream
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromTokens(tokenStream) {
        const fromMarkdownIt = new FromMarkdownIt();
        const json = fromMarkdownIt.toCommonMark(tokenStream);

        // validate the object using the model
        const validJson = this.serializer.fromJSON(json);
        return this.serializer.toJSON(validJson);
    }

    /**
     * Converts a markdown string into a CommonMark DOM object.
     *
     * @param {string} markdown the string to parse
     * @returns {object} a CommonMark DOM (JSON) for the markdown content
     */
    fromMarkdown(markdown) {
        const tokenStream = this.toTokens(markdown);
        return this.fromTokens(tokenStream);
    }

    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     */
    getSerializer() {
        return this.serializer;
    }

}

module.exports = CommonMarkTransformer;