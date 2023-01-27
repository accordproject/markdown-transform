'use strict';

const { ModelManager } = require('@accordproject/concerto-core');
const fs = require('fs');
const TemplateMarkTransformer = require('./TemplateMarkTransformer');

const templateMarkTransformer = new TemplateMarkTransformer();

const template = fs.readFileSync('/Users/dan.selman/dev/apap/templatemark/formula.md', 'utf8');
const model = fs.readFileSync('/Users/dan.selman/dev/apap/templatemark/model.cto', 'utf8');

const modelManager = new ModelManager();
modelManager.addCTOModel(model);
const options = {};
const templateJson = templateMarkTransformer.fromMarkdownTemplate( {content: template}, modelManager, 'clause', options);
console.log(JSON.stringify(templateJson, null, 2));

const data = {
    firstName: 'Dan',
    lastName: 'Selman',
    lastVisit: new Date('2023-01-10')
};

const ciceroMarkJson = templateMarkTransformer.instantiateCiceroMark(data, templateJson, modelManager, 'clause', null);
console.log(JSON.stringify(ciceroMarkJson, null, 2));