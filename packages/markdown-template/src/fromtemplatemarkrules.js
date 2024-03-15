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

const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;

const rules = {};
// Inlines
rules.VariableDefinition =  (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('{{'),resultString(thing.name),resultString('}}')];
    resultSeq(parameters,result);
};
rules.FormattedVariableDefinition =  (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('{{'),resultString(thing.name),resultString(' as "'),resultString(thing.format),resultString('"}}')];
    resultSeq(parameters,result);
};
rules.EnumVariableDefinition =  (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('{{'),resultString(thing.name),resultString('}}')];
    resultSeq(parameters,result);
};
rules.FormulaDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('{{%'),resultString(thing.code),resultString('%}}')];
    resultSeq(parameters,result);
};
rules.ConditionalDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = `{{#if ${thing.name}}}`;
    const whenTrue = visitor.visitChildren(visitor,thing,parameters,'whenTrue');
    const whenFalse = visitor.visitChildren(visitor,thing,parameters,'whenFalse');
    const next2 = '{{/if}}';
    let result;
    if (whenFalse) {
        const next3 = '{{else}}';
        result = [resultString(next1),resultString(whenTrue),resultString(next3),resultString(whenFalse),resultString(next2)];
    } else {
        result = [resultString(next1),resultString(whenTrue),resultString(next2)];
    }
    resultSeq(parameters,result);
};
rules.OptionalDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = `{{#optional ${thing.name}}}`;
    const whenSome = visitor.visitChildren(visitor,thing,parameters,'whenSome');
    const whenNone = visitor.visitChildren(visitor,thing,parameters,'whenNone');
    const next2 = '{{/optional}}';
    let result;
    if (whenNone) {
        const next3 = '{{else}}';
        result = [resultString(next1),resultString(whenSome),resultString(next3),resultString(whenNone),resultString(next2)];
    } else {
        result = [resultString(next1),resultString(whenSome),resultString(next2)];
    }
    resultSeq(parameters,result);
};
rules.WithDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = `{{#with ${thing.name}}}`;
    const next2 = '{{/with}}';
    const result = [resultString(next1),children,resultString(next2)];
    resultSeq(parameters,result);
};
rules.JoinDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const sepAttr = thing.separator ? ' separator="' + thing.separator + '"' : '';
    const localeAttr = thing.locale ? ' locale="' + thing.locale + '"' : '';
    const typeAttr = thing.type ? ' type="' + thing.type + '"' : '';
    const styleAttr = thing.style ? ' style="' + thing.style + '"' : '';

    const next1 = `{{#join ${thing.name}${sepAttr}${localeAttr}${typeAttr}${styleAttr}}}`;
    const next2 = '{{/join}}';
    const result = [resultString(next1),children,resultString(next2)];
    resultSeq(parameters,result);
};
// Container blocks
rules.ListBlockDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    let listKind;
    if(this.type === 'bullete'){
        listKind = 'ulist';
    }else if(this.type == 'roman'){
        listKind = 'rlist';
    }else{
        listKind = 'olist';
    }
    const prefix = CommonMarkUtils.mkPrefix(parameters,1);
    const next1 = prefix;
    const next2 = `{{#${listKind} ${thing.name}}}\n`;
    const next3 = prefix;
    const next4 = `{{/${listKind}}}`;
    const result = [resultString(next1),resultString(next2),children,resultString(next3),resultString(next4)];
    resultSeq(parameters,result);
};
rules.ClauseDefinition = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    const srcAttr = thing.src ? ' src="' + thing.src + '"' : '';
    const next2 = `{{#clause ${thing.name}${srcAttr}}}\n`;
    const next3 = '\n{{/clause}}';
    const result = [resultString(next1),resultString(next2),children,resultString(next3)];
    resultSeq(parameters,result);
};

module.exports = rules;