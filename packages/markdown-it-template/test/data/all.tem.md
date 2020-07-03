# Title

Paragraph with a {{seller}} and more text and{{#if forceMajeure}}, this is optional,{{/if}} with some **marker** {{% 1+1 = 3 %}}. {{#join foo ";"}}{{element}}{{/join}}

{{buyer as "FOO"}}

{{#clause payment}}
BLABLABLABLA


{{#ulist items}}
one item: **{{item}}**
{{/ulist}}

{{#olist items}}
one item: **{{item}}**
{{/olist}}

- one
- two
- three

{{/clause}}

There is also a new {{#optional name}} inline which can contain {{variables}}{{/optional}}.