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

import { CommonMarkUtils, FromCommonMarkVisitor, fromcommonmarkrules } from '@accordproject/markdown-common';
import fromciceromarkrules from './fromciceromarkrules';

/**
 * Converts a CiceroMark DOM to a cicero markdown string.
 */
export class ToMarkdownCiceroVisitor extends FromCommonMarkVisitor {
    constructor(options?: any) {
        const resultString = (result: string) => result;
        const resultSeq = (parameters: any, result: any[]) => {
            result.forEach((next) => {
                parameters.result += next;
            });
        };
        const setFirst = (thingType: string) => thingType === 'Item' || thingType === 'Clause';
        const rules = fromcommonmarkrules;
        Object.assign(rules, fromciceromarkrules);
        super(options, resultString, resultSeq, rules, setFirst);
    }

    /**
     * Converts a CiceroMark DOM to a cicero markdown string.
     */
    toMarkdownCicero(input: any): string {
        const parameters: any = {};
        parameters.result = this.resultString('');
        parameters.stack = CommonMarkUtils.blocksInit();
        input.accept(this, parameters);
        return parameters.result.trim();
    }
}

export default ToMarkdownCiceroVisitor;
