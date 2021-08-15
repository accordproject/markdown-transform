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
const CommonMarkUtils = require('@accordproject/markdown-common').CommonMarkUtils;
const { NS_PREFIX_CiceroMarkModel } = require('@accordproject/markdown-cicero').CiceroMarkModel;
const { isIgnorable } = require('./helpers');

/**
 * A rule to deserialize text nodes.
 * @type {Object}
 */
const TEXT_RULE = {
    deserialize(el, next, ignoreSpace) {
        // text nodes will be of type 3
        if (el.nodeType === 3 && !isIgnorable(el, ignoreSpace)) {
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
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'ul') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
                type: 'bullet',
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : true,
                nodes: next(el.childNodes, ignoreSpace)
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'ol') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}List`,
                type: 'ordered',
                delimiter: el.getAttribute('delimiter'),
                start: el.getAttribute('start'),
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : true,
                nodes: next(el.childNodes, ignoreSpace)
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
 * A rule to deserialize linebreak nodes.
 * @type {Object}
 */
const LINEBREAK_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'br') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Linebreak`
            };
        }
    }
};

/**
 * A rule to deserialize paragraph nodes.
 * @type {Object}
 */
const PARAGRAPH_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'p') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Paragraph`,
                nodes: next(el.childNodes, false)
            };
        }
    }
};

/**
 * A rule to deserialize strong (bold) nodes.
 * @type {Object}
 */
const STRONG_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'strong') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Strong`,
                nodes: next(el.childNodes, ignoreSpace)
            };
        }
    }
};

/**
 * A rule to deserialize emph (italic) nodes.
 * @type {Object}
 */
const EMPH_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'em') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Emph`,
                nodes: next(el.childNodes, ignoreSpace)
            };
        }
    }
};

/**
 * A rule to deserialize s (strikethrough) nodes.
 * @type {Object}
 */
const STRIKETHROUGH_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 's') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Strikethrough`,
                nodes: next(el.childNodes, ignoreSpace)
            };
        }
    }
};

/**
 * A rule to deserialize link nodes.
 * @type {Object}
 */
const LINK_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Link`,
                nodes: next(el.childNodes, ignoreSpace),
                destination: el.getAttribute('href') ? el.getAttribute('href') : 'none',
                title: el.getAttribute('title') ? el.getAttribute('title') : '',
            };
        }
    }
};

/**
 * A rule to deserialize link nodes.
 * @type {Object}
 */
const IMAGE_RULE = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'img') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}Image`,
                nodes: next(el.childNodes, ignoreSpace),
                destination: el.getAttribute('src') ? el.getAttribute('src') : 'none',
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
    deserialize(el, next, ignoreSpace) {
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
                    nodes: next(el.childNodes, false),
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
    deserialize(el, next, ignoreSpace) {
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
//     deserialize(el, next, ignoreSpace) {
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
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'code_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code')
            {
                const info = children[0].getAttribute('data-ciceromark');
                if (info) {
                    const decodedInfo = decodeURIComponent(info);
                    const tag = CommonMarkUtils.parseHtmlBlock(decodedInfo);
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
    deserialize(el, next, ignoreSpace) {
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
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'blockquote') {
            return {
                '$class': `${NS_PREFIX_CommonMarkModel}BlockQuote`,
                nodes: next(el.childNodes, ignoreSpace)
            };
        }
    }
};

/**
 * A rule to deserialize clause nodes.
 * @type {Object}
 */
const CLAUSE_RULE = {
    deserialize(el, next, ignoreSpace) {
        const tag = el.tagName;
        if (tag && tag.toLowerCase() === 'div' && el.getAttribute('class') === 'clause') {
            const clause = {
                '$class': `${NS_PREFIX_CiceroMarkModel}Clause`,
                name: el.getAttribute('name'),
                nodes: next(el.childNodes, false)
            };
            if (el.getAttribute('elementType')) {
                clause.elementType = el.getAttribute('elementType');
            }
            if (el.getAttribute('src')) {
                clause.src = el.getAttribute('src');
            }
            return clause;
        }
    }
};

/**
 * A rule to deserialize variable nodes.
 * @type {Object}
 */
const VARIABLE_RULE = {
    deserialize(el, next, ignoreSpace) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'variable') {
            let variable;
            if (el.getAttribute('format')) {
                variable = {
                    '$class': `${NS_PREFIX_CiceroMarkModel}FormattedVariable`,
                    name: el.getAttribute('name'),
                    value: el.textContent,
                    format: el.getAttribute('format')
                };
            } else if (el.getAttribute('enumValues')) {
                variable = {
                    '$class': `${NS_PREFIX_CiceroMarkModel}EnumVariable`,
                    name: el.getAttribute('name'),
                    value: el.textContent,
                    enumValues: JSON.parse(decodeURIComponent(el.getAttribute('enumValues'))),
                };
            } else {
                variable = {
                    '$class': `${NS_PREFIX_CiceroMarkModel}Variable`,
                    name: el.getAttribute('name'),
                    value: el.textContent,
                };
            }
            if (el.getAttribute('elementType')) {
                variable.elementType = el.getAttribute('elementType');
            }
            if (el.getAttribute('identifiedBy')) {
                variable.identifiedBy = el.getAttribute('identifiedBy');
            }
            return variable;
        }
    }
};

