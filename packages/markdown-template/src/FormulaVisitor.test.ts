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

import { ModelManager } from '@accordproject/concerto-core';
import { TemplateMarkModel } from '@accordproject/markdown-common';
import { FormulaVisitor } from './FormulaVisitor';
import { TemplateMarkTransformer } from './TemplateMarkTransformer';

const MODEL = `
namespace test@1.0.0
@template
concept TemplateData {
    o String name optional
    o String middleName optional
    o Boolean isActive optional
    o Boolean outer optional
    o Boolean inner optional
    o Boolean Math optional
    o Double loanAmount optional
    o Double amount optional
    o Double rate optional
    o Double limit optional
    o Integer loanDuration optional
}`;

interface DependencyCase {
    name: string;
    code: string;
    expected: string[];
}

const CASES: DependencyCase[] = [
    {
        name: 'a simple variable',
        code: 'accrualBasisFromDueDate',
        expected: ['accrualBasisFromDueDate'],
    },
    {
        name: 'a formula call (the callee is a dependency) and a string type assertion',
        code: 'monthlyPaymentFormula(loanAmount,rate,loanDuration) as "K0,0.00"',
        expected: ['loanAmount', 'loanDuration', 'monthlyPaymentFormula', 'rate'],
    },
    {
        name: 'optional chaining',
        code: 'a?.b?.c',
        expected: ['a'],
    },
    {
        name: 'property access',
        code: 'address.city',
        expected: ['address'],
    },
    {
        name: 'object literal keys and shorthand properties',
        code: '({ total: principal * rate, currency })',
        expected: ['currency', 'principal', 'rate'],
    },
    {
        name: 'a label in a bare block (not a dependency)',
        code: '{ total: principal }',
        expected: ['principal'],
    },
    {
        name: 'a computed property access',
        code: 'record[key]',
        expected: ['key', 'record'],
    },
    {
        name: 'a local arrow function parameter',
        code: 'items.map(x => x.amount)',
        expected: ['items'],
    },
    {
        name: 'a callback parameter that shadows an outer variable of the same name',
        code: 'return rate + items.map(rate => rate).length',
        expected: ['items', 'rate'],
    },
    {
        name: 'a callback parameter that does not hide the outer reference of another name',
        code: 'items.map(x => x.price) + x',
        expected: ['items', 'x'],
    },
    {
        name: 'a block-local declaration and an outer reference of the same name',
        code: '{ const rate = 1; return rate; } return rate',
        expected: ['rate'],
    },
    {
        name: 'a callback parameter and a block-local declaration inside the callback',
        code: 'items.map(rate => { const x = rate; return x; }) + rate',
        expected: ['items', 'rate'],
    },
    {
        name: 'a default parameter value (a reference) inside a callback',
        code: 'items.map((x = rate) => x) + rate',
        expected: ['items', 'rate'],
    },
    {
        name: 'a named function expression that refers to itself',
        code: '(function fact(n) { return n <= 1 ? 1 : n * fact(n - 1) })',
        expected: [],
    },
    {
        name: 'a function declaration that is visible in its enclosing scope',
        code: 'count(1); function count(n) { return n; }',
        expected: [],
    },
    {
        name: 'a method parameter scope',
        code: '({ run(amount) { return amount + rate; } })',
        expected: ['rate'],
    },
    {
        name: 'an object method parameter and its own block local',
        code: '({ run(rate) { const x = rate; return x; } }) + rate',
        expected: ['rate'],
    },
    {
        name: 'a for-of loop binding',
        code: 'for (const item of items) { total += item; }',
        expected: ['items', 'total'],
    },
    {
        name: 'a for loop binding',
        code: 'for (let i = 0; i < limit; i += step) { total += i; }',
        expected: ['limit', 'step', 'total'],
    },
    {
        name: 'a destructuring catch parameter with a default value',
        code: 'try { risky(); } catch ({ message = fallback }) { report(message, fallback); }',
        expected: ['fallback', 'report', 'risky'],
    },
    {
        name: 'a type-only import is not a binding and not a reference',
        code: 'import type { Foo as Alias } from "x"; return amount as Alias',
        expected: ['amount'],
    },
    {
        name: 'a per-specifier type import is not a binding',
        code: 'import { type Foo, helper } from "x"; return helper(amount) as Foo',
        expected: ['amount'],
    },
    {
        name: 'a value import binds its local alias',
        code: 'import { helper as h } from "x"; return h(amount)',
        expected: ['amount'],
    },
    {
        name: 'an export declaration',
        code: 'export const total = amount * rate;',
        expected: ['amount', 'rate'],
    },
    {
        name: 'a class body is not analysed, only the superclass',
        code: 'class A extends Base { method() { return amount; } }',
        expected: ['Base'],
    },
    {
        name: 'a this property access',
        code: 'this.amount + other',
        expected: ['other'],
    },
    {
        name: 'a computed this property access',
        code: 'this[key]',
        expected: ['key'],
    },
    {
        name: 'a var declaration is treated as block-scoped (hoisting is not modelled)',
        code: '{ var hidden = 1; } return hidden',
        expected: ['hidden'],
    },
    {
        name: 'an identifier captured from the outer scope',
        code: 'items.filter(x => x.active && includeInactive)',
        expected: ['includeInactive', 'items'],
    },
    {
        name: 'destructuring declarations',
        code: 'const { a, b: c } = source; a + c + d',
        expected: ['d', 'source'],
    },
    {
        name: 'built-in globals',
        code: 'Math.max(a, b)',
        expected: ['a', 'b'],
    },
    {
        name: 'the extended built-in list',
        code: 'BigInt(n) + Number(Symbol.iterator) + decodeURI(path) + undefined + NaN + Infinity + arguments',
        expected: ['n', 'path'],
    },
    {
        name: 'string literals and comments',
        code: '"a" + b /* c */',
        expected: ['b'],
    },
    {
        name: 'an identifier in a type assertion',
        code: 'x as Foo',
        expected: ['x'],
    },
    {
        name: 'a function type in a type assertion',
        code: 'x as (a: A) => B',
        expected: ['x'],
    },
    {
        name: 'a satisfies expression',
        code: 'x satisfies Foo',
        expected: ['x'],
    },
    {
        name: 'a non-null assertion',
        code: 'value!',
        expected: ['value'],
    },
    {
        name: 'a template literal expression',
        code: '`total ${principal + rate}`',
        expected: ['principal', 'rate'],
    },
    {
        name: 'function parameters',
        code: 'function total(a) { return a + b; }',
        expected: ['b'],
    },
    {
        name: 'catch parameters',
        code: 'try { risky() } catch (err) { report(err) }',
        expected: ['report', 'risky'],
    },
    {
        name: 'generic type arguments on a call',
        code: 'foo<A, B>(a)',
        expected: ['a', 'foo'],
    },
    {
        name: 'generic type arguments on a constructor',
        code: 'new Map<string, number>()',
        expected: [],
    },
    {
        name: 'a contextual keyword used as a variable',
        code: 'type',
        expected: ['type'],
    },
    {
        name: 'async used as an identifier',
        code: 'async',
        expected: ['async'],
    },
    {
        name: 'contextual keywords as object literal shorthand',
        code: '{ type, value }',
        expected: ['type', 'value'],
    },
    {
        name: 'a sequence expression in a conditional',
        code: '(a, b) ? c : d',
        expected: ['a', 'b', 'c', 'd'],
    },
    {
        name: 'a top-level return statement',
        code: 'return amount * rate',
        expected: ['amount', 'rate'],
    },
    {
        name: 'a return after local declarations',
        code: 'const total = amount * rate; return total',
        expected: ['amount', 'rate'],
    },
    {
        name: 'returns in both branches of an if',
        code: 'if (flag) { return a } else { return b }',
        expected: ['a', 'b', 'flag'],
    },
    {
        name: 'malformed input',
        code: 'a + (',
        expected: [],
    },
    {
        name: 'an unterminated string',
        code: '"unterminated',
        expected: [],
    },
];

