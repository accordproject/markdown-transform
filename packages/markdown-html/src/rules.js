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
const { isIgnorable } = require('./helpers');


/**
 * A rule to deserialize text nodes.
 * @type {Object}
 */
const TEXT_RULE = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'br') {
            // add Linebreak node in ciceromark
            return;
        }

        // text nodes will be of type 3
        if (el.nodeType === 3 && !isIgnorable(el)) {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}${'Text'}`,
                text: el.nodeValue,
            };
        }
    }
};

// TODO: need to get delimiter, start, and tight properties
// make sure these are getting set as attributes when we create the html
/**
 * A rule to deserialize list nodes.
 * @type {Object}
 */
const LIST_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'ul') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
                type: 'bullet',
                nodes: next(el.childNodes)
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'ol') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
                type: 'ordered',
                nodes: next(el.childNodes)
            };
        }

        if (el.tagName && el.tagName.toLowerCase() === 'li') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
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
                '$class': `${NS_PREFIX_CommonMarkModel}Paragraph`,
                nodes: next(el.childNodes)
            };
        }
    }
};

/**
 * A rule to deserialize strong (bold) nodes.
 * @type {Object}
 */
const STRONG_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'strong') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Strong`,
                nodes: next(el.childNodes)
            };
        }
    }
};

/**
 * A rule to deserialize emph (italic) nodes.
 * @type {Object}
 */
const EMPH_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'em') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Emph`,
                nodes: next(el.childNodes)
            };
        }
    }
};

// TODO: need to get href (destination) and title(?)
/**
 * A rule to deserialize link nodes.
 * @type {Object}
 */
const LINK_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Link`,
                nodes: next(el.childNodes),
                title: el.nodeValue // TODO: this might not be correct
            };
        }
    }
};

/**
 * A rule to deserialize heading nodes (all levels).
 * @type {Object}
 */
const HEADING_RULE = {
    deserialize(el, next) {
        if (el.tagName) {
            let level;
            switch (el.tagName.toLowerCase()) {
            case 'h1':
                level = '1';
                break;
            case 'h2':
                level = '2';
                break;
            case 'h3':
                level = '3';
                break;
            case 'h4':
                level = '4';
                break;
            case 'h5':
                level = '5';
                break;
            case 'h6':
                level = '6';
                break;
            default:
                level = null;
            }
            if (level) {
                return {
                    '$class': `${NS_PREFIX_CommonMarkModel}Heading`,
                    nodes: next(el.childNodes),
                    level,
                };
            }
        }
    }
};

/**
 * A rule to deserialize thematic break nodes.
 * @type {Object}
 */
const THEMATIC_BREAK_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'hr') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}ThematicBreak`,
                nodes: next(el.childNodes),
            };
        }
    }
};


const rules = [
    LIST_RULE,
    PARAGRAPH_RULE,
    STRONG_RULE,
    EMPH_RULE,
    LINK_RULE,
    HEADING_RULE,
    THEMATIC_BREAK_RULE,
    TEXT_RULE,
];


module.exports = rules;