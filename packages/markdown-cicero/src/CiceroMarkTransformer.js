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

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

const ToCiceroVisitor = require('./ToCiceroVisitor');
const FromCiceroVisitor = require('./FromCiceroVisitor');
const { CiceroMarkModel } = require('./externalModels/CiceroMarkModel');
const unquoteVariables = require('./UnquoteVariables');

const mkLineMap = (initMap, text) => {
    const result = text.split(/\r?\n/g).map(x => x.length+1);
    return initMap.concat(result.slice(0,result.length-1));
};

/**
 * Converts a CiceroMark DOM to/from a
 * CommonMark DOM.
 *
 * Converts a CiceroMark DOM to/from a markdown string.
 */
class CiceroMarkTransformer {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor(options) {
        this.options = options ? options : {};
        if (this.options.sourcePos && this.options.source) {
            this.lineMap = mkLineMap([],this.options.source);
        }
        // Setup for Nested Parsing
        this.commonMark = new CommonMarkTransformer(Object.assign(this.options,{tagInfo: true}));

        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(CommonMarkModel, 'commonmark.cto');
        this.modelManager.addModelFile(CiceroMarkModel, 'ciceromark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }

    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @param {object} [options] configuration options
     * @returns {*} concertoObject concerto ciceromark object
     */
    fromMarkdown(markdown, format='concerto', options) {
        const commonMarkDom = this.commonMark.fromMarkdown(markdown, 'json');
        return this.fromCommonMark(commonMarkDom, format, options);
    }

    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {*} input - CommonMark DOM (in JSON or as a Concerto object)
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @param {object} [options] configuration options
     * @returns {*} CiceroMark DOM
     */
    fromCommonMark(input, format='concerto', options) {
        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }

        // Add Cicero nodes
        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer,
            lineMap: this.lineMap,
        };
        const visitor = new ToCiceroVisitor();
        input.accept( visitor, parameters );

        let json = Object.assign({}, this.serializer.toJSON(input));
        let result;

        // remove variables, e.g. {{ variable }}, {{% formula %}}
        if(options && Object.prototype.hasOwnProperty.call(options,'quoteVariables') && !options.quoteVariables) {
            result = unquoteVariables(json);
        } else {
            result = json;
        }

        if(format === 'concerto') {
            return this.serializer.fromJSON(result);
        } else {
            return result;
        }
    }

    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {*} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {*} markdown string
     */
    toMarkdown(input, options) {
        const commonMarkDom = this.toCommonMark(input, 'json', options);
        return this.commonMark.toMarkdown(commonMarkDom);
    }

    /**
     * Obtain the Clause text for a Clause node
     * @param {*} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {*} markdown string
     */
    getClauseText(input, options) {
        let inputType;
        if (!input.getType) {
            inputType = input.$class;
        } else {
            inputType = input.getNamespace() + input.getType();
        }
        if (inputType === 'org.accordproject.ciceromark.Clause') {
            const commonMarkDom = this.toCommonMark(input, 'json', options);
            return ToCiceroVisitor.codeBlockContent(commonMarkDom.text);
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
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {*} input CiceroMark DOM
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @param {object} [options] configuration options
     * @param {boolean} [options.removeFormatting] if true the formatting nodes are removed
     * @param {boolean} [options.quoteVariables] if true variable nodes are removed
     * @returns {*} json commonmark object
     */
    toCommonMark(input, format='concerto', options) {
        // convert from concerto
        let json;
        if(input.getType) {
            json = Object.assign({}, this.serializer.toJSON(input));
        } else {
            json = Object.assign({}, input);
        }

        // remove variables, e.g. {{ variable }}, {{% formula %}}
        if(options && Object.prototype.hasOwnProperty.call(options,'quoteVariables') && !options.quoteVariables) {
            json = unquoteVariables(json);
        }

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

        const concertoDom = this.serializer.fromJSON(json);

        // convert to common mark
        const visitor = new FromCiceroVisitor(options);
        concertoDom.accept( visitor, {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        } );

        if(format === 'concerto') {
            return concertoDom;
        }
        return this.serializer.toJSON(concertoDom);
    }
}

module.exports = CiceroMarkTransformer;