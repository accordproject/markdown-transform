# Markdown-it Plugin for TemplateMark

A [`markdown-it`](https://github.com/markdown-it/markdown-it) plugin that adds support for TemplateMark syntax — block-level template definitions (clauses, ordered/unordered list templates) and inline template constructs (variables, conditionals, optionals, with, join, formulas).

The plugin emits markdown-it tokens; see [`@accordproject/markdown-template`](../markdown-template) for the higher-level transformer that turns those tokens into a TemplateMark DOM.

## Installation

```
npm install @accordproject/markdown-it-template
```

## Usage

```ts
import MarkdownIt from 'markdown-it';
import MarkdownItTemplate from '@accordproject/markdown-it-template';

const md = new MarkdownIt({ html: true }).use(MarkdownItTemplate);

const tokens = md.parse(
    'Hello {{name}}, {{#if hasGift}}enjoy{{else}}sorry{{/if}}!',
    {}
);
```

In CommonJS:

```js
const MarkdownIt = require('markdown-it');
const MarkdownItTemplate = require('@accordproject/markdown-it-template');

const md = new MarkdownIt({ html: true }).use(MarkdownItTemplate);
```

## Syntax supported

Block constructs (each on its own paragraph):

| Open                          | Close          | TemplateMark node               |
|-------------------------------|----------------|---------------------------------|
| `{{#clause NAME}}`            | `{{/clause}}`  | `ClauseDefinition`              |
| `{{#ulist NAME}}`             | `{{/ulist}}`   | `ListBlockDefinition` (bullet)  |
| `{{#olist NAME}}`             | `{{/olist}}`   | `ListBlockDefinition` (ordered) |

Inline constructs:

| Syntax                                | TemplateMark node              |
|---------------------------------------|--------------------------------|
| `{{name}}` or `{{name as "format"}}`  | `VariableDefinition` / `FormattedVariableDefinition` |
| `{{this}}` or `{{this as "format"}}`  | `VariableDefinition` for the current scope |
| `{{%TS code%}}`                       | `FormulaDefinition`            |
| `{{#if NAME}}…{{else}}…{{/if}}`       | `ConditionalDefinition`        |
| `{{#optional NAME}}…{{/optional}}`    | `OptionalDefinition`           |
| `{{#with NAME}}…{{/with}}`            | `WithDefinition`               |
| `{{#join NAME ...}}…{{/join}}`        | `JoinDefinition`               |

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
