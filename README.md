# fizzy-ui

shadcn-style components for Angular, built on [`@angular/aria`](https://angular.dev/guide/aria/overview).
Angular Aria provides behavior and accessibility (keyboard, focus, ARIA). fizzy-ui adds the styling (Tailwind v4 + CSS variables).
You copy the source into your project and the code is yours.

## Use in an Angular app

```sh
npx fizzy-ui init                 # src/fizzy.css theme, Tailwind setup, imports in styles.css
npx fizzy-ui add tabs accordion   # copies to src/app/ui/, installs @angular/aria
npx fizzy-ui list
```

Options: `--path <dir>` (default `src/app/ui`), `--overwrite`, `--registry <dir|url>`, `--skip-install`.

```ts
import { FZ_TABS } from './ui/tabs';
@Component({ imports: [FZ_TABS], template: `
  <div fzTabs>
    <ul fzTabList [(selectedTab)]="tab">
      <li fzTab value="a">A</li><li fzTab value="b">B</li>
    </ul>
    <div fzTabPanel value="a"><ng-template ngTabContent>Panel A</ng-template></div>
    <div fzTabPanel value="b"><ng-template ngTabContent>Panel B</ng-template></div>
  </div>` })
```

Dark mode: add the `dark` class to `<html>`. Theme: edit the variables in `src/fizzy.css`.

## Repo layout

- `registry/`: the source of truth. `registry.json` lists the components, `ui/*.ts` holds them, `theme/fizzy.css` holds the tokens.
- `cli/`: the `fizzy-ui` CLI (no dependencies). `npm publish` from `cli/` bundles `registry/`.
- `src/`: the docs site; its demos import straight from `registry/`.

## Develop

```sh
npm start      # docs site at http://localhost:4200
npm test       # behavior tests
node cli/index.mjs add tabs --registry ./registry   # try the CLI inside another project
```

## Add a component

1. Write `registry/ui/<name>.ts`. Compose the Angular Aria directive with `hostDirectives` and put Tailwind classes on `host`. Import only from `@angular/*`, since the file gets copied as-is.
2. Register it in `registry/registry.json` with its `files` and `dependencies`.
3. Add a demo in `src/app/demos/<name>.ts` and its entry in `src/app/docs.ts` (the a11y spec fails until you do), and a test in `registry/ui/<name>.spec.ts`.
