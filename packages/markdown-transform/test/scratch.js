/**
 * An example that shows how to dynamically load a text template,
 * specify the types of the variables for the template via a model,
 * and then generate an HTML document using the template from JSON data.
 */
'use strict';

const { ModelManager } = require('@accordproject/concerto-core');
const { HtmlTransformer } = require('@accordproject/markdown-html');
const { TemplateMarkTransformer } = require('@accordproject/markdown-template');

const templateMarkTransformer = new TemplateMarkTransformer();

/**
 * Define the structure of the template. The syntax is called 'Template Mark'
 * and is extended markdown (commonmark) with embedded JS expressions for formulae
 * and conditions. The condition property on the #if is a JS condition
 * (lastName is a string). The contents of the {{% %}} is evaluated as a JS
 * function, with the return value converted to a string and inserted into the
 * result document. The 'now' constant is the current date/time (a dayjs instance),
 * while 'lastVisit' is a date/time formatted as a string.
 */
const template = `
Hello {{firstName}}{{#if condition="lastName.startsWith('S')"}}{{Mister}}{{else}}Dude{{/if}}!

Thank you for visiting us {{% return now.diff(lastVisit,'day'); %}} days ago.

## Address
{{#with address}}- {{street}}- {{city}}{{#optional state}}- {{state}}{{/optional}}- {{country}}{{/with}}
`;

/**
 * Define the data model for the template. The model must have a concept with
 * the @template decorator. The types of properties allow the template to be
 * type-checked.
 */
const model = `namespace test@1.0.0

concept Address {
    o String street
    o String city
    o String state optional
    o String country
}

@template
concept TemplateData {
    o String firstName
    o String lastName optional
    o DateTime lastVisit
    o Address address
}
`;

const modelManager = new ModelManager();
modelManager.addCTOModel(model);
const options = {};

/**
 * Parse the Template Mark markdown file to a JSON file
 */
const templateJson = templateMarkTransformer.fromMarkdownTemplate( {content: template}, modelManager, 'clause', options);
console.log('==== TEMPLATE MARK ====');
console.log(JSON.stringify(templateJson, null, 2));

/**
 * Define the data we will merge with the template to create a document
 */
const data = {
    firstName: 'Dan',
    lastName: 'Jones',
    lastVisit: '2023-01-10'
};

/**
 * Merge the template JSON with JSON data to create an instance of the template.
 * This JSON document is called 'CiceroMark'.
 */
const ciceroMarkJson = templateMarkTransformer.instantiateCiceroMark(data, templateJson, modelManager, 'clause', null);
console.log('==== CICEROMARK MARK ====');
console.log(JSON.stringify(ciceroMarkJson, null, 2));

/**
 * Convert the CiceroMark JSON document to HTML
 */
const htmlTransformer = new HtmlTransformer();
const html = htmlTransformer.toHtml(ciceroMarkJson);

console.log('==== HTML ====');
console.log(html);