/**
 * A rule to deserialize conditional nodes.
 * @type {Object}
 */
const CONDITIONAL_RULE = {
    deserialize(el, next, ignoreSpace) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'conditional') {
            const text = el.textContent;
            const whenTrueText = el.getAttribute('whenTrue') ? el.getAttribute('whenTrue') : '';
            const whenFalseText = el.getAttribute('whenFalse') ? el.getAttribute('whenFalse') : '';
            return {
                '$class': `${NS_PREFIX_CiceroMarkModel}Conditional`,
                name: el.getAttribute('name'),
                isTrue: text === whenTrueText,
                whenTrue: whenTrueText ? [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: whenTrueText,
                }] : [],
                whenFalse: whenFalseText ? [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: whenFalseText,
                }] : [],
                nodes: [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: text,
                }],
            };
        }
    }
};

/**
 * A rule to deserialize optional nodes.
 * @type {Object}
 */
const OPTIONAL_RULE = {
    deserialize(el, next, ignoreSpace) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'optional') {
            const text = el.textContent;
            const whenSomeText = el.getAttribute('whenSome') ? el.getAttribute('whenSome') : '';
            const whenNoneText = el.getAttribute('whenNone') ? el.getAttribute('whenNone') : '';
            return {
                '$class': `${NS_PREFIX_CiceroMarkModel}Optional`,
                name: el.getAttribute('name'),
                hasSome: text === whenSomeText,
                whenSome: whenSomeText ? [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: whenSomeText,
                }] : [],
                whenNone: whenNoneText ? [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: whenNoneText,
                }] : [],
                nodes: [{
                    '$class': `${NS_PREFIX_CommonMarkModel}Text`,
                    text: text,
                }],
            };
        }
    }
};

/**
 * A rule to deserialize formulas
 * @type {Object}
 */
const FORMULA_RULE = {
    deserialize(el, next, ignoreSpace) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'formula') {
            const formula = {
                '$class': `${NS_PREFIX_CiceroMarkModel}Formula`,
                name: el.getAttribute('name'),
                value: el.textContent,
            };
            if (el.getAttribute('code')) {
                formula.code = decodeURIComponent(el.getAttribute('code'));
            }
            if (el.getAttribute('dependencies')) {
                formula.dependencies = JSON.parse(decodeURIComponent(el.getAttribute('dependencies')));
            }
            return formula;
        }
    }
};

/**
 * A rule to deserialize html inline nodes.
 * @type {Object}
 */
const HTML_INLINE_RULE = {
    deserialize(el, next, ignoreSpace) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'html_inline') {
            {
                const text = el.innerHTML;
                const tag = CommonMarkUtils.parseHtmlBlock(text);
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
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'html_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code')
            {
                const text = children[0].innerHTML;
                const tag = CommonMarkUtils.parseHtmlBlock(text);
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
    STRIKETHROUGH_RULE,
    LINK_RULE,
    HEADING_RULE,
    THEMATIC_BREAK_RULE,
    LINEBREAK_RULE,
    CODE_BLOCK_RULE,
    INLINE_CODE_RULE,
    BLOCK_QUOTE_RULE,
    CLAUSE_RULE,
    VARIABLE_RULE,
    CONDITIONAL_RULE,
    OPTIONAL_RULE,
    FORMULA_RULE,
    TEXT_RULE,
    HTML_INLINE_RULE,
    HTML_BLOCK_RULE,
    IMAGE_RULE
];


module.exports = rules;