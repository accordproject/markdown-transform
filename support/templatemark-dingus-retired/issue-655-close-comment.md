Issue #655 was valid for the stale legacy TemplateMark dingus deployment.

The live site was still serving the historical `v0.16.2` bundle, which pulled
in the browser-unsafe `@accordproject/markdown-pdf` root import chain and also
referenced the obsolete `https://twemoji.maxcdn.com/twemoji.min.js` script.

The supported resolution was to retire the legacy demo rather than restore
packages that were intentionally removed from `markdown-transform`. The live
site now serves a static archival notice instead of the old interactive dingus.
