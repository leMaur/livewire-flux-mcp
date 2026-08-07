---
name: fluxui-development
description: "Use this skill for Flux UI development in Livewire applications only. Trigger when working with <flux:*> components, building or customizing Livewire component UIs, creating forms, modals, tables, or other interactive elements. Covers: flux: components (buttons, inputs, modals, forms, tables, date-pickers, kanban, badges, tooltips, etc.), layouts, component composition, Tailwind CSS styling, Heroicons/Lucide icon integration, validation patterns, responsive design, and theming. Looks everything up live through the flux-docs MCP server instead of relying on a memorised component list. Do not use for non-Livewire frameworks or non-component styling."
license: MIT
---

# Flux UI Development

Flux UI is a component library for Livewire built with Tailwind CSS. Use Flux components
when one exists. Fall back to standard Blade components only when no Flux component covers
the need.

## Documentation

This project has the **`flux-docs` MCP server** available. It reads
[fluxui.dev](https://fluxui.dev) on demand, so it always reflects the components that exist
today and knows which ones are Pro-gated.

**Look Flux things up with `flux-docs` first.** Do not answer from memory, and do not treat
any component list written into a guideline or skill (including this one) as authoritative.

| Question | Tool | Notes |
| --- | --- | --- |
| Which components exist? Is X free or Pro? | `list_flux_components` | `tier: 'free' \| 'pro' \| 'all'`, annotates each result `[Free]` / `[Pro]` |
| What props/slots/variants does X take? | `fetch_flux_docs` | `component: 'button'` — returns the page plus its reference section |
| Which layouts exist? | `list_flux_layouts` | v2 only |
| How is layout X structured? | `fetch_flux_docs` | `layout: 'header'` |
| What icons can I use, and what is the exact name? | `list_flux_component_icons` | `variant` and `search` filters |

If `flux-docs` is unavailable, say so and stop — do not guess component or prop names.
Boost's `search-docs` tool is a reasonable secondary source for prose and Livewire-side
questions, but `flux-docs` is the authority on what a Flux component actually accepts.

## Workflow

1. **Discover** — `list_flux_components` to confirm the component exists and get its slug.
2. **Check the tier** — if it comes back `[Pro]`, confirm the project has Flux Pro before
   building on it. `fetch_flux_docs` also prepends a `[NOTICE] This is a Flux Pro
   component` line for Pro pages.
3. **Fetch the API** — `fetch_flux_docs` for the component or layout. Read the reference
   section; that is where props, slots and variants live.
4. **Resolve icons** — `list_flux_component_icons` with a `search` term. Never invent an
   icon name.
5. **Build** the Blade markup.
6. **Verify** — component renders, interactive states work, layout holds on mobile.

## Editions and the Pro tier

A subset of Flux v2 components requires a paid Flux Pro licence. Rather than memorising
which, call `list_flux_components`:

- `tier: 'free'` — only components available without a licence.
- `tier: 'pro'` — only the paid ones.
- `tier: 'all'` (default) — everything, each annotated `[Free]` or `[Pro]`.

Reaching for a Pro component in a free-edition project is the most common Flux failure.
Check the tier before you build, not after the page breaks.

## Versions

`fetch_flux_docs`, `list_flux_components` and `list_flux_layouts` all accept
`version: 'v1' | 'v2'`, defaulting to `'v2'`.

- **v2** (default) — `fluxui.dev`. Components, layouts and the Pro tier.
- **v1** — `v1.fluxui.dev`. Components only: v1 has no layouts route and no Pro tier, so
  `list_flux_layouts` returns a notice and `tier` is ignored.

Icons are version-independent.

## Layouts

Flux v2 ships page-level layouts (header, sidebar, and so on) alongside components. Use
`list_flux_layouts` to see them and `fetch_flux_docs` with `layout: '<name>'` for the
markup. Reach for a layout before hand-rolling page chrome.

## Icons

Flux uses [Heroicons](https://heroicons.com) as its default icon set. Get exact names from
`list_flux_component_icons` — it returns the real names for each variant along with the
correct syntax:

```blade
<flux:icon.arrow-down-tray />
<flux:icon.arrow-down-tray variant="solid" />
<flux:icon.arrow-down-tray variant="mini" />
<flux:icon.arrow-down-tray variant="micro" />
```

Components that accept an `icon` prop take the bare name:

```blade
<flux:button icon="arrow-down-tray">Export</flux:button>
```

For icons Heroicons does not have, use [Lucide](https://lucide.dev) and import them:

```bash
php artisan flux:icon crown grip-vertical github
```

## Common patterns

Confirm the current API with `fetch_flux_docs` before relying on these shapes.

```blade
<flux:button variant="primary">Click me</flux:button>
```

```blade
<flux:field>
    <flux:label>Email</flux:label>
    <flux:input type="email" wire:model="email" />
    <flux:error name="email" />
</flux:field>
```

```blade
<flux:modal wire:model="showModal">
    <flux:heading>Title</flux:heading>
    <p>Content</p>
</flux:modal>
```

```blade
<flux:table>
    <flux:table.columns>
        <flux:table.cell>Column Name</flux:table.cell>
    </flux:table.columns>
    <flux:table.row>
        <flux:table.cell>Value</flux:table.cell>
    </flux:table.row>
</flux:table>
```

## Common pitfalls

- Trusting a hardcoded component list. Lists in guidelines go stale as Flux ships new
  components — `list_flux_components` does not.
- Using a Pro component in a free-edition project. Check the tier first.
- Inventing `<flux:*>` names, props or variants. If `fetch_flux_docs` does not show it, it
  does not exist.
- Guessing icon names instead of calling `list_flux_component_icons`.
- Hand-rolling markup for something Flux already provides — check `list_flux_components`
  and `list_flux_layouts` before writing custom HTML.
- Ignoring the project's existing Flux conventions.

## Attribution

Portions of this skill are adapted from the `fluxui-development` skill in
[laravel/boost](https://github.com/laravel/boost), MIT © Taylor Otwell. It is installed by
[livewire-flux-mcp](https://github.com/leMaur/livewire-flux-mcp) and deliberately replaces
the bundled version so that Flux lookups go through the live documentation server.

<!-- livewire-flux-mcp:managed -->

