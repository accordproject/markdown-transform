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

import { parse } from '@babel/parser';

/**
 * Computes the root identifiers that a TemplateMark formula or condition
 * depends on.
 *
 * The expression is parsed once with Babel's TypeScript parser and then
 * walked by a small recursive visitor that carries a stack of lexical
 * scopes. A scope exists for the program, each block, each function, arrow
 * or method (its parameters and name), each catch clause, each loop head and
 * the shared case clauses of a switch statement. A scope records the names it
 * binds, and an identifier is reported only when no scope on the stack binds
 * it. This is resolved at the reference site, so a callback parameter shadows
 * an outer variable of the same name only inside the callback body:
 *
 *     return rate + items.map(rate => rate).length
 *
 * reports both `items` and the outer `rate`, because the inner `rate` is
 * bound by the arrow parameter and the outer one is not bound anywhere.
 *
 * Bindings are collected for a scope before its statements are walked, so a
 * `const`, `let`, `function` or `class` declaration is visible throughout
 * its block even when it appears after the reference. The positions where an
 * identifier is a name rather than a reference (property names after `.`,
 * non-computed object keys, labels, type positions) are skipped, and import
 * declarations bind their local names but never count as references.
 *
 * The result is sorted and de-duplicated so it can be stored in the
 * `dependencies` field of a TemplateMark node and compared by value.
 *
 * Contract: the visitor never throws. Input Babel cannot parse (or that the
 * walk cannot handle) yields an empty list, because a bad formula must not
 * break TemplateMark typing.
 *
 * Known limitations:
 *
 * - class bodies are not analysed; only a superclass expression is visited;
 * - `var` hoisting is not modelled: a `var` declaration binds in its block,
 *   so a `var` declared in a nested block does not bind a reference outside
 *   that block;
 * - `import type` statements and per-specifier `type` imports are skipped
 *   entirely; value imports bind their local names;
 * - JSX and decorators are unsupported;
 * - assignment targets and `++`/`--` operands are reported as dependencies;
 * - `this.x` reports nothing: `this` is not a template variable and only a
 *   computed key (`this[k]`) contributes a dependency;
 * - identifiers may be non-ASCII (Babel accepts them) but the built-in list
 *   below only names ASCII globals.
 */

/**
 * Conservative list of JavaScript globals. A template variable that happens
 * to share one of these names is not reported as a dependency; that is
 * preferable to reporting every use of `Math`, `JSON`, etc.
 */
const BUILT_INS = new Set([
    'Array',
    'BigInt',
    'Boolean',
    'Date',
    'Error',
    'Infinity',
    'Intl',
    'JSON',
    'Map',
    'Math',
    'NaN',
    'Number',
    'Object',
    'Promise',
    'Reflect',
    'RegExp',
    'Set',
    'String',
    'Symbol',
    'WeakMap',
    'WeakSet',
    'arguments',
    'console',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'undefined',
]);

/**
 * Fields Babel adds to every node that never contain child syntax we care
 * about. Skipping them keeps the generic walk cheap and avoids descending
 * into source locations and comments.
 */
const NON_SYNTAX_FIELDS = new Set([
    'type',
    'start',
    'end',
    'loc',
    'range',
    'extra',
    'comments',
    'tokens',
    'errors',
    'leadingComments',
    'trailingComments',
    'innerComments',
]);

/**
 * Node types that introduce a type-only subtree, i.e. every `TS*` type node
 * except the five expression wrappers handled in `visit`.
 */
function isTypeOnlySubtree(node: any): boolean {
    return typeof node.type === 'string' && node.type.startsWith('TS')
        && node.type !== 'TSAsExpression'
        && node.type !== 'TSTypeAssertion'
        && node.type !== 'TSSatisfiesExpression'
        && node.type !== 'TSNonNullExpression'
        && node.type !== 'TSInstantiationExpression';
}

/**
 * Calls `callback` for each direct child node, in source order.
 */
function forEachChild(node: any, callback: (child: any) => void): void {
    Object.keys(node).forEach((key) => {
        if (NON_SYNTAX_FIELDS.has(key)) {
            return;
        }
        const value = node[key];
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item && typeof item === 'object' && typeof item.type === 'string') {
                    callback(item);
                }
            });
        } else if (value && typeof value === 'object' && typeof value.type === 'string') {
            callback(value);
        }
    });
}

/**
 * Records every name bound by a binding pattern (identifier, object/array
 * pattern, default value or rest element).
 */
function collectPatternNames(node: any, names: Set<string>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    switch (node.type) {
        case 'Identifier':
            names.add(node.name);
            return;
        case 'ObjectPattern':
            node.properties.forEach((property: any) => {
                // `{ a }` and `{ a: b }` bind `value`; `{ ...rest }` binds
                // the rest argument.
                collectPatternNames(property.type === 'RestElement' ? property.argument : property.value, names);
            });
            return;
        case 'ArrayPattern':
            node.elements.forEach((element: any) => collectPatternNames(element, names));
            return;
        case 'AssignmentPattern':
            collectPatternNames(node.left, names);
            return;
        case 'RestElement':
            collectPatternNames(node.argument, names);
            return;
        case 'TSParameterProperty':
            collectPatternNames(node.parameter, names);
            return;
        default:
            return;
    }
}

