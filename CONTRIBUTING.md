# Contributing

## Repo layout

- `registry/`: the source of truth. `registry.json` lists the components, `ui/*.ts` holds them, `theme/fizzy.css` holds the tokens.
- `cli/`: the `fizzy-ui` CLI (no dependencies). `npm publish` from `cli/` bundles `registry/`, the README and the license.
- `src/`: the docs site; its demos import straight from `registry/`.

The conventions every component follows are in [CLAUDE.md](CLAUDE.md); the roadmap is in [PLAN.md](PLAN.md).

## Develop

```sh
npm start          # docs site at http://localhost:4200
npm test           # behavior and accessibility tests (vitest, jsdom)
npm run test:cli   # CLI tests
npx ng build
node cli/index.mjs add tabs --registry ./registry   # try the CLI inside another project
```

Run `npm test` after every change (and `npm run test:cli` when `cli/` or `registry/registry.json` changes).

## Add a component

1. Write `registry/ui/<name>.ts`. Compose the Angular Aria directive with `hostDirectives` and put Tailwind classes on `host`. Import only from `@angular/*`, since the file gets copied as-is.
2. Register it in `registry/registry.json` with its `files` and `dependencies`.
3. Add a demo in `src/app/demos/<name>.ts` and its entry in `src/app/docs.ts` (the a11y spec fails until you do), and a test in `registry/ui/<name>.spec.ts`.

## Release

The version follows Angular's major (`22.x.y` for Angular 22): minor for new components and features, patch for fixes. Bump `cli/package.json`, then `npm publish` from `cli/`.
