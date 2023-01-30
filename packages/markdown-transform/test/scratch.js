'use strict';

const { ModelManager } = require('@accordproject/concerto-core');
const { HtmlTransformer } = require('@accordproject/markdown-html');
const { TemplateMarkTransformer } = require('@accordproject/markdown-template');

const templateMarkTransformer = new TemplateMarkTransformer();

const template = `
Hello {{firstName}}{{#if condition="lastName.startsWith('S')"}}Mister{{else}}Dude{{/if}}!

Thank you for visiting us {{% return now.diff(lastVisit,'day') %}} days ago.
`;

const model = `namespace test@1.0.0

@template
concept TemplateData {
    o String firstName
    o String lastName optional
    o DateTime lastVisit
}
`;

const modelManager = new ModelManager();
modelManager.addCTOModel(model);
const options = {};
const templateJson = templateMarkTransformer.fromMarkdownTemplate( {content: template}, modelManager, 'clause', options);
console.log('==== TEMPLATE MARK ====');
console.log(JSON.stringify(templateJson, null, 2));

const data = {
    firstName: 'Dan',
    lastName: 'Jones',
    lastVisit: new Date('2023-01-10')
};

const ciceroMarkJson = templateMarkTransformer.instantiateCiceroMark(data, templateJson, modelManager, 'clause', null);
console.log('==== CICEROMARK MARK ====');
console.log(JSON.stringify(ciceroMarkJson, null, 2));

const htmlTransformer = new HtmlTransformer();
const html = htmlTransformer.toHtml(ciceroMarkJson);

console.log('==== HTML ====');
console.log(html);


