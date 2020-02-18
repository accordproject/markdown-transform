# Slate Transformer

Use `SlateTransformer` to transform a CiceroMark DOM to/from a JSON representation for the Slate DOM (version 0.4x.x).

## Installation

```
npm install @accordproject/markdown-slate --save
```

## Usage

``` javascript
const SlateTransformer = require('@accordproject/markdown-slate').SlateTransformer;
slateTransformer = new SlateTransformer();
const slateValue = slateTransformer.fromMarkdown('test <variable id="foo" value="bar"/>');
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
