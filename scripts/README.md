To migrate all JSON test files to versions of Concerto metamodel, CiceroMark etc. used by markdown-common:

```
cd packages/
find . -type f -name '*.json' -exec node ../scripts/migrate.js {} \;
```

You will also have to update the Jest snapshots.