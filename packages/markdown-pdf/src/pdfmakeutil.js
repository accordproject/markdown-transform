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

const axios = require('axios');

// Default Fonts Configuration
const defaultFonts = {
    Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
    },
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
    },
    Symbol: {
        normal: 'Symbol'
    },
    ZapfDingbats: {
        normal: 'ZapfDingbats'
    },
    LiberationSerif: {
        normal: `${__dirname}/fonts/LiberationSerif-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationSerif-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationSerif-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationSerif-BoldItalic.ttf`
    },
    LiberationSans: {
        normal: `${__dirname}/fonts/LiberationSans-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationSans-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationSans-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationSans-BoldItalic.ttf`
    },
    LiberationMono: {
        normal: `${__dirname}/fonts/LiberationMono-Regular.ttf`,
        bold: `${__dirname}/fonts/LiberationMono-Bold.ttf`,
        italics: `${__dirname}/fonts/LiberationMono-Italic.ttf`,
        bolditalics: `${__dirname}/fonts/LiberationMono-BoldItalic.ttf`
    },
};

// Default Style Configuration
const defaultStyles = {
    Footer: {
        alignment: 'left',
        fontSize: 10,
        // left, top, right, bottom
        margin : [81, 36, 0, 0]
    },
    PageNumber: {
        alignment: 'center',
        fontSize: 10,
        // left, top, right, bottom
        margin : [0, -11, 0, 0]
    },
    Header: {
        alignment: 'right',
        fontSize: 10,
        // left, top, right, bottom
        margin : [0, 36, 81, 0]
    },
    heading_one: {
        fontSize: 25,
        bold: true,
        alignment: 'center'
    },
    heading_two: {
        fontSize: 20,
        bold: true
    },
    heading_three: {
        fontSize: 16,
        bold: true
    },
    heading_four: {
        fontSize: 15,
        bold: true
    },
    heading_five: {
        fontSize: 14,
        bold: true
    },
    heading_six: {
        fontSize: 13,
        bold: true
    },
    Code: {
        font: 'LiberationMono'
    },
    CodeBlock: {
        font: 'LiberationMono',
    },
    HtmlInline: {
        font: 'LiberationMono'
    },
    HtmlBlock: {
        font: 'LiberationMono',
    },
    Paragraph: {
        alignment: 'justify'
    },
    toc: {
        fontSize: 25,
        bold: true,
        alignment: 'center'
    },
    Link: {
        color: 'blue'
    },
    BlockQuote: {
        margin: [20, 0]
    },
    TableHeader: {
        bold: true
    },
    background: {
        color: 'white'
    }
};

// Image handling
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA8CAIAAAB+RarbAAADfUlEQVRo3u2b127DMAxF+///1uy9JzKRvWcvYEBQNGxJkXfvQ5Fh1zoiRZEC8/NOmX5SCjwejzOZzG9CBTQAfgAnmJYwfwD/pkAewJiS6XQa37W6XC7z+bw38Gq1yuVy5G2j0bjdbvFCvVwuGLaqhfH6er3WajXyCeZps9nEAvX1ek0mk2w2SwZfLBa9gZ07Edbo6RkMBvgwyrSHw6FcLtNLcjQaPZ9PJWBH+/2+UCiQryqVyvl8jiDq4/GAPWjzVKvV0+kkRHMDhu73e7vdJt/CWxaLRaRo1+s1bRWMcDab0RfoATsCJL0wMAWYiNBREWtarRZtWLzFh8xlJsAQnBkuTS7DpMLhQ6SFGWkbYDwwtfBKQ2AnkjFLBYEt+EiGxYklSg+j3+9jGcuuNwd2hC2K3tCxgfFe5JMQchF46SwYYRnB2f2ub4EhpCL0zo5EBemKyo1YF5iv+XwO18BfvMYnwFC5d7vdlkolOjhhy1XxLwvAjpB40pONuXexDBI9xg9pdTodsosIxSQFmG6kU4rjtAYMHY9HMuuYclmiR+cDLkKMlWGQ+ITVhLnTGqRNYMd6iBkYECk4GR9mMnh3IRMUbnj453hEt9s12A4tA7tHdRc3lqler9uN/MEBI13heWCoZrMJiw2HQ7wQMgudJQbAsBXvsUxw2u12dDVKtrr4AWPr4k0nTM4Q7XkvsOjVAQHDdAwG1rMsJeanxn2XiiIwNg+GAWmp7GL+CBFpRsyAsSGtPyWrpYXOb7HwDi5oKQoZIn9+GL81rL7UeX9GJhPLbUnlsIKuaYl57ZZfUQFm6gEiWR0fY2Csz16vJ0zC/DgPDh8YhaSwbEDt5cfjQgZGRsHTor7171QwZGAcvimWhAkBRk2rkmAnB5gpCXEY4vcTQwZmjgSwehMOjFPVLSWfInOkc+l/4GQB5zipZM7OqSWKCsVTe3+BsYtis5Gd1MoeT6QCTGoMHIPrLnvLwHTviOws/ntgOhvV7baxBsz3jvhnYci428YCsLB3RPEUyhj4bdpt8y2wrHdE18EMgN9G3TbmwO69I0FKq9vGENizdyRgqXfbaAMr9o6EIpVuGz1g9d6RsOTZbaMKrNs7EqLcu228gc16R0KXrNvGA9i4dyQKEnbbqPZL6/aOREdMt40SsEHvSKREd9toWDjJPwFI3Y88UvcznvQodcB/LBIdvQmJEjwAAAAASUVORK5CYII=';

