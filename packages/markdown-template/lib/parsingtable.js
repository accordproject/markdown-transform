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

const doubleParser = require('./doubleParser').doubleParser;
const integerParser = require('./coreparsers').integerParser;
const stringParser = require('./coreparsers').stringParser;
const dateTimeParser = require('./dateTimeParser').dateTimeParser;

const doubleDrafter = require('./doubleDrafter').doubleDrafter;
const integerDrafter = require('./coredrafters').integerDrafter;
const stringDrafter = require('./coredrafters').stringDrafter;
const dateTimeDrafter = require('./dateTimeDrafter').dateTimeDrafter;
const resourceDrafter = require('./coredrafters').resourceDrafter;

const seqFunParser = require('./coreparsers').seqFunParser;
const withParser = require('./coreparsers').withParser;

Error.stackTraceLimit = Infinity;

const {
    templateMarkManager,
    grammarToTokens,
    tokensToUntypedTemplateMarkFragment,
    templateMarkTypingFromType,
} = require('./templatemarkutil');

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
    return {
        'Integer' : { 'javascript' : { parse: (format) => (r) => integerParser(), draft: integerDrafter } },
        'Long' : { 'javascript' : { parse: (format) => (r) => integerParser(), draft: integerDrafter } },
        'Double' : { 'javascript' : { parse: (format) => (r) => doubleParser(format), draft: doubleDrafter } },
        'String' : { 'javascript' : { parse: (format) => (r) => stringParser(), draft: stringDrafter } },
        'DateTime' : { 'javascript' : { parse: (format) => (r) => dateTimeParser(format), draft: dateTimeDrafter } },
        'Resource' : { 'javascript' : { parse: (format) => (r) => stringParser(), draft: resourceDrafter } },
        'org.accordproject.time.Duration' : { 'templatemark' : { nodes: [{'$class':'org.accordproject.templatemark.VariableDefinition','name':'amount','elementType':'Long'},{'$class':'org.accordproject.commonmark.Text','text':' '},{'$class':'org.accordproject.templatemark.EnumVariableDefinition','enumValues':['seconds','minutes','hours','days','weeks'],'name':'unit'}] } },
        'org.accordproject.cicero.contract.AccordParty' : { 'inline' : { grammar: '{{partyId}}' } },
        'org.accordproject.money.MonetaryAmount' : { 'templatemark' : { nodes: [{'$class':'org.accordproject.templatemark.VariableDefinition','name':'doubleValue','elementType':'Double'},{'$class':'org.accordproject.commonmark.Text','text':' '},{'$class':'org.accordproject.templatemark.EnumVariableDefinition','enumValues':['AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BOV','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHE','CHF','CHW','CLF','CLP','CNY','COP','COU','CRC','CUC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MXV','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','USN','UYI','UYU','UZS','VEF','VND','VUV','WST','XAF','XAG','XAU','XBA','XBB','XBC','XBD','XCD','XDR','XOF','XPD','XPF','XPT','XSU','XTS','XUA','XXX','YER','ZAR','ZMW','ZWL'],'name':'currencyCode'}] } }
    };
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
        // Mapping from types to parsers/drafters
        this.parsingTable = defaultParsingTable();

        // Hooks
        this.parseFromTemplateMark = function(nodes,elementType,params) {
            const childrenParser = seqFunParser(nodes.map(function (x) {
                return parserFunOfTemplateMark(x,params);
            }));
            return (r) => {
                return withParser(elementType,childrenParser(r))
            };
        };
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
     * Compile an entry into its JavaScript equivalent
     * @param {object} entry the parsing table
     * @param {string} elementType the type
     * @param {object} parseParams parameters for the nested parse generation
     * @param {object} draftParams parameters for the nested draft generation
     */
    compileEntry(entry,elementType,parseParams,draftParams) {
        if (Object.prototype.hasOwnProperty.call(entry,'inline')) {
            const tokenStream = grammarToTokens(entry['inline'].grammar);
            const template = tokensToUntypedTemplateMarkFragment(tokenStream);
            const typedTemplate = templateMarkTypingFromType(template,this.modelManager,elementType);
            entry['templatemark'] = {};
            entry['templatemark'].nodes = typedTemplate.nodes[0].nodes[0].nodes; // XXX not robust beyond a paragraph
        }
        if (Object.prototype.hasOwnProperty.call(entry,'templatemark')) {
            if(parseParams) {
                const parse = this.parseFromTemplateMark(entry['templatemark'].nodes,elementType,parseParams);
                if (!Object.prototype.hasOwnProperty.call(entry,'javascript')) {
                    entry['javascript'] = {};
                }
                entry['javascript'].parse = (format) => parse;
            }
            if(draftParams) {
                const draft = this.draftFromTemplateMark(entry['templatemark'].nodes,elementType,draftParams);
                if (!Object.prototype.hasOwnProperty.call(entry,'javascript')) {
                    entry['javascript'] = {};
                }
                entry['javascript'].draft = draft;
            }
        }
    }
    
    /**
     * Gets parser for a given type
     * @param {string} elementType the type
     * @param {string} format the format
     * @param {object} parseParams parameters for the nested parse generation
     * @return {*} the parser
     */
    getParser(elementType,format,parseParams) {
        const entry = this.getParsingTable()[elementType];
        if (!entry) {
            throw new Error('No known parser for type ' + elementType);
        }
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
     * @param {string} elementType the type
     * @param {string} format the format
     * @param {object} draftParams parameters for the nested draft generation
     * @return {*} the drafter
     */
    getDrafter(elementType,format,draftParams) {
        const entry = this.getParsingTable()[elementType];
        if (!entry) {
            throw new Error('No known drafter for type ' + elementType);
        }
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
