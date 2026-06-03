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

import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';

/**
 * Prepare the text for parsing (normalizes new lines, etc)
 */
export function normalizeNLs(input: string): string {
    return input.replace(/\r/gm, '');
}

/**
 * Normalize to markdown cicero text
 */
export function normalizeToMarkdownCicero(input: any): string {
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    return ciceroMarkTransformer.toMarkdownCicero(input);
}

/**
 * Normalize from markdown cicero text
 */
export function normalizeFromMarkdownCicero(input: string): any {
    const inputNLs = normalizeNLs(input);
    const ciceroMarkTransformer = new CiceroMarkTransformer();
    return ciceroMarkTransformer.fromMarkdownCicero(inputNLs);
}
