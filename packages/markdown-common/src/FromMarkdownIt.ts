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

import { Stack } from './Stack';
import { mergeAdjacentHtmlNodes } from './CommonMarkUtils';
import defaultRules from './tocommonmarkrules';
import type { MarkdownItRules } from './tocommonmarkrules';
import * as CommonMarkModel from './externalModels/CommonMarkModel';

/**
 * Converts a markdown-it token stream to a CommonMark DOM
 */
export class FromMarkdownIt {
    rules: MarkdownItRules;

    /**
     * Construct the transformer
     */
    constructor(rules?: { inlines?: any; blocks?: any }) {
        this.rules = defaultRules;
        if (rules) {
            this.rules.inlines = Object.assign(this.rules.inlines, rules.inlines);
            this.rules.blocks = Object.assign(this.rules.blocks, rules.blocks);
        }
    }

    /**
     * Takes the stack of constructed inline nodes
     * properly closing them (if the close token is missing in the markdown)
     * returns the final root node for the inline
     */
    static closeInlines(rules: MarkdownItRules, stack: Stack): any {
        let currentNode = stack.pop();
        while (stack.peek()) {
            const rule = Object.values(rules.inlines).find((x) => x.tag === currentNode.$class && x.exit);
            if (rule && rule.exit) {
                rule.exit(currentNode, null, FromMarkdownIt.inlineCallback(rules));
            }
            currentNode = stack.pop();
        }
        return mergeAdjacentHtmlNodes(currentNode.nodes, true);
    }

    /**
     * Create a callback for inlines
     */
    static inlineCallback(rules: MarkdownItRules): (tokens: any[]) => any[] {
        return (tokens: any[]) => {
            const stack = new Stack();
            FromMarkdownIt.inlineToCommonMark(rules, tokens, stack);
            return FromMarkdownIt.closeInlines(rules, stack);
        };
    }

    /**
     * Process an inline node to CommonMark DOM
     */
    static inlineToCommonMark(rules: MarkdownItRules, tokens: any[], stack: Stack): void {
        const rootNode = {
            '$class': `${CommonMarkModel.NAMESPACE}.Inline`,
            'nodes': [] as any[],
        };
        stack.push(rootNode, false);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const rule = rules.inlines[token.type];
            if (!rule) {
                throw new Error('Unknown inline type ' + token.type);
            }
            if (rule.leaf) {
                const node: any = { $class: rule.tag };
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
                if (!(rule.skipEmpty && node.text === '')) {
                    stack.append(node);
                }
            } else if (rule.open && rule.close) {
                const node: any = { $class: rule.tag };
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
                stack.append(node);
            } else if (rule.open) {
                const node: any = { $class: rule.tag };
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
                node.nodes = [];
                stack.push(node, true);
            } else if (rule.close) {
                const node = stack.pop();
                if (rule.exit) { rule.exit(node, token, FromMarkdownIt.inlineCallback(rules)); }
            } else {
                const node = stack.peek();
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
            }
        }
    }

    /**
     * Transform a block token stream to CommonMark DOM
     */
    static blockToCommonMark(rules: MarkdownItRules, tokens: any[]): any {
        const stack = new Stack();
        const tight = new Stack();
        const rootNode: any = {
            '$class': `${CommonMarkModel.NAMESPACE}.Document`,
            'xmlns': 'http://commonmark.org/xml/1.0',
            'nodes': [] as any[],
        };
        stack.push(rootNode, false);
        tight.push({ tight: 'true' }, false);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Special purpose to recover tight v loose information in list nodes
            if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
                tight.push({ tight: 'true' }, false);
            } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
                const isTight = tight.pop();
                const listNode = stack.peek();
                listNode.tight = isTight.tight;
            } else if (token.type === 'paragraph_open' && !token.hidden) {
                tight.peek().tight = 'false';
            }

            // Special purpose for inline nodes
            if (token.type === 'inline') {
                const currentNode = stack.peek();
                if (currentNode) {
                    currentNode.nodes = FromMarkdownIt.inlineCallback(rules)(token.children);
                    continue;
                } else {
                    throw new Error('Malformed token stream: no current node');
                }
            }

            const rule = rules.blocks[token.type];
            if (!rule) {
                throw new Error('Unknown block type ' + token.type);
            }

            if (rule.leaf) {
                const node: any = { $class: rule.tag };
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
                stack.append(node);
            } else if (rule.open) {
                const node: any = { $class: rule.tag };
                if (rule.enter) { rule.enter(node, token, FromMarkdownIt.inlineCallback(rules)); }
                node.nodes = [];
                stack.push(node, true);
            } else if (rule.close) {
                const node = stack.pop();
                if (rule.exit) { rule.exit(node, token, FromMarkdownIt.inlineCallback(rules)); }
            }
        }

        if (!rootNode.nodes || rootNode.nodes.length === 0) {
            rootNode.nodes.push({
                '$class': `${CommonMarkModel.NAMESPACE}.Paragraph`,
                'nodes': [{ '$class': `${CommonMarkModel.NAMESPACE}.Text`, 'text': '' }],
            });
        }
        return rootNode;
    }

    /**
     * Transform a token stream to CommonMark DOM
     */
    toCommonMark(tokens: any[]): any {
        return FromMarkdownIt.blockToCommonMark(this.rules, tokens);
    }
}

export default FromMarkdownIt;
