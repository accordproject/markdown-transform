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

/**
 * Determine whether a node's text content is entirely whitespace.
 *
 * @param {object} node A node implementing the |CharacterData| interface
 * (i.e. a |Text|, |Comment|, or |CDATASection| node
 * @return {boolean} True if all of the text content of |nod| is whitespace,
 * otherwise false.
 */
function isAllWhitespace( node )
{
    return !(/[^\t\n\r ]/.test(node.textContent));
}


/**
 * Determine if a node should be ignored by the iterator functions.
 *
 * @param {object} node  An object implementing the DOM1 |Node| interface.
 * @return {boolean} true if the node is:
 *                1) A |Text| node that is all whitespace
 *                2) A |Comment| node
 *             and otherwise false.
 */
function isIgnorable( node )
{
    return ( node.nodeType === 8) || // A comment node
         ( (node.nodeType === 3) && isAllWhitespace(node) ); // a text node, all ws
}

module.exports = {
    isAllWhitespace,
    isIgnorable,
};