/**
 * Collects every descendant node matching a predicate. The TemplateMark DOM
 * embeds children under a small number of names depending on the block type.
 */
function collect(node: any, predicate: (candidate: any) => boolean): any[] {
    const result: any[] = [];
    const visit = (candidate: any): void => {
        if (!candidate || typeof candidate !== 'object') {
            return;
        }
        if (predicate(candidate)) {
            result.push(candidate);
        }
        ['nodes', 'whenTrue', 'whenFalse', 'whenSome', 'whenNone'].forEach((field) => {
            const children = candidate[field];
            if (Array.isArray(children)) {
                children.forEach(visit);
            } else if (children && typeof children === 'object') {
                visit(children);
            }
        });
    };
    visit(node);
    return result;
}

const transform = (content: string): any => {
    const transformer = new TemplateMarkTransformer();
    const modelManager = new ModelManager();
    modelManager.addCTOModel(MODEL);
    return transformer.fromMarkdownTemplate({ content }, modelManager, 'clause');
};

const nodesOf = (ast: any, className: string): any[] =>
    collect(ast, (node) => node.$class === `${TemplateMarkModel.NAMESPACE}.${className}`);

const findNodes = (content: string, className: string): any[] =>
    nodesOf(transform(content), className);

const CONDITIONAL = 'ConditionalDefinition';
const FORMULA = 'FormulaDefinition';

describe('FormulaVisitor.calculateDependencies', () => {
    it.each(CASES)('extracts dependencies for $name', ({ code, expected }) => {
        expect(FormulaVisitor.calculateDependencies(code)).toEqual(expected);
    });
});

