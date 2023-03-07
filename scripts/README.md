To migrate all JSON files:


```
cd packages/
find . -type f -name '*.json' -exec node ../scripts/migrate.js {} \;
```