# TemplateMark Transform

This package extends CommonMark to introduce Accord Project grammar support with:
1. Clause definitions
2. Variable definitions
3. Formulas

Use `TemplateMarkTransform` to map from CommonMark to TemplateMark DOM nodes.

## Installation

```
npm install @accordproject/markdown-template --save
```

## Usage

``` javascript

const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const ModelLoader = require('@accordproject/concerto-core').ModelLoader;

const modelManager = await ModelLoader.loadModelManager(null, parameters.ctoFiles);
const templateMarkTransformer = new TemplateMarkTransformer();

return templateMarkTransformer.fromMarkdownTemplate({ fileName:parameters.inputFileName, content:input }, modelManager, templateKind, options);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
