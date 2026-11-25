# Command

> A searchable list of commands, the core of a ⌘K palette.

`npx fizzy-ui add command` copies `command.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_COMMAND } from './ui/command';

@Component({
  imports: [FZ_COMMAND],
  template: `
    <div class="grid w-full max-w-md gap-2">
      <fz-command class="shadow-md" (itemSelected)="ran.set($any($event))">
        <fz-command-group heading="Suggestions">
          <fz-command-item value="calendar" label="Calendar" [keywords]="['events', 'schedule']" />
          <fz-command-item value="emoji" label="Search emoji" />
          <fz-command-item value="calculator" label="Calculator" disabled />
        </fz-command-group>
        <fz-command-group heading="Settings">
          <fz-command-item value="profile" label="Profile" shortcut="⌘P" />
          <fz-command-item value="billing" label="Billing" shortcut="⌘B" />
          <fz-command-item value="settings" label="Settings" shortcut="⌘S" [keywords]="['preferences']" />
        </fz-command-group>
      </fz-command>
      <p class="text-sm text-muted-foreground">Last command: {{ ran() ?? 'none' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly ran = signal<string | undefined>(undefined);
}
```

## Keyboard

| Key | Action |
|---|---|
| Type | Filter by label and keywords; the first match is highlighted |
| ↓ / ↑ | Move through the results |
| Home / End | First or last result |
| Enter | Run the highlighted command |

## Accessibility

- The field is a combobox whose listbox is always shown; focus stays in the field and aria-activedescendant points at the highlighted command.
- Groups are role="group", named by their heading. "No results" is announced.
- Inside a dialog, give the dialog a title (fzDialogTitle): it names the palette.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/command.ts (the file `add` copies; its doc comments describe the inputs)
