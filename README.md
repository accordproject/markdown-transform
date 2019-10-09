<h1 align="center">Markdown Transform</h1>

<p align="center">
   
  <a href="https://www.npmjs.com/package/@accordproject/markdown-cli">
      <img src="https://img.shields.io/npm/dm/@accordproject/markdown-cli" alt="downloads" />
  </a>
  <a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli">
      <img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli.svg" alt="npm version" />
  </a>
  <a href="https://travis-ci.org/accordproject/markdown-transform">
      <img src="https://travis-ci.org/accordproject/markdown-transform.svg" alt="Build Status" />
  </a>
  <a href="">
      <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna" />
  </a>
  <a href="https://github.com/accordproject/markdown-transform/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/accordproject/markdown-transform" alt="GitHub license" />
  </a>
  <a href="https://accord-project-slack-signup.herokuapp.com/">
      <img src="https://img.shields.io/badge/Slack-Join%20Slack-blue" alt="Join the Accord Project Slack" />
  </a>

</p>

[![join slack](]()

A transformation framework for converting markdown content to HTML, Slate (for rich-text editing) and others DOMs.

![Architecture Diagram](http://www.plantuml.com/plantuml/png/bP6zJiCm58NtFCLHzoGxGgWI30nK36MhEbZnJUBMFv5zenGXtXtPDQGYfH9ROf_Syzqlwy32ysXqCOZcA3h2oWX_b6woPQFL2Xy5i1k43xGlFejhAMUCipcuoQVOibUss-E-78Vo0Rl7b8hNU7hTf57MCS6hhcUuTfa0UkOXtDMrSP9qg4JJE2y7xmxKSELyLv-h8qdzZLFrR7H1LYAENvJyvYk0dwFMUIEOIOBfn1W31N1FA829j2ubjSgInDmQ8P3S-9WILYAyMnQd6U2QCDMGTqdOOklPLmejVMbgiwuS-8-kz4dIDJzcOJTuWnPC6JUtBd2tCNETzF8EEB-e067n_BPvWLTDNoRX91KxVx78D4rLAZ-4o7yJCcxn1sD6Z6tvjqV8DLav6lq5)

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

#### `npm run build`

Invokes _lerna_ to build all the `markdown-*` packages.

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

---

<a href="https://www.accordproject.org/">
  <p align="center">
    <img src="APLogo.png" align='middle' alt="Accord Project Logo" width="400" />
  </p>
</a>

Accord Project is an open source, non-profit, initiative working to transform contract management and contract automation by digitizing contracts. Accord Project operates under the umbrella of the [Linux Foundation][linuxfound]. The technical charter for the Accord Project can be found [here][charter].

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
