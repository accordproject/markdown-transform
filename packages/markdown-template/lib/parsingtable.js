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

const Boolean = require('./plugins/Boolean');
const Integer = require('./plugins/Integer');
const Long = require('./plugins/Long');
const Double = require('./plugins/Double');
const String = require('./plugins/String');
const DateTime = require('./plugins/DateTime');
const Resource = require('./plugins/Resource');
const MonetaryAmount = require('./plugins/MonetaryAmount');

const seqFunParser = require('./combinators').seqFunParser;
const withParser = require('./combinators').withParser;

const Introspector = require('@accordproject/concerto-core').Introspector;
const ModelVisitor = require('./ModelVisitor');

const {
    templateMarkManager,
    templateToTokens,
    tokensToUntypedTemplateMarkFragment,
    templateMarkTypingFromType,
} = require('./templatemarkutil');

/**
 * Adds entry to parsing table
 * @param {object} table the parsing table
 * @param {object} entry the entry for a given type
 */
function addEntryToParsingTable(table,entry) {
    Object.assign(table,entry);
}

/**
 * Clone a CiceroMark node
 * @param {*} visitor the visitor to use
 * @param {*} nodes the nodes to visit
 * @param {*} [parameters] optional parameters
 */
function concertoNodes(serializer, nodes) {
    const rootNode = {
        '$class': 'org.accordproject.commonmark.Document',
        'xmlns' : 'http://commonmark.org/xml/1.0',
        'nodes': nodes
    };
    return serializer.fromJSON(rootNode).nodes;
}

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const defaultParsingTable = () => {
    const table = {};
    addEntryToParsingTable(table,Boolean);
    addEntryToParsingTable(table,Integer);
    addEntryToParsingTable(table,Long);
    addEntryToParsingTable(table,Double);
    addEntryToParsingTable(table,String);
    addEntryToParsingTable(table,DateTime);
    addEntryToParsingTable(table,Resource);
    addEntryToParsingTable(table,MonetaryAmount);
    return table;
};

/**
 * Maintains a parsing table
 * @class
 */
class ParsingTable {
    /**
     * Create the ParsingTable
     * @param {object} template - the template instance
     */
    constructor(modelManager,parserFunOfTemplateMark,draftVisitNodes) {
        this.modelManager = modelManager;
        this.introspector = new Introspector(this.modelManager);

        // Mapping from types to parsers/drafters
        this.parsingTable = defaultParsingTable();

        // Hook: How to compile from template mark to parser
        this.parseFromTemplateMark = function(nodes,elementType,params) {
            const childrenParser = seqFunParser(nodes.map(function (x) {
                return parserFunOfTemplateMark(x,params);
            }));
            return (r) => {
                return withParser(elementType,childrenParser(r))
            };
        };
        // Hook: How to draft from template mark to parser
        this.draftFromTemplateMark = function(nodes,elementType,params) {
            return (data) => {
                const cNodes = concertoNodes(params.templateMarkSerializer,nodes);
                const childrenParameters = {
                    parserManager: params.parserManager,
                    templateMarkModelManager: params.templateMarkModelManager,
                    templateMarkSerializer: params.templateMarkSerializer,
                    data: data,
                    kind: 'clause',
                };
                return draftVisitNodes(params.visitor, cNodes, childrenParameters);
            }
        };
        // Hook: How to compile from CTO to ciceromark
        this.templateMarkFromModel = function(name,model,elementType) {
            const modelVisitor = new ModelVisitor();
            const genericParameters = { name: name };
            const generic = model.accept(modelVisitor,genericParameters);
            const validated = templateMarkManager.serializer.toJSON(templateMarkManager.serializer.fromJSON(generic));
            return validated.nodes;
        }
    }

    /**
     * Gets parsing table for variables
     * @return {object} the parsing table
     */
    getParsingTable() {
        return this.parsingTable;
    }

    /**
     * Sets parsing table for variables
     * @param {object} table the parsing table
     */
    setParsingTable(table) {
        this.parsingTable = table;
    }

    /**
     * Adds parsing table for variables
     * @param {object} table the parsing table
     */
    addParsingTable(table) {
        this.parsingTable = Object.assign(this.parsingTable,table);
    }

