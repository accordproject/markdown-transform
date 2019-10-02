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

The schema is defined here: https://models.accordproject.org/cicero/dom.html

###  Slate DOM

The Slate DOM is defined by the [Slate](https://www.slatejs.org) HTML content-editable WYSIWYG editing framework.

## Available Scripts

In the project directory, you can run:

#### `npm run build:watch`

Runs the app in the development mode.<br>

Babel will recompile every change as it runs in _watch_ mode.

#### `npm run build`

Similar to `build:watch` but it's a one off build.

#### `npm run test`

Invokes _lerna_ to run the test suite.

---

## Instructions

This is a short reference guide, for a more full context, please refer to our [CONTRIBUTING guide][contributing] and information for [DEVELOPERS][developers].

### Development

1. Fork project to your repository
2. Clone to local machine with `git clone`
3. `cd` into the directory
4. Run `npm install`
5. Build in watch mode `npm run build:watch`

## Learn More About Accord Project

### Overview

- [Accord Project][apmain]
- [Accord Project News][apnews]
- [Accord Project Blog][apblog]
- [Accord Project Slack][apslack]
- [Accord Project Technical Documentation][apdoc]
- [Accord Project GitHub][apgit]

### Documentation

- [Getting Started with Accord Project][docwelcome]
- [Concepts and High-level Architecture][dochighlevel]
- [How to use the Cicero Templating System][doccicero]
- [How to Author Accord Project Templates][docstudio]
- [Ergo Language Guide][docergo]

## Contributing

The Accord Project technology is being developed as open source. All the software packages are being actively maintained on GitHub and we encourage organizations and individuals to contribute requirements, documentation, issues, new templates, and code.

Find out what’s coming on our [blog][apblog].

Join the Accord Project Technology Working Group [Slack channel][apslack] to get involved!

For code contributions, read our [CONTRIBUTING guide][contributing] and information for [DEVELOPERS][developers].

## License <a name="license"></a>

Accord Project source code files are made available under the [Apache License, Version 2.0][apache].
Accord Project documentation files are made available under the [Creative Commons Attribution 4.0 International License][creativecommons] (CC-BY-4.0).

Copyright 2018-2019 Clause, Inc. All trademarks are the property of their respective owners. See [LF Projects Trademark Policy](https://lfprojects.org/policies/trademark-policy/).

[cicero]: https://github.com/accordproject/cicero
[markdown]: https://github.com/accordproject/markdown-editor
[linuxfound]: https://www.linuxfoundation.org
[charter]: https://github.com/accordproject/markdown-transform/blob/master/CHARTER.md
[apmain]: https://accordproject.org/
[apworkgroup]: https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io
[apblog]: https://medium.com/@accordhq
[apnews]: https://www.accordproject.org/news/
[apgit]: https://github.com/accordproject/
[apdoc]: https://docs.accordproject.org/
[apslack]: https://accord-project-slack-signup.herokuapp.com
[docspec]: https://docs.accordproject.org/docs/spec-overview.html
[docwelcome]: https://docs.accordproject.org/docs/accordproject.html
[dochighlevel]: https://docs.accordproject.org/docs/spec-concepts.html
[docergo]: https://docs.accordproject.org/docs/logic-ergo.html
[docstart]: https://docs.accordproject.org/docs/accordproject.html
[doccicero]: https://docs.accordproject.org/docs/basic-use.html
[docstudio]: https://docs.accordproject.org/docs/advanced-latedelivery.html
[contributing]: https://github.com/accordproject/markdown-transform/blob/master/CONTRIBUTING.md
[developers]: https://github.com/accordproject/markdown-transform/blob/master/DEVELOPERS.md
[apache]: https://github.com/accordproject/markdown-transform/blob/master/LICENSE
[creativecommons]: http://creativecommons.org/licenses/by/4.0/
