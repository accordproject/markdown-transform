# Title

Paragraph with a {{seller}} and more text and{{#if forceMajeure}}, this is optional,{{/if}} with some **marker** {{% 1+1 = 3 %}}.

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
