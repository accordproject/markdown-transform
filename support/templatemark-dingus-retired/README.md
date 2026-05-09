# TemplateMark Dingus Retirement Page

This folder contains the static replacement for the retired legacy
TemplateMark dingus formerly served at
`https://templatemark-dingus.netlify.app/`.

Deploy this directory as a static site. The published page intentionally
contains no JavaScript bundles, PDF logic, or third-party scripts.

## Deployment Handoff

The currently authenticated Netlify account used during implementation does
not have access to the existing `templatemark-dingus` site. A Netlify user
who can administer that site should publish this folder to production.

Example CLI flow for the site owner:

```bash
npx netlify login
npx netlify link --id <templatemark-dingus-site-id>
npx netlify deploy --prod --dir support/templatemark-dingus-retired
```

After deployment, confirm:

- the live page no longer references the old `index.js` bundle
- the live page no longer references `https://twemoji.maxcdn.com/twemoji.min.js`
- the archival notice and links render correctly
