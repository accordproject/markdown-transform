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

const {
    templateMarkManager,
    grammarToTokens,
    tokensToUntypedTemplateMarkFragment,
    templateMarkTypingFromType,
} = require('./templatemarkutil');

/**
 * Parsing table for variables
 * This maps types to their parser
 */
const defaultParsingTable = {
    'Integer' : { kind: 'javascript', parse: integerParser, draft: integerDrafter },
    'Long' : { kind: 'javascript', parse: integerParser, draft: integerDrafter },
    'Double' : { kind: 'javascript', parse: doubleParser, draft: doubleDrafter },
    'String' : { kind: 'javascript', parse: stringParser, draft: stringDrafter },
    'DateTime' : { kind: 'javascript', parse: dateTimeParser, draft: dateTimeDrafter },
    'Resource' : { kind: 'javascript', parse: stringParser, draft: resourceDrafter },
    'org.accordproject.time.Duration' : { kind: 'templatemark', nodes: [{'$class':'org.accordproject.templatemark.VariableDefinition','name':'amount','elementType':'Long'},{'$class':'org.accordproject.commonmark.Text','text':' '},{'$class':'org.accordproject.templatemark.EnumVariableDefinition','enumValues':['seconds','minutes','hours','days','weeks'],'name':'unit'}] },
    'org.accordproject.cicero.contract.AccordParty' : { kind : 'grammar', grammar: '{{partyId}}' },
    'org.accordproject.money.MonetaryAmount' : { kind: 'templatemark', nodes: [{'$class':'org.accordproject.templatemark.VariableDefinition','name':'doubleValue','elementType':'Double'},{'$class':'org.accordproject.commonmark.Text','text':' '},{'$class':'org.accordproject.templatemark.EnumVariableDefinition','enumValues':['AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BOV','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHE','CHF','CHW','CLF','CLP','CNY','COP','COU','CRC','CUC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MXV','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','USN','UYI','UYU','UZS','VEF','VND','VUV','WST','XAF','XAG','XAU','XBA','XBB','XBC','XBD','XCD','XDR','XOF','XPD','XPF','XPT','XSU','XTS','XUA','XXX','YER','ZAR','ZMW','ZWL'],'name':'currencyCode'}] }
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
    constructor(modelManager) {
        this.modelManager = modelManager;
        // Mapping from types to parsers/drafters
        this.parsingTable = defaultParsingTable;
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
     * Gets parser for a given type
     * @param {string} elementType the type
     * @param {string} format the format
     * @param {object} fromTemplateMark how to get the parser from templatemark
     * @return {*} the parser
     */
    getParser(elementType,format,fromTemplateMark) {
        const entry = this.getParsingTable()[elementType];
        if (!entry) {
            throw new Error('No known parser for type ' + elementType);
        }
        if (entry.kind === 'javascript') {
            return (r) => entry.parse(format);
        } else if (entry.kind === 'templatemark') {
            return fromTemplateMark(entry.nodes);
        } else if (entry.kind === 'grammar') {
            const tokenStream = grammarToTokens(entry.grammar);
            const template = tokensToUntypedTemplateMarkFragment(tokenStream);
            const typedTemplate = templateMarkTypingFromType(template,this.modelManager,elementType);

            return fromTemplateMark(typedTemplate.nodes[0].nodes); // XXX not robust beyond a paragraph
        } else {
            throw new Error('Unknown parsing kind ' + entry.kind);
        }
    }

    /**
     * Gets drafter for a given type
     * @param {string} elementType the type
     * @return {*} the drafter
     */
    getDrafter(elementType,fromTemplateMark) {
        const entry = this.getParsingTable()[elementType];
        if (!entry) {
            throw new Error('No known drafter for type ' + elementType);
        }
        if (entry.kind === 'javascript') {
            return entry.draft;
        } else if (entry.kind === 'templatemark') {
            return fromTemplateMark(entry.nodes);
        } else if (entry.kind === 'grammar') {
            const tokenStream = grammarToTokens(entry.grammar);
            const template = tokensToUntypedTemplateMarkFragment(tokenStream);
            const typedTemplate = templateMarkTypingFromType(template,this.modelManager,elementType);

            return fromTemplateMark(typedTemplate.nodes[0].nodes[0].nodes); // XXX not robust beyond a paragraph
        } else {
            throw new Error('Unknown kind ' + entry.kind);
        }
    }

}

module.exports = ParsingTable;
