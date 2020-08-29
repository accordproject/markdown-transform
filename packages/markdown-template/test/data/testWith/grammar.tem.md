This is contract text, followed by a clause:

{{#clause agreement}}
This is a contract between {{seller}} and {{buyer}} for the amount of {{amount}} {{currency}}{{#if forceMajeure}}, even in the presence of force majeure{{/if}}.
{{/clause}}

There is a penalty of {{penalty}}% for non compliance.
{{#with sellerAddress}}Seller is based in {{city}}, {{country}}.{{/with}}
{{#with buyerAddress}}Buyer is based in {{city}}, {{country}}.{{/with}}