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

let P = require('parsimmon');

// standard's definition of whitespace rather than Parsimmon's.
let whitespace = P.regexp(/\s*/m);
let whitespaceLine = P.regexp(/[ \t]*/m);

function ident() {
    return P.regexp(/[a-zA-Z0-9]+/).skip(whitespace);
}

// Several parsers are just strings with optional whitespace.
function word(str) {
    return P.string(str).thru(token);
}

function token(parser) {
  return parser.skip(whitespace);
}

function string() {
    return token(P.regexp(/"((?:\\.|.)*?)"/, 1))
        .desc("string");
}
function formula() {
    return P.regexp(/[^]*%}}/)
        .map(x => x.substring(0,x.length-3))
        .desc("formula");
}

function mkText(text) {
    return { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': text };
}
function mkEndText(text) {
    return { '$class': 'org.accordproject.templatemark.raw.TextChunk', 'value': text.trimEnd() };
}
function mkVariable(v) {
    return { '$class': 'org.accordproject.templatemark.VariableDefinition', 'name': v };
}
function mkVariableAs(v) {
    return { '$class': 'org.accordproject.templatemark.FormattedVariableDefinition', 'name': v[0], 'format': v[2] };
}
function mkConditional(x) {
    return { '$class': 'org.accordproject.templatemark.ConditionalDefinition', 'name': x[0], 'whenTrue': x[1][0], 'whenFalse': x[1][1] };
}
function mkClause(x) {
    return { '$class': 'org.accordproject.templatemark.ClauseDefinition', 'name': x[0], 'nodes': flatten(x[1].concat([[x[2]]])) };
}
function mkWith(x) {
    return { '$class': 'org.accordproject.templatemark.WithDefinition', 'name': x[0], 'nodes': flatten(x[1].concat([[x[2]]])) };
}
function mkUlist(x) {
    return { '$class': 'org.accordproject.templatemark.ListBlockDefinition', 'name': x[0], 'type': 'bullet', 'tight': 'true', 'nodes': flatten(x[1].concat([[x[2]]])) };
}
function mkOlist(x) {
    return { '$class': 'org.accordproject.templatemark.ListBlockDefinition', 'name': x[0], 'type': 'ordered', 'tight': 'true', 'start': 1, 'delimiter': 'period', 'nodes': flatten(x[1].concat([[x[2]]])) };
}
function mkFormula(content) {
    return { '$class': 'org.accordproject.templatemark.FormulaDefinition','name': 'formula', 'code': content, dependencies: [] };
}

function chunkParser(str) {
    return P.regexp(new RegExp('[^{]*'+str)).map(x => x.substring(0,x.length-str.length));
}
function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

let TemplateParser = P.createLanguage({
    // Main entry points for the parser
    clauseTemplate: r => r.clauseTop,
    contractTemplate: r => r.contractTop,
    templateEnd: r => chunkParser('').map(mkEndText),

    // Variable
    variableName: r => ident().skip(whitespace).skip(P.string('}}')),
    variableNameNL: r => r.variableName.skip(P.string('\n')),
    variableAs: r => P.seq(ident().skip(whitespace),word('as'),string()).skip(P.string('}}')).map(mkVariableAs),
    variableNoAs: r => r.variableName.map(mkVariable),
    varChunk: r => P.seq(chunkParser('{{').map(mkText).skip(whitespace),P.alt(r.variableAs,r.variableNoAs)),

    // Computed Variable
    formulaChunk: r => P.seq(chunkParser('{{%').map(mkText),formula().map(mkFormula)),

    // If block
    ifEnd: r => chunkParser('{{/if}}'),
    ifElse: r => P.seq(chunkParser('{{else}}'),r.ifEnd),
    ifNoElse: r => r.ifEnd.map(x => [x,'']),
    ifBlock: r => P.seq(r.variableName,P.alt(r.ifElse,r.ifNoElse)).map(mkConditional),
    ifBlockCont: r => P.seq(chunkParser('{{#if').map(mkText).skip(whitespace),r.ifBlock),

    // With block
    withEnd: r => chunkParser('{{/with}}'),
    withBlock: r => P.seq(r.variableName,r.clauseContent.many(),r.withEnd.map(mkText)).map(mkWith),
    withBlockCont: r => P.seq(chunkParser('{{#with').map(mkText).skip(whitespace),r.withBlock),

    // UList block
    ulistEnd: r => chunkParser('{{/ulist}}'),
    ulistBlock: r => P.seq(r.variableName,r.clauseContent.many(),r.ulistEnd.map(mkText)).map(mkUlist),
    ulistBlockCont: r => P.seq(chunkParser('\n{{#ulist').map(mkText).skip(whitespace),r.ulistBlock),

    // OList block
    olistEnd: r => chunkParser('{{/olist}}'),
    olistBlock: r => P.seq(r.variableName,r.clauseContent.many(),r.olistEnd.map(mkText)).map(mkOlist),
    olistBlockCont: r => P.seq(chunkParser('\n{{#olist').map(mkText).skip(whitespace),r.olistBlock),

    // Clause templates
    clauseContent: r => P.alt(r.withBlockCont,r.ulistBlockCont,r.olistBlockCont,r.ifBlockCont,r.formulaChunk,r.varChunk),
    clauseTop: r => P.seq(r.clauseContent.many().map(flatten),r.templateEnd).map(flatten),

    // Clause block
    clauseEnd: r => chunkParser('\n{{/clause}}').skip(P.seq(whitespaceLine,P.string('\n'))),
    clauseBlock: r => P.seq(r.variableNameNL,r.clauseContent.many(),r.clauseEnd.map(mkText)).map(mkClause),
    clauseBlockCont: r => P.seq(chunkParser('\n{{#clause').map(mkText).skip(whitespace),r.clauseBlock),

    // Contract templates
    contractContent: r => P.alt(r.clauseBlockCont,r.clauseContent),
    contractChunks: r => r.contractContent.many().map(flatten),
    contractTop: r => P.seq(r.contractChunks,r.templateEnd).map(flatten),

});

module.exports = TemplateParser;
