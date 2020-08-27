This is contract text, followed by a clause:

{{#clause agreement}}
This is a contract between {{seller}} and {{buyer}} for the amount of {{amount}} {{currency}}{{#if forceMajeure}}, even in the presence of force majeure{{/if}}.
{{/clause}}

There is a penalty of {{penalty}}% for non compliance.

{{#olist items}}
Prices for {{name}}
{{#olist prices}}
Region: {{region}} ({{price}})
{{/olist}}
{{/olist}}

Please contact your local reseller for details.