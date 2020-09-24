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

const toslateutil = require('./toslateutil');

const rules = {};

rules.CodeBlock = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'code_block',
        data: {},
        children: [{
            object: 'block',
            type: 'paragraph',
            children: [{
                object: 'text',
                text: thing.text
            }],
            data: {}
        }]
    };
};
rules.Code = (thing,processChildren,parameters) => {
    return {
        object: 'text',
        text: thing.text,
        code: true
    };
};
rules.Emph = (thing,processChildren,parameters) => {
    parameters.emph = true;
    return processChildren(thing,'nodes',parameters);
};
rules.Strong = (thing,processChildren,parameters) => {
    parameters.strong = true;
    return processChildren(thing,'nodes',parameters);
};
rules.Text = (thing,processChildren,parameters) => {
    return toslateutil.handleFormattedText(thing, parameters);
};
rules.BlockQuote = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'block_quote',
        block_quote: true,
        children: processChildren(thing,'nodes',parameters),
        data: {}
    };
};
rules.Heading = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        data: {},
        type: toslateutil.getHeadingType(thing),
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.ThematicBreak = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'horizontal_rule',
        hr: true,
        children: []
    };
};
rules.Linebreak = (thing,processChildren,parameters) => {
    return {
        object: 'inline',
        type: 'linebreak'
    };
};
rules.Softbreak = (thing,processChildren,parameters) => {
    return {
        object: 'inline',
        type: 'softbreak'
    };
};
rules.Link = (thing,processChildren,parameters) => {
    return {
        object: 'inline',
        type: 'link',
        data: {
            href: thing.destination,
            title: thing.title ? thing.title : ''
        },
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.Image = (thing,processChildren,parameters) => {
    return {
        object: 'inline',
        type: 'image',
        data: {
            'href': thing.destination,
            'title': thing.title ? thing.title : ''
        },
        children: [
            {
                'object': 'text',
                'text': thing.text ? thing.text : ''
            }
        ]
    };
};
rules.Paragraph = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'paragraph',
        children: processChildren(thing,'nodes',parameters),
        data: {}
    };
};
rules.HtmlBlock = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'html_block',
        data: {},
        children: [{
            object: 'block',
            type: 'paragraph',
            children: [{
                object: 'text',
                text: thing.text,
                html: true
            }],
            data: {}
        }]
    };
};
rules.HtmlInline = (thing,processChildren,parameters) => {
    return {
        object: 'inline',
        type: 'html_inline',
        data: {
            content: thing.text,
        },
        children: [] // XXX
    };
};
rules.List = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        data: { tight: thing.tight, start: thing.start, delimiter: thing.delimiter},
        type: thing.type === 'ordered' ? 'ol_list' : 'ul_list',
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.Item = (thing,processChildren,parameters) => {
    return {
        object: 'block',
        type: 'list_item',
        data: {},
        children: processChildren(thing,'nodes',parameters)
    };
};
rules.Document = (thing,processChildren,parameters) => {
    return {
        object: 'document',
        children: processChildren(thing,'nodes',parameters),
        data : {}
    };
};

module.exports = rules;