// Asynchronously retrieve image as buffer data from URL.
const getRemoteImageData = async (url, options) => {
    try {
        if (options.offline) {
            return placeholderImage;
        } else {
            const buffer = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(buffer.data);
        }
    } catch (err) {
        // Failed to retrieve image buffer data from URL - use placeholder instead.
        return placeholderImage;
    }
};

// Walk a JSON object and find any image key starting with 'http' and
// substitute the URL with the image buffer data.
const findReplaceImageUrls = async (object, options = {}) => {
    const updates = [];
    await Promise.all(
        Object.keys(object).map(async (key) => {
            if (Array.isArray(object[key])) {
                await Promise.all(
                    object[key].map(async (obj) => await findReplaceImageUrls(obj, options))
                );
            } else if (typeof object[key] === 'object') {
                await findReplaceImageUrls(object[key], options);
            } else {
                if (key === 'image' && typeof object[key] === 'string' && object[key].startsWith('http')) {
                    updates.push({ key: key, content: await getRemoteImageData(object[key], options) });
                }
            }
        })
    ).then(() => {
        updates.forEach((update) => {
            object[update.key] = update.content;
        });
    });
};

/**
 * Apply marks to a leaf node
 * @param {*} leafNode the leaf node
 * @param {*} parameters the parameters
 */
function applyMarks(leafNode, parameters) {
    if (parameters.emph) {
        leafNode.style = 'Emph';
        leafNode.italics = true;
    }
    if (parameters.strong) {
        leafNode.style = 'Strong';
        leafNode.bold = true;
    }
    if (parameters.strikethrough) {
        leafNode.style = 'Strikethrough';
        leafNode.bold = true;
    }
    if (parameters.underline) {
        leafNode.style = 'Underline';
        leafNode.bold = true;
    }
    if (parameters.code) {
        leafNode.style = 'Code';
    }
}

/**
 * Gets the text value from a formatted sub-tree
 * @param {*} thing a concerto Strong, Emph or Text node
 * @returns {string} the 'text' property of the formatted sub-tree
 */
function getText(thing) {
    if(thing.getType() === 'Text') {
        return thing.text;
    }
    else {
        if(thing.nodes && thing.nodes.length > 0) {
            return getText(thing.nodes[0]);
        }
        else {
            return '';
        }
    }
}

/**
 * Converts a formatted text node to a slate text node with marks
 * @param {*} thing a concerto Strong, Emph or Text node
 * @param {*} parameters the parameters
 * @returns {*} the slate text node with marks
 */
function handleFormattedText(thing, parameters) {
    const textNode = {
        text: getText(thing)
    };

    applyMarks(textNode, parameters);
    return textNode;
}

/**
 * Converts a heading level to a heading style name
 * @param {string} level - the heading level
 * @returns {string} the heading type
 */
function getHeadingType(level) {
    switch(level) {
    case '1': return 'heading_one';
    case '2': return 'heading_two';
    case '3': return 'heading_three';
    case '4': return 'heading_four';
    case '5': return 'heading_five';
    case '6': return 'heading_six';
    default: return 'heading_one';
    }
}

/**
 * Unquote strings
 * @param {string} value - the string
 * @return {string} the unquoted string
 */
function unquoteString(value) {
    return value.substring(1,value.length-1);
}

/**
 * Apply styling
 * @param {*} node - the current ciceromark node
 * @param {*} result - the current pdfmake output
 */
function applyStyle(node, result) {
    // Only do something is some style is specified
    if (!node.style) {
        return;
    }

    // Make the pdfresult more uniform
    if (!Array.isArray(result)) {
        result = [result];
    }
    if (node.style.align) {
        result.forEach((x) => {
            x.alignment = node.style.align;
        });
    }

    if (node.style.color) {
        result.forEach((x) => {
            x.color = node.style.color;
        });
    }
    if (node.style.backgroundColor) {
        result.forEach((x) => {
            x.background = node.style.backgroundColor;
        });
    }
    if (node.style.fontSize) {
        result.forEach((x) => {
            x.fontSize = node.style.fontSize;
        });
    }
    if (node.style.lineHeight) {
        result.forEach((x) => {
            x.lineHeight = node.style.lineHeight;
        });
    }
}

module.exports = {
    defaultFonts,
    defaultStyles,
    findReplaceImageUrls,
    handleFormattedText,
    getHeadingType,
    unquoteString,
    applyStyle,
};