    /**
     * Adds entry to parsing table
     * @param {object} entry the entry for a given type
     */
    addParsingTableEntry(entry) {
        addEntryToParsingTable(this.parsingTable,entry);
    }

    /**
     * Compile a CTO model into its TemplateMark equivalent
     * @param {string} name the property name
     * @param {object} parsingTable the parsing table
     * @param {string} elementType the type
     */
    compileModel(name,parsingTable,elementType) {
        let model;
        try {
            model = this.introspector.getClassDeclaration(elementType);
        } catch(err) {
            throw err;
        }
        const templateMark = this.templateMarkFromModel(name,model,elementType);
        parsingTable[elementType] = {};
        parsingTable[elementType]['templatemark'] = {};
        parsingTable[elementType]['templatemark'].nodes = templateMark;
    }

    /**
     * Compile an entry into its JavaScript equivalent
     * @param {object} entry the parsing table entry for this type
     * @param {string} elementType the type
     * @param {object} parseParams parameters for the nested parse generation
     * @param {object} draftParams parameters for the nested draft generation
     */
    compileEntry(entry,elementType,parseParams,draftParams) {
        if (Object.prototype.hasOwnProperty.call(entry,'inline')) {
            const tokenStream = templateToTokens(entry['inline']);
            const template = tokensToUntypedTemplateMarkFragment(tokenStream);
            entry['templatemark'] = {};
            entry['templatemark'].nodes = template.nodes[0].nodes[0].nodes; // XXX not robust beyond a paragraph
        }
        if (Object.prototype.hasOwnProperty.call(entry,'templatemark')) {
            const template = entry['templatemark'].nodes;
            const typedTemplate = templateMarkTypingFromType(template,this.modelManager,elementType);
            if(parseParams) {
                const parse = this.parseFromTemplateMark(typedTemplate,elementType,parseParams);
                if (!Object.prototype.hasOwnProperty.call(entry,'javascript')) {
                    entry['javascript'] = {};
                }
                entry['javascript'].parse = (format) => parse;
            }
            if(draftParams) {
                const draft = this.draftFromTemplateMark(typedTemplate,elementType,draftParams);
                if (!Object.prototype.hasOwnProperty.call(entry,'javascript')) {
                    entry['javascript'] = {};
                }
                entry['javascript'].draft = draft;
            }
        }
    }
    
    /**
     * Gets parser for a given type
     * @param {string} name the property
     * @param {string} elementType the type
     * @param {string} format the format
     * @param {object} parseParams parameters for the nested parse generation
     * @return {*} the parser
     */
    getParser(name,elementType,format,parseParams) {
        const parsingTable = this.getParsingTable();
        if (!parsingTable[elementType]) {
            this.compileModel(name,parsingTable,elementType);
        }
        const entry = parsingTable[elementType];
        if (!Object.prototype.hasOwnProperty.call(entry,'javascript'||!entry['javascript'].parse)) {
            this.compileEntry(entry,elementType,parseParams,null);
        }
        if (Object.prototype.hasOwnProperty.call(entry,'javascript')&&entry['javascript'].parse) {
            return entry['javascript'].parse(format);
        } else {
            throw new Error('No known parser for type ' + elementType);
        }
    }

    /**
     * Gets drafter for a given type
     * @param {string} name the property
     * @param {string} elementType the type
     * @param {string} format the format
     * @param {object} draftParams parameters for the nested draft generation
     * @return {*} the drafter
     */
    getDrafter(name,elementType,format,draftParams) {
        const parsingTable = this.getParsingTable();
        if (!parsingTable[elementType]) {
            this.compileModel(name,parsingTable,elementType);
        }
        const entry = parsingTable[elementType];
        if (!Object.prototype.hasOwnProperty.call(entry,'javascript')||!entry['javascript'].draft) {
            this.compileEntry(entry,elementType,null,draftParams);
        }
        if (Object.prototype.hasOwnProperty.call(entry,'javascript')&&entry['javascript'].draft) {
            return entry['javascript'].draft;
        } else {
            throw new Error('No known parser for type ' + elementType);
        }
    }

}

module.exports = ParsingTable;
