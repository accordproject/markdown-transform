<h1 align="center">
  <a href="https://github.com/accordproject/markdown-transform">
    Markdown Transform
  <a/>
</h1>

<p align="center">
  <a href="https://travis-ci.org/accordproject/markdown-transform"><img src="https://travis-ci.org/accordproject/markdown-transform.svg?branch=master" alt="Build Status"></a>
  <a href="https://coveralls.io/github/accordproject/markdown-transform?branch=master"><img src="https://coveralls.io/repos/github/accordproject/markdown-transform/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/accordproject/markdown-transform?color=bright-green" alt="GitHub license"></a>
  <a href="https://www.npmjs.com/package/@accordproject/markdown-cli"><img src="https://img.shields.io/npm/dm/@accordproject/markdown-cli" alt="downloads"></a>
  <a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli.svg" alt="npm version"></a>
  <a href="https://accord-project-slack-signup.herokuapp.com/">
    <img src="https://img.shields.io/badge/Accord%20Project-Join%20Slack-blue" alt="Join the Accord Project Slack"/>
  </a>
</p>

## Introduction

A transformation framework for converting markdown content to HTML, Slate (for rich-text editing) and others DOMs.

![Architecture Diagram](http://www.plantuml.com/plantuml/png/bP6zJiCm58NtFCLHzoGxGgWI30nK36MhEbZnJUBMFv5zenGXtXtPDQGYfH9ROf_Syzqlwy32ysXqCOZcA3h2oWX_b6woPQFL2Xy5i1k43xGlFejhAMUCipcuoQVOibUss-E-78Vo0Rl7b8hNU7hTf57MCS6hhcUuTfa0UkOXtDMrSP9qg4JJE2y7xmxKSELyLv-h8qdzZLFrR7H1LYAENvJyvYk0dwFMUIEOIOBfn1W31N1FA829j2ubjSgInDmQ8P3S-9WILYAyMnQd6U2QCDMGTqdOOklPLmejVMbgiwuS-8-kz4dIDJzcOJTuWnPC6JUtBd2tCNETzF8EEB-e067n_BPvWLTDNoRX91KxVx78D4rLAZ-4o7yJCcxn1sD6Z6tvjqV8DLav6lq5)

> Note: you can regenerate this diagram by visiting http://www.plantuml.com/plantuml/uml/ and pasting the contents of `architecture.puml` from this repository.

## Structure of the Code Repository

Top level repository (markdown-transform), with sub packages. Each sub-package is published as an independent npm module using `lerna`:
* [markdown-common](https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-common) : converts markdown strings to/from the CommonMark DOM
* [markdown-cicero](https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-cicero) : converts CommonMark DOM to/from the CiceroMark DOM
* [markdown-slate](https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-slate) : converts CiceroMark DOM to/from the Slate DOM
* [markdown-html](https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-html) : converts CiceroMark DOM to HTML
* [markdown-cli](https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-cli) : command line utilities

###  CommonMark DOM

The CommonMark DOM is a model for the elements of CommonMark, expressed as a [Concerto schema](https://github.com/accordproject/concerto), and serialized as a JSON graph.

The schema is defined here: https://models.accordproject.org/commonmark/markdown.html

###  CiceroMark DOM

The CiceroMark DOM extends the CommonMark DOM, defining nodes for `Clause`, `Variable` and `ComputedVariable`.

The schema is defined here: https://models.accordproject.org/cicero/dom.html

###  Slate DOM

The Slate DOM is defined by the [Slate](https://www.slatejs.org) HTML content-editable WYSIWYG editing framework.

## Installation

### For users

To install the command-line interface:

```
npm install -g @accordproject/concerto-cli
```

### For developers

To install for development, in the project directory, you will need to first install the Node.js dependencies using [lerna](https://lerna.js.org):
```
npm install -g lerna@^3.15.0
lerna bootstrap
```

Then run:

```
npm run test
```

Invokes _lerna_ to run the test suite.

---

<p align="center">
  <a href="https://www.accordproject.org/">
    <img src="assets/APLogo.png" alt="Accord Project Logo" width="400" />
  </a>
</p>

Accord Project is an open source, non-profit, initiative working to transform contract management and contract automation by digitizing contracts. Accord Project operates under the umbrella of the [Linux Foundation][linuxfound]. The technical charter for the Accord Project can be found [here][charter].

## Learn More About Accord Project

### Overview
* [Accord Project][apmain]
* [Accord Project News][apnews]
* [Accord Project Blog][apblog]
* [Accord Project Slack][apslack]
* [Accord Project Technical Documentation][apdoc]
* [Accord Project GitHub][apgit]


### Documentation
* [Getting Started with Accord Project][docwelcome]
* [Concepts and High-level Architecture][dochighlevel]
* [How to use the Cicero Templating System][doccicero]
* [How to Author Accord Project Templates][docstudio]
* [Ergo Language Guide][docergo]

### Ecosystem

#### Core libraries:
<table>
  <tr>
    <th headers="blank">Projects</th>
    <th headers="blank">Package name</th>
    <th headers="blank">Version</th>
    <th headers="blank">Description</th>
  </tr>
  <tr>
    <td headers><a href="https://github.com/accordproject/cicero">Cicero</a></td>
    <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-core">cicero-core</a></td>
    <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-core"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-core.svg" alt="npm version"></a></td>
    <td headers>Templates Core</td>
  </tr>
    <tr>
      <td headers></td>
    <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-cli">cicero-cli</a></td>
      <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-cli.svg" alt="npm version"></a></td>
      <td headers> Cicero CLI </td>
    </tr>
    <tr>
    <td headers></td>
    <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-engine">cicero-engine</a></td>
    <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-engine"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-engine.svg" alt="npm version"></a></td>
    <td headers>Node.js VM based implementation of Accord Protcol Template Specification execution</td>
    </tr>
    <tr>
    <td headers></td>
    <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-server">cicero-server</a></td>
    <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-server"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-server.svg" alt="npm version"></a></td>
    <td headers>Wraps the Cicero Engine and exposes it as a RESTful service<td>
    </tr>
    <tr>
    <td headers></td>
    <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-test">cicero-test</a></td>
    <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-test"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-test.svg" alt="npm version"></a></td>
    <td headers> Testing support for Cicero based on cucumber</td>
    </tr>
     <tr>
     <td headers></td>
     <td headers> <a href="https://github.com/accordproject/cicero/tree/master/packages/cicero-tools">cicero-tools</a></td>
     <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-tools"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-tools.svg" alt="npm version"></a></td>
     <td headers>Cicero Tools</td>
     </tr>
      <tr>
      <td headers="co1 c1"></td>
      <td headers="co2 c1"> <a href="https://github.com/accordproject/cicero/tree/master/packages/generator-cicero-template">generator-cicero-template</a></td>
      <td headers="co3 c1"> <a href="https://badge.fury.io/js/%40accordproject%2Fgenerator-cicero-template"><img src="https://badge.fury.io/js/%40accordproject%2Fgenerator-cicero-template.svg" alt="npm version"></a></td>
      <td headers="co4 c1">Code generator for a Cicero Template</td>
      </tr>
      <tr>
      <td headers><a href="https://github.com/accordproject/concerto">Concerto</a></td>
      <td headers><a href="https://github.com/accordproject/concerto/tree/master/packages/concerto-core">concerto-core</a></td>
      <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fconcerto-core"><img src="https://badge.fury.io/js/%40accordproject%2Fconcerto-core.svg" alt="npm version"></a></td>
      <td headers> Core Implementation for the Concerto Modeling Language</td>
      </tr>
      <tr>
      <td headers></td>
      <td headers><a href="https://github.com/accordproject/concerto/tree/master/packages/concerto-tools">concerto-tools</a></td>
      <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fconcerto-tools"><img src="https://badge.fury.io/js/%40accordproject%2Fconcerto-tools.svg" alt="npm version"></a></td>
      <td headers> Tools for the Concerto Modeling Language</td>
  </tr>
  <tr>
   <td headers></td>
   <td headers><a href="https://github.com/accordproject/concerto/tree/master/packages/concerto-cli">concerto-cli</a></td>
   <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fconcerto-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fconcerto-cli.svg" alt="npm version"></a></td>
   <td headers>command-line interface for Concerto</td>
  </tr>
  <tr>
    <td headers><a href="https://github.com/accordproject/ergo">Ergo</a></td>
    <td headers><a href="https://github.com/accordproject/ergo/tree/master/packages/ergo-cli">ergo-cli</a></td>
    <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fergo-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fergo-cli.svg" alt="npm version"></a></td>
    <td headers>Ergo CLI</td>
  </tr>
  <tr>
    <th id="blank"></th>
    <td headers><a href="https://github.com/accordproject/ergo/tree/master/packages/ergo-compiler">ergo-compiler</a></td>
    <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fergo-compiler"><img src="https://badge.fury.io/js/%40accordproject%2Fergo-compiler.svg" alt="npm version"></a></td>
    <td headers>Ergo compiler</td>
  </tr>
  <tr>
   <th id="blank"></th>
   <td headers><a href="https://github.com/accordproject/ergo/tree/master/packages/ergo-test">ergo-test</a></td>
   <td headers><a href="https://badge.fury.io/js/%40accordproject%2ergo-test"><img src="https://badge.fury.io/js/%40accordproject%2Fergo-test.svg" alt="npm version"></a></td>
   <td headers>Ergo test</td>
   </tr>
    <tr>
    <th id="blank"></th>
    <td headers><a href="https://github.com/accordproject/ergo/tree/master/packages/ergo-engine">ergo-engine</a></td>
    <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fergo-engine"><img src="https://badge.fury.io/js/%40accordproject%2Fergo-engine.svg" alt="npm version"></a></td>
    <td headers>Ergo engine</td>
    </tr>
    <tr>
     <td headers><a href="https://docs.accordproject.org/docs/next/markup-cicero.html">Markdown</a></td>
     <td headers><a href="https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-common">markdown-common</a></td>
     <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-common"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-common.svg" alt="npm version"></a></td>
     <td headers>A framework for transforming markdown</td>
    </tr>
     <tr>
     <th id="blank"></th>
     <td headers><a href="https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-slate">markdown-slate</a></td>
     <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-slate"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-slate.svg" alt="npm version"></a></td>
     <td headers>Transform markdown to/from CommonMark DOM</td>
     </tr>
     <tr>
     <td headers></td>
     <td headers><a href="https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-cli"> markdown-cli </a></td>
     <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cli.svg" alt="npm version"></a></td>
     <td headers> CLI for markdown transformations.</td>
    </tr>
     <tr>
      <th id="blank"></th>
      <td headers><a href="https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-cicero">markdown-cicero</a></td>
      <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cicero"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-cicero.svg" alt="npm version"></a></td>
      <td headers>Markdown extensions for contracts, clauses, variables etc.</td>
      </tr>
       <tr>
      <th id="blank"></th>
       <td headers><a href="https://github.com/accordproject/markdown-transform/tree/master/packages/markdown-html">markdown-html</a></td>
       <td headers><a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-html"><img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-html.svg" alt="npm version"></a></td>
       <td headers>Transform CiceroDOM to HTML</td>
       </tr>
 
</table>

#### UI Components:

<table>
  <tr>
    <th  headers="blank">Projects</th>
    <th  headers="blank">Package name</th>
    <th  headers="blank">Version</th>
    <th  headers="blank">Description</th>
  </tr>
    <tr>
      <td headers>Markdown Editor</td>
      <td headers><a href="https://github.com/accordproject/markdown-editor">markdown-editor</a></td>
      <td headers> <a href="https://badge.fury.io/js/%40accordproject%2Fmarkdown-editor">
      <img src="https://badge.fury.io/js/%40accordproject%2Fmarkdown-editor.svg" alt="npm version"></a></td>
      <td headers>WYSIWYG rich text web editor for markdown based on Slate.js</td>
    </tr>
     <tr>
     <td headers="co1 c1">Cicero UI</td>
      <td headers="co2 c1"><a href="https://github.com/accordproject/cicero-ui">cicero-ui</a></td>
      <td headers="co3 c1"> <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-ui"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-ui.svg" alt="npm version"></a></td>
       <td headers="co4 c1">React UI components for Cicero</td>
     </tr>
     <tr>
     <td headers="co1 c1">Concerto UI</td>
      <td headers="co2 c1"><a href="https://github.com/accordproject/concerto-ui">concerto-ui</a></td>
      <td headers="co3 c1"> <a href="https://badge.fury.io/js/%40accordproject%2Fconcerto-ui-react"><img src="https://badge.fury.io/js/%40accordproject%2Fconcerto-ui-react.svg" alt="npm version"></a></td>
       <td headers="co4 c1">Dynamic web forms generated from Concerto models</td>
     </tr>
</table>

#### Template Editors:

<table>
  <tr>
    <th headers="blank">Projects</th>
    <th headers="blank">Cicero ver.</th>
    <th headers="blank">Description</th>
  </tr>
  <tr>
    <td headers><a href="https://github.com/accordproject/template-studio">Template Studio v1</a></td>
    <td headers> <b>0.13.4</b></td>
    <td headers>Web UI for creating, editing and testing Accord Project templates</td>
  </tr>
  <tr>
    <td headers><a href="https://github.com/accordproject/template-studio-v2">Template Studio v2</a></td>
    <td headers> <b>0.13.4</b></td>
    <td headers>Web UI for creating, editing and testing Accord Project templates</td>
  </tr>
   <tr>
    <td headers><a href="https://github.com/accordproject/cicero-vscode-extension">VSCode Extension</a></td>
    <td headers><b>0.13.4</b></td>
    <td headers>VS Code extension for editing Cicero templates and Ergo logic</td>
   </tr>
</table>


#### Public templates and models:

<table>
  <tr>
    <th headers="blank">Projects</th>
    <th headers="blank">Description</th>
  </tr>
  <tr>
    <td headers><a href="https://github.com/accordproject/models">Models</a></td>
    <td headers>Accord Project Model Library </td>
  </tr>
   <tr>
     <td headers><a href="https://github.com/accordproject/cicero-template-library">Template Library</a></td>
     <td headers>Accord Project Template Library </td>
   </tr>
 
</table>


#### Documentation:

<table>
  <tr>
    <th headers="blank">Project</th>
    <th headers="blank">Repo</th>
  </tr>
  <tr>
    <td headers><a href="https://docs.accordproject.org/">Documentation</a></td>
    <td headers><a href="https://github.com/accordproject/techdocs">techdocs</a></td>
  </tr>
 </table>

## Contributing

The Accord Project technology is being developed as open source. All the software packages are being actively maintained on GitHub and we encourage organizations and individuals to contribute requirements, documentation, issues, new templates, and code.

Find out what’s coming on our [blog][apblog].

Join the Accord Project Technology Working Group [Slack channel][apslack] to get involved!

For code contributions, read our [CONTRIBUTING guide][contributing] and information for [DEVELOPERS][developers].

## License <a name="license"></a>

Accord Project source code files are made available under the [Apache License, Version 2.0][apache].
Accord Project documentation files are made available under the [Creative Commons Attribution 4.0 International License][creativecommons] (CC-BY-4.0).

Copyright 2018-2019 Clause, Inc. All trademarks are the property of their respective owners. See [LF Projects Trademark Policy](https://lfprojects.org/policies/trademark-policy/).

[linuxfound]: https://www.linuxfoundation.org
[charter]: https://github.com/accordproject/markdown-transform/blob/master/CHARTER.md
[apmain]: https://accordproject.org/ 
[apworkgroup]: https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io
[apblog]: https://medium.com/@accordhq
[apnews]: https://www.accordproject.org/news/
[apgit]:  https://github.com/accordproject/
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
