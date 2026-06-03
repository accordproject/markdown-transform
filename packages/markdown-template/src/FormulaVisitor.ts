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
 * Walks a TemplateMark DOM to compute or extract formula dependencies
 */
export class FormulaVisitor {
    static visitChildren(visitor: FormulaVisitor, thing: any, parameters: any, field = 'nodes'): void {
        if (thing[field]) {
            FormulaVisitor.visitNodes(visitor, thing[field], parameters);
        }
    }

    static visitNodes(visitor: FormulaVisitor, things: any[], parameters: any): void {
        things.forEach((node) => {
            node.accept(visitor, parameters);
        });
    }

    static calculateDependencies(tsCode: string): string[] {
        try {
            const deps: string[] = [];
            // TODO!!
            return deps;
        } catch (err) {
            throw new Error(`Failed to calculate dependencies in code '${tsCode}'. Error: ${err}`);
        }
    }

    visit(thing: any, parameters: any): void {
        switch (thing.getType()) {
            case 'ConditionalDefinition':
                if (parameters.calculateDependencies) {
                    if (thing.condition) {
                        thing.dependencies = FormulaVisitor.calculateDependencies(thing.condition.contents);
                    }
                } else {
                    parameters.result.push({ name: thing.name, code: thing.condition });
                }
                break;
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
