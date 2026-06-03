# CiceroMark Transformer

Converts CiceroMark — markdown with embedded contract clauses, variables, conditionals, formulas and lists — to/from CommonMark and to/from markdown text.

CiceroMark extends CommonMark with these additional nodes:

- `Clause`
- `Variable`, `FormattedVariable`, `EnumVariable`
- `Conditional`, `Optional`
- `Formula`
- `ListBlock`

Schema: [`ciceromark@0.6.0`](https://models.accordproject.org/markdown/ciceromark@0.6.0.html).

## Installation

```
npm install @accordproject/markdown-cicero
```

Peer dependency: `@accordproject/concerto-core@^4.1.2`.

## Usage

```ts
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';

const ciceroMarkTransformer = new CiceroMarkTransformer();

// markdown_cicero string → CiceroMark DOM
const dom = ciceroMarkTransformer.fromMarkdownCicero(
    '{{#clause greeting}}Hello {{name}}{{/clause}}'
);

// CiceroMark DOM → markdown_cicero string
const newMarkdown = ciceroMarkTransformer.toMarkdownCicero(dom);
```

If you have a plain markdown string (no clauses/variables), use `fromMarkdown` / `toMarkdown` — they round-trip through CommonMark.

## What this package exports

- `CiceroMarkTransformer` — the main entry point
- `FromCiceroEditVisitor` — convert legacy CiceroEdit markdown into CiceroMark
- `ToCommonMarkVisitor` — strip CiceroMark-specific nodes back to plain CommonMark
- `Decorators` — read structured decorators (`@decorator(args)`) attached to CiceroMark nodes

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
