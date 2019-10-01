# Markdown Transform

[![downloads](https://img.shields.io/npm/dm/@accordproject/markdown-cli)](https://www.npmjs.com/package/@accordproject/markdown-cli)
[![npm version](https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli.svg)](https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli.svg)
![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)

A transformation framework for converting markdown content to HTML, Slate (for rich-text editing) and others DOMs.

![Architecture Diagram](http://www.plantuml.com/plantuml/png/bP0nJyCm48Lt_ugdxabsX50b61Ye6CfMTR3iQ-BMiIFxeXGX_ZkDMvgeBWEROx_Sk-zRHfQ1-zOAqKbra3LXqSfmq7vmXR9cWIy1R3eP8ct5zzsKRrllBi7LvHPh3iRLMpmMVLSyOVESKkCpNjvNQPJpJ0YcRXX-boU0XhcB3rNLUaqsbb8f7tGN_9uKbpxKrRbwtAJwNQTi-0H3JcCSVrEIxoU0wrKVAO8Rma3M5ffsnf4MmDGobYAv291E8tuwbiUfxPuTeoZuP2T3dEIaq1nzy_gnUfj9p3APm2dn7u7fboHmEjugpA6YbKo9wTgQCQt7p5-hpXw1yuU9a0u9EnZL54n71cd3Fin8Xc4eK_i-ZW2pBSNoTEvR-mC0)

> Note: you can regenerate this diagram by visiting http://www.plantuml.com/plantuml/uml/ and pasting the contents of `architecture.puml` from this repository.

## Documentation

This mono-repo contains the following packages, where each package implements some transformations:

* markdown-common : converts markdown strings to/from the CommonMark DOM
* markdown-cicero : converts CommonMark DOM to/from the CiceroMark DOM
* markdown-slate : converts CiceroMark DOM to/from the Slate DOM
* markdown-html : converts CiceroMark DOM to HTML
* markdown-cli : command line utilities

###  CommonMark DOM

The CommonMark DOM is a model for the elements of CommonMark, expressed as a [Concerto schema](https://github.com/accordproject/concerto), and serialized as a JSON graph.

The schema is defined here: https://models.accordproject.org/commonmark/markdown.html

###  CiceroMark DOM

The CiceroMark DOM extends the CommonMark DOM, defining nodes for `Clause`, `Variable` and `ComputedVariable`.

The schema is defined here: https://models.accordproject.org/ciceromark/ciceromark.html

###  Slate DOM

The Slate DOM is defined by the [Slate](https://www.slatejs.org) HTML content-editable WYSIWYG editing framework.

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
