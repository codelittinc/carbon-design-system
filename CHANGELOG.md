# Changelog

All notable changes to `@codelittinc/carbon-design-system` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry corresponds to a published version. When you bump the version in
`package.json`, add a matching `## [x.y.z]` section here — the publish workflow
uses it as the GitHub Release notes.

## [0.1.0] - 2026-07-23

### Added

- Initial publishable release of the CarbonOS design system to GitHub Packages.
- Library build (tsup) emitting ESM + type declarations, with a full-barrel
  entry (`@codelittinc/carbon-design-system`) and a Button subpath
  (`@codelittinc/carbon-design-system/button`).
- Design tokens shipped as `@codelittinc/carbon-design-system/styles`
  (`theme.css`): carbon/amber palettes, semantic surface/text/border tokens,
  adaptive accent/status foreground tokens, and a light/dark theme.
- Components: Button, Badge, StatusBadge, Input, Textarea, Checkbox, Switch,
  Select, Dialog, AlertDialog, DropdownMenu, Sheet, Separator, Skeleton,
  Progress, Tabs, Tooltip, Popover, ScrollArea, Toast, EmptyState, PageHeader,
  DataTable, MoneyInput, CommandPalette, SearchSelect, AddressAutocomplete.
