# Markdown-it Plugin for CiceroMark

A [`markdown-it`](https://github.com/markdown-it/markdown-it) plugin that adds support for the two CiceroMark-specific markdown constructs:

| Syntax                         | What it parses to        |
|--------------------------------|--------------------------|
| `{{#clause NAME}}…{{/clause}}` | A block-level `clause` (block_clause_open / block_clause_close tokens) |
| `{{%TS expression%}}`          | An inline `formula`      |

The plugin emits markdown-it tokens; see [`@accordproject/markdown-cicero`](../markdown-cicero) for the transformer that turns those tokens into a CiceroMark DOM.

## Installation

```
npm install @accordproject/markdown-it-cicero
```

## Usage

```ts
import MarkdownIt from 'markdown-it';
import MarkdownItCicero from '@accordproject/markdown-it-cicero';

const md = new MarkdownIt({ html: true }).use(MarkdownItCicero);

const tokens = md.parse(
    '{{#clause sample}}Total is {{%amount * rate%}}{{/clause}}',
    {}
);
```

In CommonJS:

```js
const MarkdownIt = require('markdown-it');
const MarkdownItCicero = require('@accordproject/markdown-it-cicero');

const md = new MarkdownIt({ html: true }).use(MarkdownItCicero);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
