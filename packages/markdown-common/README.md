# CommonMark Transformer

Converts markdown text to/from a CommonMark DOM.

The CommonMark DOM is a Concerto model — see [`commonmark@0.5.0`](https://models.accordproject.org/markdown/commonmark@0.5.0.html).

## Installation

```
npm install @accordproject/markdown-common
```

Peer dependency: `@accordproject/concerto-core@^4.1.3`.

## Usage

```ts
import { CommonMarkTransformer } from '@accordproject/markdown-common';

const transformer = new CommonMarkTransformer();
const dom = transformer.fromMarkdown('# Heading\n\nThis is some `code`.\n\nFin.');
console.log(JSON.stringify(dom, null, 4));
```

CommonJS works too:

```js
const { CommonMarkTransformer } = require('@accordproject/markdown-common');
```

The output is:

```json
{
    "$class": "org.accordproject.commonmark@0.5.0.Document",
    "xmlns": "http://commonmark.org/xml/1.0",
    "nodes": [
        {
            "$class": "org.accordproject.commonmark@0.5.0.Heading",
            "level": "1",
            "nodes": [
                {
                    "$class": "org.accordproject.commonmark@0.5.0.Text",
                    "text": "Heading"
                }
            ]
        },
        {
            "$class": "org.accordproject.commonmark@0.5.0.Paragraph",
            "nodes": [
                {
                    "$class": "org.accordproject.commonmark@0.5.0.Text",
                    "text": "This is some "
                },
                {
                    "$class": "org.accordproject.commonmark@0.5.0.Code",
                    "text": "code"
                },
                {
                    "$class": "org.accordproject.commonmark@0.5.0.Text",
                    "text": "."
                }
            ]
        },
        {
            "$class": "org.accordproject.commonmark@0.5.0.Paragraph",
            "nodes": [
                {
                    "$class": "org.accordproject.commonmark@0.5.0.Text",
                    "text": "Fin."
                }
            ]
        }
    ]
}
```

You can manipulate the DOM and convert it back to markdown:

```ts
dom.nodes[0].nodes[0].text = 'My New Heading';
const newMarkdown = transformer.toMarkdown(dom);
console.log(newMarkdown);
```

The new markdown string will be:

```markdown
My New Heading
====

This is some `code`.

Fin.
```

> Note how the H1 heading has been normalized during conversion from `#` syntax to `====` syntax. In CommonMark these are equivalent.

## What this package exports

- `CommonMarkTransformer` — markdown ↔ CommonMark DOM
- `ToMarkdownVisitor`, `FromCommonMarkVisitor`, `FromMarkdownIt` — lower-level building blocks
- `CommonMarkUtils` — helpers for rendering markdown (escaping, list prefixes, etc.)
- `Stack` — generic stack used by the visitors
- `CommonMarkModel`, `CiceroMarkModel`, `ConcertoMetaModel`, `TemplateMarkModel` — Concerto namespace/MODEL strings consumed by the other packages in this monorepo

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
