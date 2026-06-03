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

import { ToHtmlStringVisitor } from './ToHtmlStringVisitor';
import { ToCiceroMarkVisitor } from './ToCiceroMarkVisitor';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';

/**
 * Converts a CiceroMark or CommonMark DOM to HTML
 */
export class HtmlTransformer {
    options: any;
    ciceroMarkTransformer: CiceroMarkTransformer;

    constructor(options: any = {}) {
        this.options = options;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
    }

    /**
     * Converts a CiceroMark DOM to an html string
     */
    toHtml(input: any): string {
        if (!input.getType) {
            input = this.ciceroMarkTransformer.getSerializer().fromJSON(input);
        }

        const parameters: any = {};
        parameters.result = '';
        parameters.first = true;
        parameters.indent = 0;
        const visitor = new ToHtmlStringVisitor(this.options);
        input.accept(visitor, parameters);
        return parameters.result.trim();
    }

    /**
     * Converts an html string to a CiceroMark DOM
     */
    toCiceroMark(input: string): any {
        const visitor = new ToCiceroMarkVisitor(this.options);
        return visitor.toCiceroMark(input);
    }
}

export default HtmlTransformer;
