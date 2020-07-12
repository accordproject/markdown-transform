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

const { NS_PREFIX_CommonMarkModel } = require('@accordproject/markdown-common').CommonMarkModel;

/**
 * Utility: flattening array of arrays
 * @param {*[]} arr - input array of arrays
 * @return {*[]} flattened array
 */
function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Converts a CiceroMark DOM to a CommonMark DOM
 */
class ToCommonMarkVisitor {
    /**
     * Construct the visitor
     */
    constructor() {
    }

    /**
     * Visits a sub-tree and return the CommonMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            const result =
                  thing.nodes.map(node => {
                      return node.accept(visitor, parameters);
                  });
            thing.nodes = flatten(result);
        }
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     * @return {*[]} result nodes
     */
    visit(thing, parameters) {
        const thingType = thing.getType();
        switch(thingType) {
        case 'Clause': {
            ToCommonMarkVisitor.visitChildren(this, thing, parameters);
            return thing.nodes;
        }
        case 'Formula': {
            // Revert to HtmlInline
            thing.$classDeclaration = parameters.modelManager.getType(NS_PREFIX_CommonMarkModel + 'Text');
            thing.text = decodeURIComponent(thing.value);

            delete thing.elementType;
            delete thing.name;
            delete thing.value;
            delete thing.code;
            delete thing.dependencies;
        }
            break;
        default:
            ToCommonMarkVisitor.visitChildren(this, thing, parameters);
        }
        return [thing];
    }
}

module.exports = ToCommonMarkVisitor;