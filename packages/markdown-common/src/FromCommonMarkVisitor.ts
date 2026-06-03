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

import * as CommonMarkUtils from './CommonMarkUtils';

export type RuleFunction = (
    visitor: FromCommonMarkVisitor,
    thing: any,
    children: any,
    parameters: any,
    resultString: (s: string) => any,
    resultSeq: (parameters: any, result: any) => void,
) => void;

export type Rules = Record<string, RuleFunction>;

/**
 * Converts a CommonMark DOM to something else
 */
export class FromCommonMarkVisitor {
    options: any;
    resultString: (s: string) => any;
    resultSeq: (parameters: any, result: any) => void;
    rules: Rules;
    setFirst: (b: string) => boolean;

    /**
     * Construct the visitor.
     */
    constructor(
        options: any,
        resultString: (s: string) => any,
        resultSeq: (parameters: any, result: any) => void,
        rules: Rules,
        setFirst: (b: string) => boolean,
    ) {
        this.options = options;
        this.resultString = resultString;
        this.resultSeq = resultSeq;
        this.rules = rules;
        this.setFirst = setFirst;
    }

    /**
     * Visits a sub-tree
     */
    visitChildren(visitor: FromCommonMarkVisitor, thing: any, parameters: any, field = 'nodes'): any {
        const parametersIn = CommonMarkUtils.mkParameters(thing, parameters, this.resultString(''), this.setFirst);
        if (thing[field]) {
            thing[field].forEach((node: any) => {
                node.accept(visitor, parametersIn);
                CommonMarkUtils.nextNode(parametersIn);
            });
        }
        return parametersIn.result;
    }

    /**
     * Visit a node
     */
    visit(thing: any, parameters: any): void {
        const children = this.visitChildren(this, thing, parameters);
        const rule = this.rules[thing.getType()];
        if (rule) {
            rule(this, thing, children, parameters, this.resultString, this.resultSeq);
        } else {
            throw new Error(`No rule to handle type ${thing.getType()}`);
        }
    }
}

export default FromCommonMarkVisitor;
