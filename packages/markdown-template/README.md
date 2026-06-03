# TemplateMark Transformer

Parses markdown templates (TemplateMark) into a typed DOM that captures clause/contract structure, variable references, conditionals, optionals, list iteration, joins, and embedded TypeScript formulas.

TemplateMark extends the CommonMark DOM with:

- `ClauseDefinition`, `ContractDefinition`
- `VariableDefinition`, `FormattedVariableDefinition`, `EnumVariableDefinition`
- `ConditionalDefinition`, `OptionalDefinition`
- `WithDefinition`, `JoinDefinition`, `ListBlockDefinition`
- `FormulaDefinition`

Schema: [`templatemark@0.5.0`](https://models.accordproject.org/markdown/templatemark@0.5.0.html).

## Installation

```
npm install @accordproject/markdown-template
```

Peer dependencies: `@accordproject/concerto-core@^4.1.3` and `@accordproject/concerto-cto@^4.1.3`.

## Usage

A template needs a Concerto model that defines the shape of the data being templated. The model must declare exactly one concept decorated with `@template`.

```ts
import { TemplateMarkTransformer } from '@accordproject/markdown-template';
import { ModelManager } from '@accordproject/concerto-core';

const model = `
namespace org.example@1.0.0
@template
concept Greeting {
    o String name
}`;

const modelManager = new ModelManager();
modelManager.addCTOModel(model);

const transformer = new TemplateMarkTransformer();
const templateMark = transformer.fromMarkdownTemplate(
    { content: 'Hello {{name}}.' },
    modelManager,
    'clause'
);
```

The returned `templateMark` is a JSON document conforming to the TemplateMark schema. Pass `'contract'` instead of `'clause'` if the template is a contract.

In CommonJS:

```js
const { TemplateMarkTransformer } = require('@accordproject/markdown-template');
```

## What this package exports

- `TemplateMarkTransformer` — markdown_template ↔ TemplateMark DOM
- `templatemarkutil` — lower-level helpers for tokenization and typing
- `datetimeutil`, `util` — date/time and hashing utilities
- `TemplateException` — error type thrown for invalid templates
- `normalizeNLs` — normalize line endings

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
