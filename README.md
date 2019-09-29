# Markdown Transform

[![Build Status](https://travis-ci.org/accordproject/markdown-transform.svg?branch=master)](https://travis-ci.org/accordproject/markdown-transform) [![npm version](https://img.shields.io/npm/v/@accordproject/markdown-cli)](https://www.npmjs.com/package/@accordproject/markdown-cli) <a href="https://www.npmjs.com/package/@accordproject/markdown-cli"><img src="https://img.shields.io/npm/dm/markdown-transform" alt="downloads: unknown/month"></a>

A markdown transformation framework

## Documentation

CommonMark converts markdown text to/from an instance of the CommonMark AST.
CiceroMark converts markdown ASTs to/from Cicero-specific Markdown AST.
SlateMark converts markdown ASTs to Slate DOM.

See the unit test for example usage.

## Installation

```
npm install -g @accordproject/markdown-cli --save
```

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
