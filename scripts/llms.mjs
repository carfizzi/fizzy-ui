// Docs for agents (https://llmstxt.org): public/llms.txt and public/components/<name>.md, from src/app/docs.ts,
// the demos and the registry. Run `npm run llms` after changing them; `npm run test:cli` fails while the files are stale.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}cli/package.json`, 'utf8'));
const SITE = pkg.homepage; // https://carfizzi.github.io/fizzy-ui/
const REPO = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
const RAW = `${REPO.replace('github.com', 'raw.githubusercontent.com')}/main/`;

const cell = (s) => s.replaceAll('|', '\\|');

function component(doc, registry, sized) {
  const item = registry.items[doc.name];
  const demo = readFileSync(`${root}src/app/demos/${doc.name}.ts`, 'utf8').replaceAll('../../../registry/ui/', './ui/');
  const deps = item.dependencies.length ? ` and installs ${item.dependencies.map((d) => `\`${d}\``).join(', ')}` : '';
  const shared = Object.entries(registry.items)
    .filter(([name, other]) => name !== doc.name && other.files.join() === item.files.join())
    .map(([name]) => `\`${name}\``);
  const lines = [
    `# ${doc.title}`,
    '',
    `> ${doc.description}`,
    '',
    `\`npx fizzy-ui add ${doc.name}\` copies \`${doc.file}\` into \`src/app/ui/\`${deps}.` +
      (shared.length ? ` The same file holds ${shared.join(', ')}.` : ''),
  ];
  if (sized) lines.push('', 'Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).');
  lines.push('', '## Usage', '', '```ts', demo.trimEnd(), '```');
  if (doc.keyboard) lines.push('', '## Keyboard', '', '| Key | Action |', '|---|---|', ...doc.keyboard.map(([k, a]) => `| ${cell(k)} | ${cell(a)} |`));
  if (doc.a11y) lines.push('', '## Accessibility', '', ...doc.a11y.map((n) => `- ${n}`));
  lines.push('', '## Source', '', `${RAW}registry/ui/${doc.file} (the file \`add\` copies; its doc comments describe the inputs)`, '');
  return lines.join('\n');
}

function index(docs) {
  return [
    '# fizzy-ui',
    '',
    `> ${pkg.description} Angular ${pkg.version.split('.')[0]}, Tailwind CSS v4, keyboard and ARIA from @angular/aria and the CDK.`,
    '',
    'A CLI copies each component\'s source into the app (`src/app/ui/`); the user owns and edits it. Setup:',
    '`npx fizzy-ui init` once (theme, Tailwind), then `npx fizzy-ui add <name...>`. Each file exports `FZ_<NAME>` for `imports`.',
    '',
    '- Values bind two-way: `[(value)]`, `[(open)]`, `[(selectedTab)]`. Form controls also work with `[formField]`, `[formControl]` and `[(ngModel)]`; put them in `<div fzField>` with `<label fzLabel>` and an `@if`\'d `<p fzFieldError>`.',
    '- Sizes `xs|sm|md|lg`: the `size` input, or `data-size` on a container.',
    '- Colors are theme tokens (`bg-primary`, `text-muted-foreground`) defined in `src/fizzy.css`; `.dark` on `<html>` for dark mode; `dir="rtl"` for right-to-left.',
    '- A `class` on a component adds to its own classes; to override one, use `!` (`class="w-56!"`).',
    '',
    '## Guides',
    '',
    `- [Introduction](${SITE}introduction): what fizzy-ui is`,
    `- [Installation](${SITE}installation): \`init\`, \`add\`, customizing`,
    `- [Forms](${SITE}forms): Signal Forms, Reactive Forms, ngModel, errors`,
    `- [Theming](${SITE}theming): tokens, dark mode, sizes, motion, right-to-left`,
    '',
    '## Components',
    '',
    ...docs.map((d) => `- [${d.title}](${SITE}components/${d.name}.md): ${d.description}`),
    '',
    '## Optional',
    '',
    `- [Source code](${REPO}): the registry (\`registry/ui/*.ts\`) is what \`add\` copies`,
    '',
  ].join('\n');
}

/** Every generated file: path under public/ → content. */
export async function build() {
  const { DOCS, SIZED } = await import('../src/app/docs.ts');
  const registry = JSON.parse(readFileSync(`${root}registry/registry.json`, 'utf8'));
  const files = new Map([['llms.txt', index(DOCS)]]);
  for (const doc of DOCS) files.set(`components/${doc.name}.md`, component(doc, registry, SIZED.has(doc.name)));
  return files;
}

/** Generated files missing, different, or left over on disk. */
export async function stale() {
  const files = await build();
  const onDisk = readdirSync(`${root}public/components`, { withFileTypes: true }).filter((f) => f.name.endsWith('.md')).map((f) => `components/${f.name}`);
  const read = (p) => { try { return readFileSync(`${root}public/${p}`, 'utf8'); } catch { return undefined; } };
  return [...[...files].filter(([p, c]) => read(p) !== c).map(([p]) => p), ...onDisk.filter((p) => !files.has(p))];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await build();
  rmSync(`${root}public/components`, { recursive: true, force: true });
  mkdirSync(`${root}public/components`, { recursive: true });
  for (const [path, content] of files) writeFileSync(`${root}public/${path}`, content);
  console.log(`wrote public/llms.txt and ${files.size - 1} public/components/*.md`);
}