describe('FormulaVisitor template typing', () => {
    it('records the guarded property of an #if block as a dependency', () => {
        const [conditional] = findNodes('{{#if isActive}}This contract is active.{{/if}}', CONDITIONAL);
        expect(conditional).toBeDefined();
        expect(conditional.name).toEqual('isActive');
        expect(conditional.dependencies).toEqual(['isActive']);
    });

    it('uses a plain guard name even when it is a built-in JavaScript global', () => {
        const [conditional] = findNodes('{{#if Math}}Math is a model property here.{{/if}}', CONDITIONAL);
        expect(conditional).toBeDefined();
        expect(conditional.name).toEqual('Math');
        expect(conditional.dependencies).toEqual(['Math']);
    });

    it('records the identifiers referenced by a formula expression', () => {
        const [formula] = findNodes('Payment is {{% monthlyPaymentFormula(loanAmount,rate,loanDuration) as "K0,0.00" %}}.', FORMULA);
        expect(formula).toBeDefined();
        expect(formula.dependencies).toEqual(['loanAmount', 'loanDuration', 'monthlyPaymentFormula', 'rate']);
    });

    it('records identifiers in a formula that uses return', () => {
        const [formula] = findNodes('Payment is {{% return amount * rate %}}.', FORMULA);
        expect(formula).toBeDefined();
        expect(formula.dependencies).toEqual(['amount', 'rate']);
    });

    it('records identifiers in a condition attribute that uses return', () => {
        const [conditional] = findNodes('{{#if isActive condition="return amount > limit"}}Active.{{/if}}', CONDITIONAL);
        expect(conditional).toBeDefined();
        expect(conditional.condition.contents).toEqual('return amount > limit');
        expect(conditional.dependencies).toEqual(['amount', 'limit']);
    });

    it('records the condition attribute as a dependency', () => {
        const [conditional] = findNodes('{{#if isActive condition="amount > 0"}}Active.{{/if}}', CONDITIONAL);
        expect(conditional).toBeDefined();
        expect(conditional.condition.contents).toEqual('amount > 0');
        expect(conditional.dependencies).toEqual(['amount']);
    });

    it('visits a formula nested in the true branch of an #if', () => {
        const content = '{{#if isActive}}Payment {{% monthlyPayment(loanAmount) %}} is due.{{/if}}';
        const ast = transform(content);
        const [conditional] = nodesOf(ast, CONDITIONAL);
        expect(conditional.dependencies).toEqual(['isActive']);
        const [formula] = nodesOf(ast, FORMULA);
        expect(formula.dependencies).toEqual(['loanAmount', 'monthlyPayment']);
    });

    it('visits a formula nested in the else branch of an #if', () => {
        const content = '{{#if isActive}}Nothing due.{{else}}Payment {{% monthlyPayment(loanAmount) %}} is due.{{/if}}';
        const ast = transform(content);
        const [conditional] = nodesOf(ast, CONDITIONAL);
        expect(conditional.dependencies).toEqual(['isActive']);
        const [formula] = nodesOf(ast, FORMULA);
        expect(formula.dependencies).toEqual(['loanAmount', 'monthlyPayment']);
    });

    it('visits a formula nested in an #optional', () => {
        const content = '{{#optional middleName}}Middle name {{% formatName(middleName) %}}.{{else}}No middle name.{{/optional}}';
        const [formula] = findNodes(content, FORMULA);
        expect(formula).toBeDefined();
        expect(formula.dependencies).toEqual(['formatName', 'middleName']);
    });

    it('visits a formula nested in the else branch of an #optional', () => {
        const content = '{{#optional middleName}}Middle name.{{else}}Missing {{% formatName(name) %}}.{{/optional}}';
        const [formula] = findNodes(content, FORMULA);
        expect(formula).toBeDefined();
        expect(formula.dependencies).toEqual(['formatName', 'name']);
    });

    it('visits an #if nested inside an #if', () => {
        const content = '{{#if outer}}Outer {{#if inner}}inner{{/if}}.{{/if}}';
        const conditionals = findNodes(content, CONDITIONAL);
        expect(conditionals).toHaveLength(2);
        expect(conditionals.find((node) => node.name === 'outer').dependencies).toEqual(['outer']);
        expect(conditionals.find((node) => node.name === 'inner').dependencies).toEqual(['inner']);
    });

    it('visits a formula nested inside an #if inside an #if', () => {
        const content = '{{#if outer}}Outer {{#if inner}}inner {{% payment(amount) %}}{{/if}}.{{/if}}';
        const ast = transform(content);
        const conditionals = nodesOf(ast, CONDITIONAL);
        expect(conditionals.find((node) => node.name === 'inner').dependencies).toEqual(['inner']);
        const [formula] = nodesOf(ast, FORMULA);
        expect(formula.dependencies).toEqual(['amount', 'payment']);
    });
});
