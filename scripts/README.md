# Updating Model Files

If you have updated one of the models that the markdown-transform stack depends upon you will need to do the following:

1. Update the `models.json` file under `/scripts/external`
1. Rerun npm run models:get at the root

The new models will now be exported from `@accordproject/markdown-common`, which will break most of the unit tests, because the namespaces (stored in documents) will have changed.

You should then update the RegEx patterns in MigrateDocument.js - with the pattern you want to migrate FROM. The namespaces you will migrate TO are loaded from the models in `markdown-common`.

To migrate all JSON test files to versions of Concerto metamodel, CiceroMark etc. used by markdown-common:

```
cd packages/
find . -type f -name '*.json' -exec node ../scripts/migrate.js {} \;
```

There is also a single HTML file used by test assertions, which contains version number which will have to be updated by hand.

You will also have to update the Jest snapshots when you run the tests:

```
npm test -- -u
```