/**
 * Returns the declaration wrapped by an export statement, if any.
 */
function unwrapExport(statement: any): any {
    if (statement && (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration')) {
        return statement.declaration;
    }
    return statement;
}

/**
 * Records the names a single statement binds at the top level of a scope.
 * Only direct declarations count: nested blocks and functions introduce
 * their own scopes.
 */
function collectStatementBindings(statement: any, names: Set<string>): void {
    const declaration = unwrapExport(statement);
    if (!declaration) {
        return;
    }
    switch (declaration.type) {
        case 'VariableDeclaration':
            declaration.declarations.forEach((declarator: any) => collectPatternNames(declarator.id, names));
            return;
        case 'FunctionDeclaration':
        case 'ClassDeclaration':
        case 'TSDeclareFunction':
        case 'TSEnumDeclaration':
            if (declaration.id) {
                names.add(declaration.id.name);
            }
            return;
        case 'ImportDeclaration':
            // `import type` and `import { type Foo }` only name types; the
            // names they introduce are not values and must not shadow.
            if (declaration.importKind !== 'type') {
                declaration.specifiers.forEach((specifier: any) => {
                    if (specifier.importKind !== 'type' && specifier.local) {
                        names.add(specifier.local.name);
                    }
                });
            }
            return;
        default:
            return;
    }
}

/**
 * Creates the scope for a statement list and records its direct bindings
 * before any statement is walked.
 */
function pushScope(statements: any[], scopes: Set<string>[]): void {
    const scope = new Set<string>();
    statements.forEach((statement) => collectStatementBindings(statement, scope));
    scopes.push(scope);
}

/**
 * True when a name is bound by the current scope or any enclosing scope.
 */
function isBound(name: string, scopes: Set<string>[]): boolean {
    for (let index = scopes.length - 1; index >= 0; index -= 1) {
        if (scopes[index].has(name)) {
            return true;
        }
    }
    return false;
}

/**
 * Visits a binding pattern's references without reporting its names. Default
 * values are expressions (references), computed object keys are expressions,
 * and the pattern names themselves are bindings.
 */
function visitPattern(node: any, scopes: Set<string>[], references: Set<string>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    switch (node.type) {
        case 'Identifier':
            return;
        case 'ObjectPattern':
            node.properties.forEach((property: any) => {
                if (property.type === 'RestElement') {
                    visitPattern(property.argument, scopes, references);
                    return;
                }
                if (property.computed) {
                    visit(property.key, scopes, references);
                }
                visitPattern(property.value, scopes, references);
            });
            return;
        case 'ArrayPattern':
            node.elements.forEach((element: any) => visitPattern(element, scopes, references));
            return;
        case 'AssignmentPattern':
            // `x = fallback`: `fallback` is a reference, `x` is a binding.
            visit(node.right, scopes, references);
            visitPattern(node.left, scopes, references);
            return;
        case 'RestElement':
            visitPattern(node.argument, scopes, references);
            return;
        case 'TSParameterProperty':
            visitPattern(node.parameter, scopes, references);
            return;
        default:
            // Not a binding pattern (e.g. an assignment target such as
            // `[obj.x] = items`); fall back to normal reference handling.
            visit(node, scopes, references);
    }
}

/**
 * Walks one node, resolving identifiers against the scope stack. Nodes whose
 * meaning does not change which identifiers are references fall through to
 * the generic child walk at the bottom: calls, `new`, arrays, template
 * literals, conditional/logical/binary/unary/update/assignment and sequence
 * expressions, `if`, `try`, `while`/`do-while`, `switch`, `return`/`throw`,
 * `await` and `yield`.
 */
function visit(node: any, scopes: Set<string>[], references: Set<string>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    switch (node.type) {
        case 'Identifier':
            if (!isBound(node.name, scopes) && !BUILT_INS.has(node.name)) {
                references.add(node.name);
            }
            return;
        case 'Program':
        case 'BlockStatement':
            pushScope(node.body, scopes);
            node.body.forEach((statement: any) => visit(statement, scopes, references));
            scopes.pop();
            return;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'ObjectMethod':
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareFunction': {
            // A declaration's name is visible in the enclosing scope; a named
            // function expression's name is visible only inside itself.
            if (node.type === 'FunctionDeclaration' && node.id && scopes.length > 0) {
                scopes[scopes.length - 1].add(node.id.name);
            }
            if (node.computed) {
                visit(node.key, scopes, references);
            }
            const scope = new Set<string>();
            if (node.id) {
                scope.add(node.id.name);
            }
            node.params.forEach((param: any) => collectPatternNames(param, scope));
            scopes.push(scope);
            node.params.forEach((param: any) => visitPattern(param, scopes, references));
            visit(node.body, scopes, references);
            scopes.pop();
            return;
        }
        case 'CatchClause': {
            const scope = new Set<string>();
            collectPatternNames(node.param, scope);
            scopes.push(scope);
            visitPattern(node.param, scopes, references);
            visit(node.body, scopes, references);
            scopes.pop();
            return;
        }
        case 'ForStatement': {
            // The loop head and body share the loop's lexical scope, which
            // holds a `let`/`const` declared by the initialiser.
            scopes.push(new Set<string>());
            visit(node.init, scopes, references);
            visit(node.test, scopes, references);
            visit(node.update, scopes, references);
            visit(node.body, scopes, references);
            scopes.pop();
            return;
        }
        case 'ForOfStatement':
        case 'ForInStatement': {
            // The right-hand side is evaluated outside the loop binding.
            visit(node.right, scopes, references);
            scopes.push(new Set<string>());
            visit(node.left, scopes, references);
            visit(node.body, scopes, references);
            scopes.pop();
            return;
        }
        case 'SwitchStatement': {
            // The discriminant is evaluated outside the case scope. All case
            // clauses share one lexical scope, and their direct declarations
            // are visible throughout that scope, so collect them before
            // visiting any case; leave the scope before later statements.
            visit(node.discriminant, scopes, references);
            const switchScope = new Set<string>();
            node.cases.forEach((switchCase: any) => {
                switchCase.consequent.forEach((statement: any) => collectStatementBindings(statement, switchScope));
            });
            scopes.push(switchScope);
            node.cases.forEach((switchCase: any) => {
                visit(switchCase.test, scopes, references);
                switchCase.consequent.forEach((statement: any) => visit(statement, scopes, references));
            });
            scopes.pop();
            return;
        }
        case 'VariableDeclaration':
            node.declarations.forEach((declarator: any) => {
                collectPatternNames(declarator.id, scopes[scopes.length - 1]);
                visitPattern(declarator.id, scopes, references);
                visit(declarator.init, scopes, references);
            });
            return;
        case 'ImportDeclaration':
        case 'ExportAllDeclaration':
            // Imports bind names, they are not references; an export-all has
            // no local value reference.
            return;
        case 'ExportNamedDeclaration':
            // `export { a }` is a name, not a value reference.
            visit(node.declaration, scopes, references);
            return;
        case 'ExportDefaultDeclaration':
            visit(node.declaration, scopes, references);
            return;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
            // `a.b` depends on `a`, not on `b`; `a[b]` depends on both.
            visit(node.object, scopes, references);
            if (node.computed) {
                visit(node.property, scopes, references);
            }
            return;
        case 'ObjectExpression':
            node.properties.forEach((property: any) => visit(property, scopes, references));
            return;
        case 'ObjectProperty':
        case 'Property':
            // `{ key: value }` depends on `value`; shorthand `{ key }` is a
            // reference too, because its value is the same identifier.
            if (node.computed) {
                visit(node.key, scopes, references);
            }
            visit(node.value, scopes, references);
            return;
        case 'ClassDeclaration':
        case 'ClassExpression':
            // Class bodies are out of scope; only the superclass expression
            // can reference a value.
            visit(node.superClass, scopes, references);
            return;
        case 'LabeledStatement':
            // The label is a name, not a reference (`{ total: a + b }` at
            // statement position parses as a labelled statement).
            visit(node.body, scopes, references);
            return;
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'MetaProperty':
        case 'Super':
        case 'ThisExpression':
        case 'PrivateName':
        case 'StringLiteral':
        case 'NumericLiteral':
        case 'BooleanLiteral':
        case 'NullLiteral':
        case 'BigIntLiteral':
        case 'RegExpLiteral':
        case 'DecimalLiteral':
        case 'TemplateElement':
        case 'Literal':
            return;
        case 'TSAsExpression':
        case 'TSTypeAssertion':
        case 'TSSatisfiesExpression':
        case 'TSNonNullExpression':
        case 'TSInstantiationExpression':
            // `x as Foo`, `<Foo>x`, `x satisfies Foo`, `x!` and `foo<T>` are
            // value expressions wrapped in type syntax: visit the value only.
            visit(node.expression, scopes, references);
            return;
        default:
            break;
    }
    if (isTypeOnlySubtree(node)) {
        return;
    }
    forEachChild(node, (child) => visit(child, scopes, references));
}

/**
 * Returns the sorted, de-duplicated names a TypeScript snippet depends on.
 * Never throws: malformed input yields an empty list.
 *
 * @param tsCode the TypeScript expression or statements to analyse
 * @return the root identifiers referenced by the snippet
 */
export function calculateDependencies(tsCode: string): string[] {
    try {
        const ast = parse(tsCode, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
            plugins: ['typescript'],
        });
        const references = new Set<string>();
        visit(ast.program, [], references);
        return Array.from(references).sort();
    } catch (err) {
        return [];
    }
}

export default calculateDependencies;
