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

import { calculateDependencies as collectDependencies } from './dependencyVisitor';

/**
 * The TemplateMark DOM stores block children under a small number of field
 * names. `templaterules.ts` fills `nodes` while a block is open and moves the
 * content into `whenTrue`/`whenFalse` (conditionals) or `whenSome`/`whenNone`
 * (optionals) when it closes, so a complete walk must visit all of them.
 */
const CHILD_FIELDS = ['nodes', 'whenTrue', 'whenFalse', 'whenSome', 'whenNone'];

/**
 * Walks a TemplateMark DOM to compute or extract formula dependencies
 */
export class FormulaVisitor {
    static visitChildren(visitor: FormulaVisitor, thing: any, parameters: any): void {
        CHILD_FIELDS.forEach((field) => {
            if (Array.isArray(thing[field])) {
                FormulaVisitor.visitNodes(visitor, thing[field], parameters);
            }
        });
    }

    static visitNodes(visitor: FormulaVisitor, things: any[], parameters: any): void {
        things.forEach((node) => {
            node.accept(visitor, parameters);
        });
    }

    static calculateDependencies(tsCode: string): string[] {
        // The visitor reports an empty list for input it cannot parse; a bad
        // formula must not break TemplateMark typing.
        return collectDependencies(tsCode);
    }

    visit(thing: any, parameters: any): void {
        switch (thing.getType()) {
            case 'ConditionalDefinition': {
                // A plain `{{#if isActive}}` guard is stored in `name` and is
                // already validated as a model property by TypeVisitor, so it
                // is used verbatim; parsing it would treat names such as
                // `Math` as built-in globals and drop the dependency.
                // `condition` is only populated for the attribute form.
                const conditionCode = thing.condition?.contents;
                if (parameters.calculateDependencies) {
                    if (conditionCode) {
                        thing.dependencies = FormulaVisitor.calculateDependencies(conditionCode);
                    } else if (thing.name) {
                        thing.dependencies = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(thing.name)
                            ? [thing.name]
                            : FormulaVisitor.calculateDependencies(thing.name);
                    }
                } else {
                    parameters.result.push({ name: thing.name, code: thing.condition });
                }
                // Formulas and nested conditions can appear in either branch.
                FormulaVisitor.visitChildren(this, thing, parameters);
                break;
            }
            case 'FormulaDefinition':
                if (parameters.calculateDependencies) {
                    if (thing.code) {
                        thing.dependencies = FormulaVisitor.calculateDependencies(thing.code.contents);
                    }
                } else {
                    parameters.result.push({ name: thing.name, code: thing.code });
                }
                break;
            default:
                FormulaVisitor.visitChildren(this, thing, parameters);
        }
    }

    calculateDependencies(serializer: any, ast: any, options?: any): any {
        const parameters = {
            calculateDependencies: true,
            variables: [],
            result: [],
        };
        const input = serializer.fromJSON(ast, options);
        input.accept(this, parameters);
        return serializer.toJSON(input, options);
    }

    processFormulas(serializer: any, ast: any, options?: any): any[] {
        const parameters: any = {
            calculateDependencies: false,
            variables: [],
            result: [],
        };
        const input = serializer.fromJSON(ast, options);
        input.accept(this, parameters);
        return parameters.result;
    }
}

export default FormulaVisitor;
