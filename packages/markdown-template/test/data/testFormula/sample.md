This is contract text, followed by a clause:
{{#clause agreement}}
This is a contract between "Steve" and "Betty" for the amount of 3131.0 EUR, even in the presence of force majeure.
{{/clause}}
There is a penalty of 10.99% for non compliance.
And this: {{% calculate( 3.14+2.98 )(penalty,agreement) @ 2000-07-22T06:45:05Z %}} is a formula
- And this is another formula in a list {{% calculate( firstName ++ " " ++ lastName )(penalty,agreement) @ 2000-07-22T06:45:05Z %}}
