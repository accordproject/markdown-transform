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
const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;


/**
 * A rule to deserialize text nodes.
 * @type {Object}
 */
const TEXT_RULE = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'br') {
            return;
        }

        if (el.nodeName === '#text') {
            if (!el.nodeValue ||  el.nodeValue.match(/<!--.*?-->/)) {
                return;
            }
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'Text'}`,
                text: el.nodeValue,
            };
        }
    }
};

/**
 * A rule to deserialize list nodes.
 * @type {Object}
 */
const LIST_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'ul') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'List'}`,
                type: 'bullet',
                nodes: next(el.childNodes)
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'ol') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'List'}`,
                type: 'ordered',
                nodes: next(el.childNodes)
            };
        }

        if (el.tagName && el.tagName.toLowerCase() === 'li') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'Item'}`,
                nodes: next(el.childNodes)
            };
        }
    }
};

/**
 * A rule to deserialize paragraph nodes.
 * @type {Object}
 */
const PARAGRAPH_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'p') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'Paragraph'}`,
                nodes: next(el.childNodes)
            };
        }
    }
};


const rules = [
    LIST_RULE,
    PARAGRAPH_RULE,
    TEXT_RULE,
];


module.exports = rules;