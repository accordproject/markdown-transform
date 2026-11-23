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
 * walked by a small recursive visitor. The walk collects every identifier
 * that is used as a value, skips the positions where an identifier is a name
 * rather than a reference (property names after `.`, object-literal keys,
 * labels, type positions), and subtracts every name the code binds itself
 * (declarations, parameters, catch clauses, destructuring patterns).
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
 * - `var` hoisting is not modelled and bindings are collected for the whole
 *   snippet, so a name bound anywhere is not reported anywhere;
 * - JSX, decorators and type-only declarations are unsupported;
 * - assignment targets and `++`/`--` operands are reported as dependencies;
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
 * except the five expression wrappers handled in `collectReferences`.
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
 * First pass: every name the snippet binds itself.
 */
function collectBindings(node: any, names: Set<string>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    switch (node.type) {
        case 'VariableDeclarator':
            collectPatternNames(node.id, names);
            break;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'ObjectMethod':
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareFunction':
            collectPatternNames(node.id, names);
            node.params.forEach((param: any) => collectPatternNames(param, names));
            break;
        case 'CatchClause':
            collectPatternNames(node.param, names);
            break;
        default:
            break;
    }
    forEachChild(node, (child) => collectBindings(child, names));
}

/**
 * Second pass: every identifier used as a value. Binding names are still
 * collected here; they are subtracted from the result at the end.
 *
 * Nodes whose meaning does not change which identifiers are references are
 * handled by the generic child walk at the bottom: calls, `new`, arrays,
 * template literals, conditional/logical/binary/unary/update/assignment and
 * sequence expressions, arrow/function declarations and expressions, variable
 * declarations, blocks, `for`/`for-of`/`for-in`, `if`, `try`/`catch`,
 * `while`/`do-while`, `switch`, `return`/`throw`, `await` and `yield`.
 */
function collectReferences(node: any, names: Set<string>): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    switch (node.type) {
        case 'Identifier':
            names.add(node.name);
            return;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
            // `a.b` depends on `a`, not on `b`; `a[b]` depends on both.
            collectReferences(node.object, names);
            if (node.computed) {
                collectReferences(node.property, names);
            }
            return;
        case 'ObjectExpression':
            node.properties.forEach((property: any) => collectReferences(property, names));
            return;
        case 'ObjectProperty':
        case 'Property':
            // `{ key: value }` depends on `value`; shorthand `{ key }` is a
            // reference too, because its value is the same identifier.
            if (node.computed) {
                collectReferences(node.key, names);
            }
            collectReferences(node.value, names);
            return;
        case 'ObjectMethod':
        case 'ClassMethod':
        case 'ClassPrivateMethod':
            if (node.computed) {
                collectReferences(node.key, names);
            }
            node.params.forEach((param: any) => collectReferences(param, names));
            collectReferences(node.body, names);
            return;
        case 'ClassProperty':
        case 'ClassPrivateProperty':
            if (node.computed) {
                collectReferences(node.key, names);
            }
            collectReferences(node.value, names);
            return;
        case 'ClassDeclaration':
        case 'ClassExpression':
            // Class bodies are out of scope; only the superclass expression
            // can reference a value.
            collectReferences(node.superClass, names);
            return;
        case 'LabeledStatement':
            // The label is a name, not a reference (`{ total: a + b }` at
            // statement position parses as a labelled statement).
            collectReferences(node.body, names);
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
            collectReferences(node.expression, names);
            return;
        default:
            break;
    }
    if (isTypeOnlySubtree(node)) {
        return;
    }
    forEachChild(node, (child) => collectReferences(child, names));
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
        const bindings = new Set<string>();
        const references = new Set<string>();
        collectBindings(ast.program, bindings);
        collectReferences(ast.program, references);
        return Array.from(references)
            .filter((name) => !bindings.has(name) && !BUILT_INS.has(name))
            .sort();
    } catch (err) {
        return [];
    }
}

export default calculateDependencies;
