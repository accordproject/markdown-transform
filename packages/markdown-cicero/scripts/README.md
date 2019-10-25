# Build-time external models scripts

Those scripts are used to download CTO models from Web resources during the build process

## How to use

You should only have to change: ./scripts/models.json which is a JSON array of external models.

Each entry in that array should look as follows:
```
{ "name": "commonMarkModel",
  "namespace" : "org.accordproject.commonmark",
  "from": "https://models.accordproject.org/markdown/commonmark.cto" },
```
where `name` is the name of the `.js` file (and variables inside it) being created, `namespace` is the namespace for that model, and `from` it the URL where the model can be obtained from.

Running `node getExternalModels.js` should populate the models in the `./src/externalModels` directory.

## How to cleanup

Running `./scripts/cleanExternalModels.sh` should remove all the generated files used during the process.

