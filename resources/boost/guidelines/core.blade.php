## Flux UI Documentation Source

This project has the `flux-docs` MCP server available (`livewire-flux-mcp`). It reads
fluxui.dev on demand, so it reflects the components that exist today and knows which ones
require a paid Flux Pro licence.

- Resolve every Flux question through `flux-docs` before writing markup: `list_flux_components`
  (what exists, and free vs Pro), `fetch_flux_docs` (props, slots, variants, layouts),
  `list_flux_layouts`, `list_flux_component_icons` (exact icon names).
- No component list written into a guideline or skill is authoritative — including any list
  above or below this section. Lists go stale as Flux ships; call `list_flux_components`.
- Check the tier before building. Using a Pro-only component in a free-edition project is the
  most common Flux failure.
- Never invent a `flux:` component, prop, variant or icon name. If `flux-docs` is
  unreachable, say so rather than guessing.
- Both Flux major versions are reachable: pass `version: 'v1'` for legacy projects. v1 has no
  layouts and no Pro tier.

Use the `fluxui-development` skill for the full workflow.

@verbatim
<code-snippet name="Confirm a component and its tier before using it" lang="text">
list_flux_components  { "tier": "all" }        → e.g. "Date Picker [Pro] (date-picker)"
fetch_flux_docs       { "component": "date-picker" }
</code-snippet>
@endverbatim
