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

import { CommonMarkUtils, CiceroMarkModel, CommonMarkModel } from '@accordproject/markdown-common';
import { isIgnorable } from './helpers';

export interface Rule {
    deserialize(el: any, next: (children: any, ignoreSpace?: boolean) => any, ignoreSpace?: boolean): any;
}

const TEXT_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.nodeType === 3 && !isIgnorable(el, !!ignoreSpace)) {
            const textArray: string[] = el.nodeValue.split('\n');
            const textNodes = textArray.map((text) => {
                if (text) {
                    return {
                        '$class': `${CommonMarkModel.NAMESPACE}.Text`,
                        text,
                    };
                }
            });

            const result = [...textNodes]
                .map((node, i) => i < textNodes.length - 1 ? [node, { '$class': `${CommonMarkModel.NAMESPACE}.Softbreak` }] : [node])
                .reduce((a, b) => a.concat(b))
                .filter((n) => !!n);
            return result;
        }
    },
};

const LIST_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'ul') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.List`,
                type: 'bullet',
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : 'true',
                nodes: next(el.childNodes, ignoreSpace),
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'ol') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.List`,
                type: 'ordered',
                delimiter: el.getAttribute('delimiter'),
                start: el.getAttribute('start'),
                tight: el.getAttribute('tight') ? el.getAttribute('tight') : 'true',
                nodes: next(el.childNodes, ignoreSpace),
            };
        }

        if (el.tagName && el.tagName.toLowerCase() === 'li') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Item`,
                nodes: next(el.childNodes),
            };
        }
    },
};

const LINEBREAK_RULE: Rule = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'br') {
            return { '$class': `${CommonMarkModel.NAMESPACE}.Linebreak` };
        }
    },
};

const PARAGRAPH_RULE: Rule = {
    deserialize(el, next) {
        if (el.tagName && el.tagName.toLowerCase() === 'p') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Paragraph`,
                nodes: next(el.childNodes, false),
            };
        }
    },
};

const STRONG_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'strong') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Strong`,
                nodes: next(el.childNodes, ignoreSpace),
            };
        }
    },
};

const EMPH_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'em') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Emph`,
                nodes: next(el.childNodes, ignoreSpace),
            };
        }
    },
};

const LINK_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'a') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Link`,
                nodes: next(el.childNodes, ignoreSpace),
                destination: el.getAttribute('href') ? el.getAttribute('href') : 'none',
                title: el.getAttribute('title') ? el.getAttribute('title') : '',
            };
        }
    },
};

const IMAGE_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'img') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Image`,
                nodes: next(el.childNodes, ignoreSpace),
                destination: el.getAttribute('src') ? el.getAttribute('src') : 'none',
                title: el.getAttribute('title') ? el.getAttribute('title') : '',
            };
        }
    },
};

const HEADING_RULE: Rule = {
    deserialize(el, next) {
        if (el.tagName) {
            let level: string | null;
            switch (el.tagName.toLowerCase()) {
                case 'h1': level = '1'; break;
                case 'h2': level = '2'; break;
                case 'h3': level = '3'; break;
                case 'h4': level = '4'; break;
                case 'h5': level = '5'; break;
                case 'h6': level = '6'; break;
                default: level = null;
            }
            if (level) {
                return {
                    '$class': `${CommonMarkModel.NAMESPACE}.Heading`,
                    nodes: next(el.childNodes, false),
                    level,
                };
            }
        }
    },
};

const THEMATIC_BREAK_RULE: Rule = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'hr') {
            return { '$class': `${CommonMarkModel.NAMESPACE}.ThematicBreak` };
        }
    },
};

const CODE_BLOCK_RULE: Rule = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'code_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code') {
                const info = children[0].getAttribute('data-ciceromark');
                if (info) {
                    const decodedInfo = decodeURIComponent(info);
                    const tag = CommonMarkUtils.parseHtmlBlock(decodedInfo);
                    return {
                        '$class': `${CommonMarkModel.NAMESPACE}.CodeBlock`,
                        text: children[0].textContent,
                        info: decodedInfo,
                        tag,
                    };
                } else {
                    return {
                        '$class': `${CommonMarkModel.NAMESPACE}.CodeBlock`,
                        text: children[0].textContent,
                    };
                }
            }
        }
    },
};

const INLINE_CODE_RULE: Rule = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'code') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.Code`,
                text: el.textContent,
            };
        }
    },
};

const BLOCK_QUOTE_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'blockquote') {
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.BlockQuote`,
                nodes: next(el.childNodes, ignoreSpace),
            };
        }
    },
};

