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

/**
 * Escape text for use as HTML element content.
 */
export function escapeHtmlText(input: string): string {
    return String(input).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Escape text for use as a double-quoted HTML attribute value.
 */
export function escapeHtmlAttribute(input: string): string {
    return escapeHtmlText(input).replace(/"/g, '&quot;');
}

/**
 * Determine whether a node's text content is entirely whitespace.
 */
export function isAllWhitespace(node: any): boolean {
    return !(/[^\t\n\r ]/.test(node.textContent));
}

/**
 * Determine if a node should be ignored by the iterator functions.
 */
export function isIgnorable(node: any, ignoreSpace: boolean): boolean {
    return (
        ignoreSpace &&
        (node.nodeType === 8 ||
            (node.nodeType === 3 && isAllWhitespace(node)))
    );
}
