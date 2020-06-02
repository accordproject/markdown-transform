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
const toCommonMark = require('./FromMarkdownIt');

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const ToMarkdownStringVisitor = require('./ToMarkdownStringVisitor');
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
     * @param {object} [options] configuration options
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
     * Pass 'json' to return the JSON object, skipping Concerto validation
     * @returns {*} a Concerto object (DOM) for the markdown content
     */
    fromMarkdown(markdown, format='concerto') {
        const parser = new MarkdownIt({html:true}); // XXX HTML inlines and code blocks true
        const tokenStream = parser.parse(markdown,{});
        //console.log('tokens: ' + JSON.stringify(tokenStream,null,2));

        const json = toCommonMark(tokenStream);

        // validate the object using the model
        const validJson = this.serializer.fromJSON(json);
        if(format === 'concerto') {
            return validJson;
        }
        else {
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