const CLAUSE_RULE: Rule = {
    deserialize(el, next) {
        const tag = el.tagName;
        if (tag && tag.toLowerCase() === 'div' && el.getAttribute('class') === 'clause') {
            const clause: any = {
                '$class': `${CiceroMarkModel.NAMESPACE}.Clause`,
                name: el.getAttribute('name'),
                nodes: next(el.childNodes, false),
            };
            if (el.getAttribute('elementType')) {
                clause.elementType = el.getAttribute('elementType');
            }
            if (el.getAttribute('src')) {
                clause.src = el.getAttribute('src');
            }
            return clause;
        }
    },
};

const VARIABLE_RULE: Rule = {
    deserialize(el) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'variable') {
            let variable: any;
            if (el.getAttribute('format')) {
                variable = {
                    '$class': `${CiceroMarkModel.NAMESPACE}.FormattedVariable`,
                    name: el.getAttribute('name'),
                    value: el.textContent,
                    format: el.getAttribute('format'),
                };
            } else if (el.getAttribute('enumValues')) {
                variable = {
                    '$class': `${CiceroMarkModel.NAMESPACE}.EnumVariable`,
                    name: el.getAttribute('name'),
                    value: el.textContent,
                    enumValues: JSON.parse(decodeURIComponent(el.getAttribute('enumValues'))),
                };
            } else {
                variable = {
                    '$class': `${CiceroMarkModel.NAMESPACE}.Variable`,
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
    },
};

const CONDITIONAL_RULE: Rule = {
    deserialize(el) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'conditional') {
            const text = el.textContent;
            const whenTrueText = el.getAttribute('whenTrue') ? el.getAttribute('whenTrue') : '';
            const whenFalseText = el.getAttribute('whenFalse') ? el.getAttribute('whenFalse') : '';
            return {
                '$class': `${CiceroMarkModel.NAMESPACE}.Conditional`,
                name: el.getAttribute('name'),
                isTrue: text === whenTrueText,
                whenTrue: whenTrueText ? [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: whenTrueText }] : [],
                whenFalse: whenFalseText ? [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: whenFalseText }] : [],
                nodes: [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: text }],
            };
        }
    },
};

const OPTIONAL_RULE: Rule = {
    deserialize(el) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'optional') {
            const text = el.textContent;
            const whenSomeText = el.getAttribute('whenSome') ? el.getAttribute('whenSome') : '';
            const whenNoneText = el.getAttribute('whenNone') ? el.getAttribute('whenNone') : '';
            return {
                '$class': `${CiceroMarkModel.NAMESPACE}.Optional`,
                name: el.getAttribute('name'),
                hasSome: text === whenSomeText,
                whenSome: whenSomeText ? [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: whenSomeText }] : [],
                whenNone: whenNoneText ? [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: whenNoneText }] : [],
                nodes: [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, text: text }],
            };
        }
    },
};

const FORMULA_RULE: Rule = {
    deserialize(el) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'formula') {
            const formula: any = {
                '$class': `${CiceroMarkModel.NAMESPACE}.Formula`,
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
    },
};

const HTML_INLINE_RULE: Rule = {
    deserialize(el) {
        const { tagName } = el;
        if (tagName && tagName.toLowerCase() === 'span' && el.getAttribute('class') === 'html_inline') {
            const text = el.innerHTML;
            const tag = CommonMarkUtils.parseHtmlBlock(text);
            return {
                '$class': `${CommonMarkModel.NAMESPACE}.HtmlInline`,
                text: text,
                tag,
            };
        }
    },
};

const HTML_BLOCK_RULE: Rule = {
    deserialize(el) {
        if (el.tagName && el.tagName.toLowerCase() === 'pre' && el.getAttribute('class') === 'html_block') {
            const children = el.childNodes;
            if (children.length === 1 && children[0].tagName.toLowerCase() === 'code') {
                const text = children[0].innerHTML;
                const tag = CommonMarkUtils.parseHtmlBlock(text);
                return {
                    '$class': `${CommonMarkModel.NAMESPACE}.HtmlBlock`,
                    text: text,
                    tag,
                };
            }
        }
    },
};

const INLINE_CLASSES = [
    'Text', 'Emph', 'Strong', 'Code', 'Link', 'Image',
    'Softbreak', 'Linebreak', 'HtmlInline',
].map((name) => `${CommonMarkModel.NAMESPACE}.${name}`);

function toInlineNodes(nodes: any): any[] {
    if (!nodes) { return []; }
    const list = Array.isArray(nodes) ? nodes : [nodes];
    return list.reduce<any[]>((acc, node) => {
        if (!node) { return acc; }
        if (INLINE_CLASSES.includes(node.$class)) {
            acc.push(node);
        } else if (node.nodes) {
            acc.push(...toInlineNodes(node.nodes));
        }
        return acc;
    }, []);
}

