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

const { NS_PREFIX_TemplateMarkModel } = require('./externalModels/TemplateMarkModel');

/**
 * Converts a CommonMark DOM to a CiceroMark DOM
 */
class TemplateMarkVisitor {

    /**
     * Visits a sub-tree and return CiceroMark DOM
     * @param {*} visitor the visitor to use
     * @param {*} thing the node to visit
     * @param {*} [parameters] optional parameters
     */
    static visitChildren(visitor, thing, parameters) {
        if(thing.nodes) {
            TemplateMarkVisitor.visitNodes(visitor, thing.nodes, parameters);
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
        const currentModel = parameters.model;
        switch(thing.getType()) {
        case 'Variable': {
            //console.log(`Variable ${thing.name} type in model ${currentModel.getName()}`);
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                if (property.isTypeEnum()) {
                    const enumType = property.getParent().getModelFile().getType(property.getType());
                    thing.type = 'Enum';
                    thing.value = enumType.getOwnProperties().map(x => x.getName());
                } else {
                    thing.type = property.getFullyQualifiedTypeName();
                }
                //console.log(`Property ${thing.name} has type ${thing.type}`);
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
        }
            break;
        case 'ClauseBlock': {
            if (parameters.kind === 'contract') {
                const property = currentModel.getOwnProperty(thing.name);
                if (property) {
                    thing.type = property.getFullyQualifiedTypeName();
                    //console.log(`Property ${thing.name} has type ${thing.type}`);
                } else {
                    throw new Error('Unknown property ' + thing.name);
                }
                const clauseModel = parameters.introspector.getClassDeclaration(thing.type);
                TemplateMarkVisitor.visitChildren(this, thing, {introspector:parameters.introspector,model:clauseModel});
            } else {
                thing.type = parameters.model.getFullyQualifiedName();
                TemplateMarkVisitor.visitChildren(this, thing, parameters);
            }
        }
            break;
        case 'WithBlock': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                thing.type = property.getFullyQualifiedTypeName();
                //console.log(`Property ${thing.name} has type ${thing.type}`);
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
            const clauseModel = parameters.introspector.getClassDeclaration(thing.type);
            TemplateMarkVisitor.visitChildren(this, thing, {introspector:parameters.introspector,model:clauseModel});
        }
            break;
        case 'OrderedListBlock':
        case 'UnorderedListBlock': {
            const property = currentModel.getOwnProperty(thing.name);
            if (property) {
                thing.type = property.getFullyQualifiedTypeName();
                //console.log(`Property ${thing.name} has type ${thing.type}`);
            } else {
                throw new Error('Unknown property ' + thing.name);
            }
            const clauseModel = parameters.introspector.getClassDeclaration(thing.type);
            TemplateMarkVisitor.visitChildren(this, thing, {introspector:parameters.introspector,model:clauseModel});
        }
            break;
        case 'ContractBlock': {
            thing.type = parameters.model.getFullyQualifiedName();
            TemplateMarkVisitor.visitChildren(this, thing, parameters);
        }
            break;
        default:
            TemplateMarkVisitor.visitChildren(this, thing, parameters);
        }
    }
}

module.exports = TemplateMarkVisitor;