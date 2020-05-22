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

const Stack = require('./Stack');

/**
 * Maps the keys in an object
 * @param {*} obj input object
 * @param {*} stack stack object
 */
function mapObject(obj, stack) {
    switch (obj.$class) {
    // remove these, visit children
    case 'org.accordproject.commonmark.Emph':
    case 'org.accordproject.commonmark.Strong':
    case 'org.accordproject.commonmark.Document':
    case 'org.accordproject.commonmark.BlockQuote':
        obj.nodes.forEach(element => {
            mapObject(element, stack);
        });
        break;
    // wrap in a para and process child nodes
    case 'org.accordproject.commonmark.Paragraph':
    case 'org.accordproject.commonmark.Heading':
        stack.push({
            $class: 'org.accordproject.commonmark.Paragraph',
            nodes: []
        });
        if (obj.nodes) {
            obj.nodes.forEach(element => {
                mapObject(element, stack);
            });
        }
        stack.pop();
        break;
    // wrap in a para and grab text
    case 'org.accordproject.commonmark.CodeBlock':
    case 'org.accordproject.commonmark.HtmlBlock':
        stack.append( {
            $class: 'org.accordproject.commonmark.Paragraph',
            nodes: [
                {
                    $class: 'org.accordproject.commonmark.Text',
                    text: obj.text
                }
            ]
        });
        break;
    // inline text
    case 'org.accordproject.commonmark.Code':
    case 'org.accordproject.commonmark.HtmlInline':
        stack.append( {
            $class: 'org.accordproject.commonmark.Text',
            text: obj.text
        });
        break;
    // get destination
    case 'org.accordproject.commonmark.Link':
        stack.append( {
            $class: 'org.accordproject.commonmark.Text',
            text: obj.destination
        });
        break;
    // get title
    case 'org.accordproject.commonmark.Image':
        stack.append( {
            $class: 'org.accordproject.commonmark.Text',
            text: obj.title
        });
        break;
    // do not insert a \ for linebreaks
    case 'org.accordproject.commonmark.Linebreak':
        stack.append( {
            $class: 'org.accordproject.commonmark.Text',
            text: '\n'
        });
        break;
    // copy
    default:
        stack.append(obj);
        break;
    }
}

/**
 * Removes rich text formatting nodes.
 * @param {*} obj input object
 * @returns {*} the modified object
 */
function removeFormatting(obj) {
    const root = {
        $class : 'org.accordproject.commonmark.Document',
        xmlns : obj.xmlns,
        nodes: []
    };
    const stack = new Stack();
    stack.push(root, false);
    mapObject(obj, stack);
    return root;
}

module.exports = removeFormatting;