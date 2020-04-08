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
const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;
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
            const textArray = el.nodeValue.split('\n');
            const textNodes =  textArray.map(text => {
                if (text) {
                    return {
                        '$class': `${NS_PREFIX_CommonMarkModel}${'Text'}`,
                        text,
                    };
                }
            });

            const result = [...textNodes].map((node, i) => i < textNodes.length - 1 ? [node, { '$class': `${NS_PREFIX_CommonMarkModel}${'Softbreak'}` }] : [node]).reduce((a, b) => a.concat(b)).filter(n => !!n);
            return result;
        }
    }
};

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
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : true,
                nodes: next(el.childNodes)
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'ol') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
                type: 'ordered',
                delimiter: el.getAttribute('delimiter'),
                start: el.getAttribute('start'),
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : true,
                nodes: next(el.childNodes)
            };
        }

        if (el.tagName && el.tagName.toLowerCase() === 'li') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Item`,
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
                destination: el.getAttribute('href'),
                title: el.getAttribute('title') ? el.getAttribute('title') : '',
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
            };
        }
    }
};

/**
 * A rule to deserialize html block nodes.
 * @type {Object}
 */
// Look at common mark dingus and see how they are mapping html blocks
// TODO: figure out how to handle custom html blocks (could be anything?)
// const HTML_BLOCK_RULE = {
//     deserialize(el, next) {
//         if (el.tagName ) {
//             return {
//                 '$class': `${NS_PREFIX_CommonMarkModel}HtmlBlock`,
//             };
//         }
//     }
// };

/**
 * A rule to deserialize code block nodes.
 * @type {Object}
 */
const CODE_BLOCK_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'code_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code')
            {
                const info = children[0].getAttribute('data-ciceromark');
                if (info) {
                    const decodedInfo = decodeURIComponent(info);
                    const tag = CommonMarkTransformer.parseHtmlBlock(decodedInfo);
                    return {
                        '$class': `${NS_PREFIX_CommonMarkModel}CodeBlock`,
                        text: children[0].textContent,
                        info: decodedInfo,
                        tag,
                    };
                } else  {
                    return {
                        '$class': `${NS_PREFIX_CommonMarkModel}CodeBlock`,
                        text: children[0].textContent,
                    };
                }
            }
        }
    }
};

/**
 * A rule to deserialize inline code nodes.
 * @type {Object}
 */
const INLINE_CODE_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'code') {
            {
                return {
                    '$class': `${NS_PREFIX_CommonMarkModel}Code`,
                    text: el.textContent,
                };
            }
        }
    }
};

/**
 * A rule to deserialize block quote nodes.
 * @type {Object}
 */
const BLOCK_QUOTE_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'blockquote') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}BlockQuote`,
                nodes: next(el.childNodes)
            };
        }
    }
};

/**
 * A rule to deserialize clause nodes.
 * @type {Object}
 */
const CLAUSE_RULE = {
    deserialize(el, next) {
        const tag = el.tagName;
        if (tag && tag.toLowerCase() === 'div' && el.getAttribute('class') === 'clause') {
            return {
                '$class': `${NS_PREFIX_CiceroMarkModel}Clause`,
                clauseid: el.getAttribute('clauseid'),
                src: el.getAttribute('src'),
                nodes: next(el.childNodes)
            };
        }
    }
};

/**
 * A rule to deserialize variable nodes.
 * @type {Object}
 */
const VARIABLE_RULE = {
    deserialize(el, next) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'variable') {
            if (el.getAttribute('format')) {
                return {
                    '$class': `${NS_PREFIX_CiceroMarkModel}Variable`,
                    id: el.getAttribute('id'),
                    value: el.textContent,
                    format: el.getAttribute('format')
                };
            } else {
                return {
                    '$class': `${NS_PREFIX_CiceroMarkModel}Variable`,
                    id: el.getAttribute('id'),
                    value: el.textContent,
                };
            }
        }
    }
};

/**
 * A rule to deserialize conditional variable nodes.
 * @type {Object}
 */
const CONDITIONAL_VARIABLE_RULE = {
    deserialize(el, next) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'conditional') {
            return {
                '$class': `${NS_PREFIX_CiceroMarkModel}ConditionalVariable`,
                id: el.getAttribute('id'),
                whenTrue: el.getAttribute('whenTrue'),
                whenFalse: el.getAttribute('whenFalse'),
                value: el.textContent,
            };
        }
    }
};

/**
 * A rule to deserialize computed variable nodes.
 * @type {Object}
 */
const COMPUTED_VARIABLE_RULE = {
    deserialize(el, next) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'computed') {
            return {
                '$class': `${NS_PREFIX_CiceroMarkModel}ComputedVariable`,
                value: el.textContent,
            };
        }
    }
};

/**
 * A rule to deserialize softbreak nodes.
 * @type {Object}
 */
const SOFTBREAK_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'wbr') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Softbreak`,
            };
        }
    }
};

/**
 * A rule to deserialize html inline nodes.
 * @type {Object}
 */
const HTML_INLINE_RULE = {
    deserialize(el, next) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'html_inline') {
            {
                const text = el.innerHTML;
                const tag = CommonMarkTransformer.parseHtmlBlock(text);
                return {
                    '$class': `${NS_PREFIX_CommonMarkModel}HtmlInline`,
                    text: text,
                    tag,
                };
            }
        }
    }
};

/**
 * A rule to deserialize html block nodes.
 * @type {Object}
 */
const HTML_BLOCK_RULE = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'html_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code')
            {
                const text = children[0].innerHTML;
                const tag = CommonMarkTransformer.parseHtmlBlock(text);
                return {
                    '$class': `${NS_PREFIX_CommonMarkModel}HtmlBlock`,
                    text: text,
                    tag,
                };
            }
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
    CODE_BLOCK_RULE,
    INLINE_CODE_RULE,
    BLOCK_QUOTE_RULE,
    CLAUSE_RULE,
    VARIABLE_RULE,
    CONDITIONAL_VARIABLE_RULE,
    SOFTBREAK_RULE,
    COMPUTED_VARIABLE_RULE,
    TEXT_RULE,
    HTML_INLINE_RULE,
    HTML_BLOCK_RULE,
];


module.exports = rules;