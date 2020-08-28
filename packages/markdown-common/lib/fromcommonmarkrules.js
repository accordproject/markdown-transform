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

const CommonMarkUtils = require('./CommonMarkUtils');

/**
 * get text from a thing
 * @param {object} thing - the thing
 * @param {string} field - the field where to look for the text
 * @param {*} escapeFun - optional function for escaping the text
 * @return {string} the text in the thing
 */
function getText(thing,field,escapeFun) {
    const text = thing[field] ? thing[field] : '';
    if(escapeFun) {
        return escapeFun(text);
    } else {
        return text;
    }
}

const rules = {};
// Inlines
rules.Code = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next = `\`${getText(thing,'text')}\``;
    const result = [resultString(next)];
    resultSeq(parameters,result);
};
rules.Emph = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('*'),children,resultString('*')];
    resultSeq(parameters,result);
};
rules.Strong = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [resultString('**'),children,resultString('**')];
    resultSeq(parameters,result);
};
rules.Link = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = '[';
    const next2 = `](${thing.destination} "${getText(thing,'title')}")`;
    const result = [resultString(next1),children,resultString(next2)];
    resultSeq(parameters,result);
};
rules.Image = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = '![';
    const next2 = `](${thing.destination} "${getText(thing,'title')}")`;
    const result = [resultString(next1),children,resultString(next2)];
    resultSeq(parameters,result);
};
rules.HtmlInline = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next = getText(thing,'text');
    const result = [resultString(next)];
    resultSeq(parameters,result);
};
rules.Linebreak = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next = `\\${CommonMarkUtils.mkPrefix(parameters,1)}`;
    const result = [resultString(next)];
    resultSeq(parameters,result);
};
rules.Softbreak = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next = CommonMarkUtils.mkPrefix(parameters,1);
    const result = [resultString(next)];
    resultSeq(parameters,result);
};
rules.Text = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next = getText(thing,'text',CommonMarkUtils.escapeText);
    const result = [resultString(next)];
    resultSeq(parameters,result);
};
// Leaf blocks
rules.ThematicBreak = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    const next2 = '---';
    const result = [resultString(next1),resultString(next2)];
    resultSeq(parameters,result);
};
rules.Heading = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const level = parseInt(thing.level);
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    if (level < 3 && children !== '') { // XXX empty children -- how to generalize that?
        CommonMarkUtils.nextNode(parameters);
        const next3 = CommonMarkUtils.mkPrefix(parameters,1);
        const next4 = CommonMarkUtils.mkSetextHeading(level);
        const result = [resultString(next1),children,resultString(next3),resultString(next4)];
        resultSeq(parameters,result);
    } else {
        const next2 = CommonMarkUtils.mkATXHeading(level);
        const next3 = ' ';
        const result = [resultString(next1),resultString(next2),resultString(next3),children];
        resultSeq(parameters,result);
    }
};
rules.CodeBlock = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const prefix = CommonMarkUtils.mkPrefix(parameters,2);
    const newLine = CommonMarkUtils.mkNewLine(parameters);
    const next1 = `${prefix}\`\`\` ${getText(thing,'info')}`;
    const lines = getText(thing,'text',CommonMarkUtils.escapeCodeBlock).split('\n');
    const next2 = `${newLine}${lines.join(newLine)}\`\`\``;
    const result = [resultString(next1),resultString(next2)];
    resultSeq(parameters,result);
};
rules.HtmlBlock = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const nodeText = getText(thing,'text');
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    const next2 = nodeText;
    const result = [resultString(next1),resultString(next2)];
    resultSeq(parameters,result);
};
rules.Paragraph = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,parameters.first ? 1 : 2);
    const result = [resultString(next1),children];
    resultSeq(parameters,result);
};
// Container blocks
rules.BlockQuote = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [children];
    resultSeq(parameters,result);
};
rules.Item = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const level = parameters.tight && parameters.tight === 'false' && parameters.index !== parameters.indexInit ? 2 : 1;
    if(parameters.type === 'ordered') {
        const next1 = `${CommonMarkUtils.mkPrefix(parameters,level)}${parameters.index}. `;
        const result = [resultString(next1),children];
        resultSeq(parameters,result);
    } else {
        const next1 = `${CommonMarkUtils.mkPrefix(parameters,level)}-  `;
        const result = [resultString(next1),children];
        resultSeq(parameters,result);
    }
};
rules.List = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [children];
    resultSeq(parameters,result);
};
rules.Document = (visitor,thing,children,parameters,resultString,resultSeq) => {
    const result = [children];
    resultSeq(parameters,result);
};

module.exports = rules;