function cleanTableNodes(nodes: any): any[] {
    const NS = CommonMarkModel.NAMESPACE;
    const TEXT = `${NS}.Text`;
    const SOFT = `${NS}.Softbreak`;

    if (!nodes) { return []; }
    const arr = Array.isArray(nodes) ? nodes : [nodes];

    const merged = arr.reduce<any[]>((acc, node) => {
        if (!node) { return acc; }

        let newNode = { ...node };
        if (newNode.nodes) {
            newNode = { ...newNode, nodes: cleanTableNodes(newNode.nodes) };
        }

        if (newNode.$class === SOFT) {
            newNode = { $class: TEXT, text: ' ' };
        }

        const last = acc[acc.length - 1];
        if (last && last.$class === TEXT && newNode.$class === TEXT) {
            last.text += newNode.text;
        } else {
            acc.push(newNode);
        }

        return acc;
    }, []);

    merged.forEach((n) => {
        if (n.$class === TEXT) {
            n.text = n.text.replace(/\s+/g, ' ');
        }
    });

    if (merged.length > 0 && merged[0].$class === TEXT) {
        merged[0].text = merged[0].text.replace(/^\s+/, '');
    }
    if (merged.length > 0 && merged[merged.length - 1].$class === TEXT) {
        merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, '');
    }

    return merged.filter((n) => n.$class !== TEXT || n.text.length > 0);
}

const TABLE_RULE: Rule = {
    deserialize(el, next, ignoreSpace) {
        if (el.tagName && el.tagName.toLowerCase() === 'table') {
            const children = next(el.childNodes, ignoreSpace);
            let tableNodes = children.filter((node: any) =>
                node.$class === `${CommonMarkModel.NAMESPACE}.TableHead` ||
                node.$class === `${CommonMarkModel.NAMESPACE}.TableBody`
            );

            let head = tableNodes.find((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.TableHead`);
            const body = tableNodes.find((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.TableBody`);

            if (!head && body && body.nodes && body.nodes.length > 0) {
                const firstRow = body.nodes[0];
                const hasHeaderCells = firstRow.nodes && firstRow.nodes.some((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.HeaderCell`);

                if (hasHeaderCells) {
                    head = {
                        $class: `${CommonMarkModel.NAMESPACE}.TableHead`,
                        nodes: [firstRow],
                    };
                    const newBody = {
                        $class: `${CommonMarkModel.NAMESPACE}.TableBody`,
                        nodes: body.nodes.slice(1),
                    };
                    tableNodes = [head, newBody];
                }
            }

            const table = {
                $class: `${CommonMarkModel.NAMESPACE}.Table`,
                nodes: tableNodes,
            };

            const captionElement = Array.from(el.childNodes).find(
                (child: any) => child.tagName && child.tagName.toLowerCase() === 'caption'
            );
            if (captionElement) {
                const captionNodes = cleanTableNodes(toInlineNodes(next((captionElement as any).childNodes, ignoreSpace)));
                if (captionNodes.length > 0) {
                    const captionParagraph = {
                        $class: `${CommonMarkModel.NAMESPACE}.Paragraph`,
                        nodes: [
                            { $class: `${CommonMarkModel.NAMESPACE}.Strong`, nodes: captionNodes },
                        ],
                    };
                    return [captionParagraph, table];
                }
            }

            return table;
        }
        if (el.tagName && el.tagName.toLowerCase() === 'thead') {
            const nodes = next(el.childNodes);
            return {
                $class: `${CommonMarkModel.NAMESPACE}.TableHead`,
                nodes: nodes.filter((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.TableRow`),
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'tbody') {
            const nodes = next(el.childNodes);
            return {
                $class: `${CommonMarkModel.NAMESPACE}.TableBody`,
                nodes: nodes.filter((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.TableRow`),
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'tr') {
            const nodes = next(el.childNodes);
            return {
                $class: `${CommonMarkModel.NAMESPACE}.TableRow`,
                nodes: nodes.filter((n: any) => n.$class === `${CommonMarkModel.NAMESPACE}.HeaderCell` || n.$class === `${CommonMarkModel.NAMESPACE}.TableCell`),
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'th') {
            return {
                $class: `${CommonMarkModel.NAMESPACE}.HeaderCell`,
                nodes: cleanTableNodes(next(el.childNodes)),
            };
        }
        if (el.tagName && el.tagName.toLowerCase() === 'td') {
            return {
                $class: `${CommonMarkModel.NAMESPACE}.TableCell`,
                nodes: cleanTableNodes(next(el.childNodes)),
            };
        }
    },
};

const rules: Rule[] = [
    LIST_RULE,
    PARAGRAPH_RULE,
    STRONG_RULE,
    EMPH_RULE,
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
    IMAGE_RULE,
    TABLE_RULE,
];

export default rules;
