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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const MarkdownIt = require('markdown-it');
const MarkdownItCicero = require('@accordproject/markdown-it-cicero');
const FromMarkdownIt = require('@accordproject/markdown-common').FromMarkdownIt;
const cicerorules = require('./cicerorules');
const ToMarkdownCiceroVisitor = require('./ToMarkdownCiceroVisitor');
const ToCiceroMarkUnwrappedVisitor = require('./ToCiceroMarkUnwrappedVisitor');

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

const FromCiceroEditVisitor = require('./FromCiceroEditVisitor');
const ToCommonMarkVisitor = require('./ToCommonMarkVisitor');
const { CiceroMarkModel } = require('./externalModels/CiceroMarkModel');
const unquoteVariables = require('./UnquoteVariables');

/**
 * Converts a CiceroMark DOM to/from a
 * CommonMark DOM.
 *
 * Converts a CiceroMark DOM to/from a markdown string.
 */
class CiceroMarkTransformer {
    /**
     * Construct the parser.
     */
    constructor() {
        // Setup for Nested Parsing
        this.commonMark = new CommonMarkTransformer();

        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(CommonMarkModel, 'commonmark.cto');
        this.modelManager.addModelFile(CiceroMarkModel, 'ciceromark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }

    /**
     * Obtain the Clause text for a Clause node
     * @param {*} input CiceroMark DOM
     * @returns {*} markdown string
     */
    getClauseText(input) {
        if (input.$class === 'org.accordproject.ciceromark.Clause') {
            const docInput = {
                $class: 'org.accordproject.commonmark.Document',
                xmlns : 'http://commonmark.org/xml/1.0',
                nodes: [input],
            };
            return this.toMarkdown(docInput);
        } else {
            throw new Error('Cannot apply getClauseText to non-clause node');
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
     * Converts a CiceroEdit string to a CiceroMark DOM
     * @param {*} input - ciceroedit string
     * @returns {*} CiceroMark DOM
     */
    fromCiceroEdit(input) {
        const commonMark = this.commonMark.fromMarkdown(input);
        const dom = this.serializer.fromJSON(commonMark);

        // Add Cicero nodes
        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer,
        };
        const visitor = new FromCiceroEditVisitor();
        dom.accept(visitor, parameters);
        return this.serializer.toJSON(dom);
    }

    /**
     * Converts a CiceroMark DOM to a CiceroMark Unwrapped DOM
     * @param {object} input - CiceroMark DOM (JSON)
     * @param {object} [options] configuration options
     * @param {boolean} [options.quoteVariables] if true variable quotations are removed
     * @returns {*} CiceroMark DOM
     */
    toCiceroMarkUnwrapped(input,options) {
        // remove variables, e.g. {{ variable }}, {{% formula %}}
        if(options && Object.prototype.hasOwnProperty.call(options,'quoteVariables') && !options.quoteVariables) {
            input = this.unquote(input);
        }

        const dom = this.serializer.fromJSON(input);

        // convert to common mark
        const visitor = new ToCiceroMarkUnwrappedVisitor();
        dom.accept(visitor, {
            modelManager : this.modelManager,
        });

        return this.serializer.toJSON(dom);
    }

    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {*} input - CommonMark DOM (in JSON)
     * @returns {*} CiceroMark DOM
     */
    fromCommonMark(input) {
        return input; // Now the identity
    }

    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @returns {object} ciceromark object (JSON)
     */
    fromMarkdown(markdown) {
        const commonMarkDom = this.commonMark.fromMarkdown(markdown);
        return this.fromCommonMark(commonMarkDom);
    }

    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {*} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {*} markdown string
     */
    toMarkdown(input, options) {
        const commonMarkDom = this.toCommonMark(input, options);
        return this.commonMark.toMarkdown(commonMarkDom);
    }

    /**
     * Converts a cicero markdown string to a CiceroMark DOM
     * @param {string} markdown a cicero markdown string
     * @param {object} [options] configuration options
     * @returns {object} ciceromark object (JSON)
     */
    fromMarkdownCicero(markdown, options) {
        const tokens = this.toTokens(markdown);
        return this.fromTokens(tokens);
    }

    /**
     * Converts a CiceroMark DOM to a cicero markdown string
     * @param {object} input CiceroMark DOM
     * @returns {string} json commonmark object
     */
    toMarkdownCicero(input) {
        const visitor = new ToMarkdownCiceroVisitor();
        return visitor.toMarkdownCicero(this.serializer.fromJSON(input));
    }

    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {*} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @param {boolean} [options.removeFormatting] if true the formatting nodes are removed
     * @param {boolean} [options.quoteVariables] if true variable quotations are removed
     * @returns {*} json commonmark object
     */
    toCommonMark(input, options) {
        let json = this.toCiceroMarkUnwrapped(input,options);

        // remove formatting
        if(options && options.removeFormatting) {
            const cmt = new CommonMarkTransformer(options);
            json = cmt.removeFormatting(json);

            // now we need to also remove the formatting for clause nodes
            json.nodes
                .filter(element => element.$class === 'org.accordproject.ciceromark.Clause')
                .forEach(clause => {
                    const unformatted = cmt.removeFormatting(Object.assign({}, json, { nodes: clause.nodes }));
                    clause.nodes = unformatted.nodes;
                });
        }

        const dom = this.serializer.fromJSON(json);

        // convert to common mark
        const visitor = new ToCommonMarkVisitor(options);
        dom.accept( visitor, {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        } );

        return this.serializer.toJSON(dom);
    }

    /**
     * Unquotes a CiceroMark DOM
     * @param {object} input CiceroMark DOM
     * @returns {object} unquoted CiceroMark DOM
     */
    unquote(input) {
        return unquoteVariables(input);
    }

    /**
     * Converts a ciceromark string into a token stream
     *
     * @param {string} input the string to parse
     * @returns {*} a markdown-it token stream
     */
    toTokens(input) {
        const parser = new MarkdownIt({html:true}).use(MarkdownItCicero); // XXX HTML inlines and code blocks true
        const tokenStream = parser.parse(input,{});
        return tokenStream;
    }

    /**
     * Converts a token stream into a CiceroMark DOM object.
     *
     * @param {object} tokenStream the token stream
     * @returns {*} the CiceroMark DOM (JSON)
     */
    fromTokens(tokenStream) {
        const fromMarkdownIt = new FromMarkdownIt(cicerorules);
        const json = fromMarkdownIt.toCommonMark(tokenStream);

        // validate the object using the model
        const validJson = this.serializer.fromJSON(json);
        return this.serializer.toJSON(validJson);
    }

}

module.exports = CiceroMarkTransformer;