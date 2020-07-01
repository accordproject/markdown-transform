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

const rules = {};
// Inlines
rules.Code = (thing,children,parameters,resultSeq) => {
    const nodeText = thing.text ? thing.text : '';
    const next = `\`${nodeText}\``;
    resultSeq(parameters,next);
};
rules.Emph = (thing,children,parameters,resultSeq) => {
    const next = `*${children}*`;
    resultSeq(parameters,next);
};
rules.Strong = (thing,children,parameters,resultSeq) => {
    const next = `**${children}**`;
    resultSeq(parameters,next);
};
rules.Link = (thing,children,parameters,resultSeq) => {
    const next = `[${children}](${thing.destination} "${thing.title ? thing.title : ''}")`;
    resultSeq(parameters,next);
};
rules.Image = (thing,children,parameters,resultSeq) => {
    const next = `![${children}](${thing.destination} "${thing.title ? thing.title : ''}")`;
    resultSeq(parameters,next);
};
rules.HtmlInline = (thing,children,parameters,resultSeq) => {
    const next = thing.text ? thing.text : '';
    resultSeq(parameters,next);
};
rules.Linebreak = (thing,children,parameters,resultSeq) => {
    const next = `\\${CommonMarkUtils.mkPrefix(parameters,1)}`;
    resultSeq(parameters,next);
};
rules.Softbreak = (thing,children,parameters,resultSeq) => {
    const next = CommonMarkUtils.mkPrefix(parameters,1);
    resultSeq(parameters,next);
};
rules.Text = (thing,children,parameters,resultSeq) => {
    const next = CommonMarkUtils.escapeText(thing.text ? thing.text : '');
    resultSeq(parameters,next);
};
// Leaf blocks
rules.ThematicBreak = (thing,children,parameters,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    resultSeq(parameters,next1);
    const next2 = '---';
    resultSeq(parameters,next2);
};
rules.Heading = (thing,children,parameters,resultSeq) => {
    const level = parseInt(thing.level);
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    resultSeq(parameters,next1);
    if (level < 3 && children !== '') {
        const next2 = children;
        resultSeq(parameters,next2);
        CommonMarkUtils.nextNode(parameters);
        const next3 = CommonMarkUtils.mkPrefix(parameters,1);
        resultSeq(parameters,next3);
        const next4 = CommonMarkUtils.mkSetextHeading(level);
        resultSeq(parameters,next4);
    } else {
        const next2 = CommonMarkUtils.mkATXHeading(level);
        resultSeq(parameters,next2);
        const next3 = ' ';
        resultSeq(parameters,next3);
        const next4 = children;
        resultSeq(parameters,next4);
    }
};
rules.CodeBlock = (thing,children,parameters,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    resultSeq(parameters,next1);
    const next2 = `\`\`\`${thing.info ? ' ' + thing.info : ''}\n${CommonMarkUtils.escapeCodeBlock(thing.text)}\`\`\``;
    resultSeq(parameters,next2);
};
rules.HtmlBlock = (thing,children,parameters,resultSeq) => {
    const nodeText = thing.text ? thing.text : '';
    const next1 = CommonMarkUtils.mkPrefix(parameters,2);
    resultSeq(parameters,next1);
    const next2 = nodeText;
    resultSeq(parameters,next2);
};
rules.Paragraph = (thing,children,parameters,resultSeq) => {
    const next1 = CommonMarkUtils.mkPrefix(parameters,parameters.first ? 1 : 2);
    resultSeq(parameters,next1);
    const next2 = `${children}`;
    resultSeq(parameters,next2);
};
// Container blocks
rules.BlockQuote = (thing,children,parameters,resultSeq) => {
    const next = children;
    resultSeq(parameters,next);
};
rules.Item = (thing,children,parameters,resultSeq) => {
    //console.log('ITEM! ' + JSON.stringify(parameters));
    const level = parameters.tight && parameters.tight === 'false' && parameters.index !== parameters.indexInit ? 2 : 1;
    if(parameters.type === 'ordered') {
        const next = `${CommonMarkUtils.mkPrefix(parameters,level)}${parameters.index}. ${children}`;
        resultSeq(parameters,next);
    }
    else {
        const next = `${CommonMarkUtils.mkPrefix(parameters,level)}-  ${children}`;
        resultSeq(parameters,next);
    }
};
rules.List = (thing,children,parameters,resultSeq) => {
    const next = `${children}`;
    resultSeq(parameters,next);
};
rules.Document = (thing,children,parameters,resultSeq) => {
    const next = children;
    resultSeq(parameters,next);
};

module.exports = rules;