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

import { CommonMarkUtils, CommonMarkModel, FromCommonMarkVisitor, fromcommonmarkrules } from '@accordproject/markdown-common';
import fromtemplatemarkrules from './fromtemplatemarkrules';

/**
 * Fixes up the root note, removing Clause or Contract indication
 */
function fixupRootNode(input: any): any {
    return {
        '$class': `${CommonMarkModel.NAMESPACE}.Document`,
        'xmlns': 'http://commonmark.org/xml/1.0',
        'nodes': input.nodes[0].nodes,
    };
}

/**
 * Converts a TemplateMark DOM to a template markdown string.
 */
export class ToMarkdownTemplateVisitor extends FromCommonMarkVisitor {
    constructor(options?: any) {
        const resultString = (result: string) => result;
        const resultSeq = (parameters: any, result: any[]) => {
            result.forEach((next) => {
                parameters.result += next;
            });
        };
        const setFirst = (thingType: string) => thingType === 'Item' || thingType === 'ClauseDefinition' || thingType === 'ListBlockDefinition';
        const rules = fromcommonmarkrules;
        Object.assign(rules, fromtemplatemarkrules);
        super(options, resultString, resultSeq, rules, setFirst);
    }

    /**
     * Converts a TemplateMark DOM to a template markdown string.
     */
    toMarkdownTemplate(serializer: any, input: any): string {
        const parameters: any = {};
        const fixedInput = serializer.fromJSON(fixupRootNode(input));
        parameters.result = this.resultString('');
        parameters.stack = CommonMarkUtils.blocksInit();
        fixedInput.accept(this, parameters);
        return parameters.result.trim();
    }
}

export default ToMarkdownTemplateVisitor;
