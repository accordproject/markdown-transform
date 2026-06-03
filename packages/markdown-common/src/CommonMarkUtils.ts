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

import { DOMParser } from '@xmldom/xmldom';
import * as CommonMarkModel from './externalModels/CommonMarkModel';

export interface BlockStack {
    first: boolean;
    blocks: string[];
}

/**
 * Initial block stack
 */
export function blocksInit(): BlockStack {
    return {
        first: true,
        blocks: [],
    };
}

/**
 * Next node
 */
export function blocksNextNode(stack: BlockStack): void {
    stack.first = false;
}

/**
 * enter block
 */
export function blocksEnterBlock(stack: BlockStack, blockType: string, setFirst: (b: string) => boolean): BlockStack {
    const newStack: BlockStack = { first: false, blocks: [] };
    if (setFirst(blockType)) {
        newStack.first = true;
    } else {
        newStack.first = stack.first;
    }
    newStack.blocks = stack.blocks.slice();
    newStack.blocks.push(blockType);
    return newStack;
}

/**
 * Create a prefix within an existing line
 */
export function prefixInLine(blocks: string[]): string {
    let prefix = '';
    for (let i = blocks.length - 1; i >= 0; i--) {
        if (blocks[i] === 'Item' || blocks[i] === 'ListBlockDefinition') {
            break;
        } else if (blocks[i] === 'BlockQuote') {
            prefix = '> ' + prefix;
        }
    }
    return prefix;
}

/**
 * Create a new line
 */
export function newLine(blocks: string[]): string {
    let prefix = '';
    for (let i = blocks.length - 1; i >= 0; i--) {
        if (blocks[i] === 'Item' || blocks[i] === 'ListBlockDefinition') {
            prefix = '   ' + prefix;
        } else if (blocks[i] === 'BlockQuote') {
            prefix = '> ' + prefix;
        }
    }
    return '\n' + prefix;
}

/**
 * Next node
 */
export function nextNode(parameters: any): void {
    blocksNextNode(parameters.stack);
    if (parameters.index) {
        parameters.index++;
    }
}

/**
 * Set parameters for general blocks
 */
export function mkParameters(ast: any, parametersOut: any, init: any, setFirst: (b: string) => boolean): any {
    const parameters = Object.assign({}, parametersOut);
    parameters.result = init;
    parameters.stack = blocksEnterBlock(parametersOut.stack, ast.getType(), setFirst);
    if (ast.getType() === 'List') {
        parameters.indexInit = ast.start ? parseInt(ast.start) : 1;
        parameters.index = parameters.indexInit;
        parameters.tight = ast.tight;
        parameters.type = ast.type;
    }
    return parameters;
}

/**
 * Create a line prefix
 */
export function mkPrefix(parameters: any, nb: number): string {
    const stack: BlockStack = parameters.stack;
    if (stack.first) {
        return prefixInLine(stack.blocks);
    } else {
        const nl = newLine(stack.blocks);
        return nl.repeat(nb);
    }
}

/**
 * Create a single new line
 */
export function mkNewLine(parameters: any): string {
    const stack: BlockStack = parameters.stack;
    return newLine(stack.blocks);
}

/**
 * Create Setext heading
 */
export function mkSetextHeading(level: number): string {
    if (level === 1) {
        return '====';
    } else {
        return '----';
    }
}

/**
 * Create ATX heading
 */
export function mkATXHeading(level: number): string {
    return Array(level).fill('#').join('');
}

/**
 * Create table heading
 */
export function mkTableHeading(col: number): string {
    return Array(col).fill('|---------').join('') + '|';
}

/**
 * Adding escapes for text nodes
 */
export function escapeText(input: string): string {
    return input.replace(/[*`&>]/g, '\\$&')
        .replace(/^(#+) /g, '\\$1 ')
        .replace(/^(\d+)\. /g, '$1\\. ')
        .replace(/^- /g, '\\- ')
        .replace(/^_/g, '\\_');
}

/**
 * Adding escapes for code blocks
 */
export function escapeCodeBlock(input: string): string {
    return input.replace(/`/g, '\\`');
}

/**
 * Removing escapes
 */
export function unescapeCodeBlock(input: string): string {
    return input.replace(/\\`/g, '`');
}

/**
 * Parses an HTML block and extracts the attributes, tag name and tag contents.
 * Note that this will return null for strings like this: </foo>
 */
export function parseHtmlBlock(input: string): any {
    try {
        const doc = (new DOMParser()).parseFromString(input, 'text/html');
        const item: any = doc.childNodes[0];
        const attributes = item.attributes;
        const attributeObject: Record<string, string> = {};
        let attributeString = '';

        for (let i = 0; i < attributes.length; i += 1) {
            attributeString += `${attributes[i].name} = "${attributes[i].value}" `;
            attributeObject[attributes[i].name] = attributes[i].value;
        }

        const tag: any = {};
        tag.$class = `${CommonMarkModel.NAMESPACE}.TagInfo`;
        tag.tagName = item.tagName.toLowerCase();
        tag.attributeString = attributeString;
        tag.attributes = [];
        for (const attName in attributeObject) {
            if (Object.prototype.hasOwnProperty.call(attributeObject, attName)) {
                const attValue = attributeObject[attName];
                tag.attributes.push({
                    $class: `${CommonMarkModel.NAMESPACE}.Attribute`,
                    name: attName,
                    value: attValue,
                });
            }
        }
        tag.content = item.textContent;
        tag.closed = input.endsWith('/>');

        return tag;
    } catch (err) {
        return null;
    }
}

/**
 * Merge adjacent Html nodes in a list of nodes
 */
export function mergeAdjacentHtmlNodes(nodes: any[], tagInfo: boolean): any[] {
    const result: any[] = [];
    for (let n = 0; n < nodes.length; n++) {
        const cur = nodes[n];
        const next = n + 1 < nodes.length ? nodes[n + 1] : null;

        if (next &&
            cur.$class === (`${CommonMarkModel.NAMESPACE}.HtmlInline`) &&
            next.$class === (`${CommonMarkModel.NAMESPACE}.HtmlInline`) &&
            cur.tag &&
            next.text === `</${cur.tag.tagName}>`) {
            next.text = cur.text + next.text;
            next.tag = tagInfo ? parseHtmlBlock(next.text) : null;
        } else {
            result.push(cur);
        }
    }
    return result;
}

/**
 * Determine the heading level
 */
export function headingLevel(tag: string): string {
    switch (tag) {
        case 'h1': return '1';
        case 'h2': return '2';
        case 'h3': return '3';
        case 'h4': return '4';
        case 'h5': return '5';
        default: return '6';
    }
}

/**
 * Get an attribute value
 */
export function getAttr(attrs: any, name: string, def: any): string {
    if (attrs) {
        const startAttrs = attrs.filter((x: any) => x[0] === name);
        if (startAttrs[0]) {
            return '' + startAttrs[0][1];
        } else {
            return def;
        }
    } else {
        return def;
    }
}

/**
 * Trim single ending newline
 */
export function trimEndline(text: string): string {
    if (text.charAt(text.length - 1) && text.charAt(text.length - 1) === '\n') {
        return text.substring(0, text.length - 1);
    } else {
        return text;
    }
}
