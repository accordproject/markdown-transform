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

const NS_PREFIX_CiceroMarkModel = require('./externalModels/CiceroMarkModel').NS_PREFIX_CiceroMarkModel;

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class UntypeVisitor {

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            UntypeVisitor.visitNodes(visitor, thing.nodes, parameters);
        }
    }

    /**
     * Visits a list of nodes and return the CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} things the list node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitNodes(visitor, things, parameters) {
        things.forEach(node => {
            node.accept(visitor, parameters);
        });
    }

    /**
     * Visit a node
     * @param {*} thing the object being visited
     * @param {*} parameters the parameters
     */
    visit(thing, parameters) {
        const that = this;
        switch(thing.getType()) {
        case 'Variable':
        case 'EnumVariable':
        case 'FormattedVariable': {
            const variableDeclaration = parameters.modelManager.getType(NS_PREFIX_CiceroMarkModel + 'Variable');
            thing.$classDeclaration = variableDeclaration;
            delete thing.enumValues;
            delete thing.elementType;
            delete thing.identifiedBy;
        }
            break;
        case 'Clause':
        case 'With':
        case 'ListBlock':
        case 'Join':
        case 'Contract': {
            delete thing.elementType;
        }
            break;
        default:
            break;
        }
        UntypeVisitor.visitChildren(that, thing, parameters);
    }
}

module.exports = UntypeVisitor;