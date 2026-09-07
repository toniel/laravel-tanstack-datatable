# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-09-08

### Changed

- **BREAKING**: The icon peer dependency moved from `lucide-vue-next` to
  `@lucide/vue`. Lucide deprecated `lucide-vue-next` upstream (its final
  release, `1.0.0`, ships an npm deprecation notice naming `@lucide/vue` as the
  replacement), so it no longer receives icons or fixes. Consumers must install
  `@lucide/vue@^1.0.0`; the exported icon names and props are unchanged, so any
  icon imports in your own code need only the specifier swapped. See
  "Migrating from lucide-vue-next" in the README.
- The `tailwind-merge` peer range widened from `^2.0.0` to `^2.0.0 || ^3.0.0`.
  `tailwind-merge` v3 (the Tailwind CSS v4 line) has been current since well
  before `0.2.0`, so the old range forced a downgrade — or an install override —
  on any app already on v3. Only `twMerge` is used, and its signature is the
  same in both majors.

## [0.2.0] - 2026-09-07

### Changed

- **BREAKING**: Upgraded to TanStack Table v9 (`@tanstack/vue-table@^9.0.0`).
  The v8 peer range is no longer supported; stay on `0.1.x` if you need v8.
- **BREAKING**: Column definitions now take the feature set as their first
  generic — `createColumnHelper<DataTableFeatures, User>()` and
  `ColumnDef<DataTableFeatures, User>`. Export `DataTableFeatures` is provided
  for this. See "Migrating to TanStack Table v9" in the README.
- **BREAKING**: `useRowSelection<T>` now constrains `T` to v9's `RowData`
  (`Record<string, any> | Array<any>`). Primitive row types no longer compile.
- **BREAKING**: The `selection-info` and `bulk-actions` slots renamed
  `selectedData` to `currentPageSelectedData`. The old name implied it held
  every selected row; with server-side pagination it can only ever hold rows
  from the loaded page. A `hasOffPageSelection` slot prop is now provided to
  detect the difference. Drive bulk actions from `selectedIds`.
- **BREAKING**: Removed the `./style.css` subpath export. It pointed at a file
  the build never produced, so `import '@toniel/laravel-tanstack-datatable/style.css'`
  always failed. This package ships no stylesheet — see the Tailwind setup
  section in the README.
- `getRowId` is now typed `(row) => string | number`, matching its own default
  of `(row) => row.id`, which returns a number for most Laravel models. Ids
  were already stringified internally.

### Added

- `dataTableFeatures` / `DataTableFeatures` exports — the explicit v9 feature
  set (`rowSelectionFeature`, `rowSortingFeature`, `columnVisibilityFeature`)
  backing `DataTable`.
- `searchPlaceholder` and `searchLabel` props for customising the search input
  and its accessible name.
- `"sideEffects": false`, letting bundlers tree-shake unused exports.
- `./package.json` subpath export, which some tooling reads.

### Fixed

- Repaired the CommonJS entry point, broken in every release up to and
  including `0.1.11`. With `"type": "module"` set, Node parsed `dist/index.js`
  as ESM, so the bundle's `exports.*` assignments went nowhere: `require()`
  returned an empty object and every named export was `undefined`, with no
  error raised. The CJS bundle is now emitted as `dist/index.cjs`.
- `enableRowSelection` and `getRowId` are now reactive. Under v8 they were read
  once at setup, so changing them at runtime silently did nothing.
- The page-change loading overlay covered nothing. `relative` sat on a wrapper
  that collapsed to zero height, so the `inset-0` backdrop had no box to fill;
  it now anchors to the bordered table container.
- Empty-state and footer `colspan` used `columns.length`, which counts
  top-level column defs and so was wrong with grouped headers or hidden
  columns. Both now use the visible flat column count.

### Accessibility

- Sortable headers are real `<button>`s — previously `<div @click>`, so they
  could not be reached by keyboard or activated with Enter/Space.
- `aria-sort` on sortable `<th>`s; sort direction was conveyed by icon alone.
- `aria-current="page"` on the active pagination button; the current page was
  conveyed by colour alone.
- The per-page `<select>` is now bound to a real `<label for>` (previously an
  adjacent `<p>`, which screen readers do not associate).
- Selection checkboxes have accessible names; they were announced as bare
  "checkbox" with no indication of what they selected.
- Loading states are `role="status"` / `aria-live="polite"` and the error state
  is `role="alert"`, so both are announced rather than silently swapped in.
- Decorative icons and the pagination ellipsis are `aria-hidden`.

### Documentation

- Documented the **required** Tailwind `content` glob for the package's `dist`.
  Without it every utility class is purged and the table renders unstyled.
- Documented the shadcn-vue CSS variables the components depend on.
- Documented that `searchChange` fires on every keystroke and is not debounced.
- Removed the `showCaption` prop from the props table; it was never implemented.

### Internal

- `useVueTable` → `useTable`; `getCoreRowModel()` removed (automatic in v9).
- `FlexRender` migrated to the v9 shorthand (`:header` / `:cell`).
- Dropped the duplicated `getSelectedRowIds` / `getSelectedRowData` expose
  getters; the exposed `selectedRowIds` / `currentPageSelectedData` computeds
  already carried the same values.
- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` are gitignored;
  `bun.lock` is the lockfile of record.

### Removed

- Dropped `radix-vue`, `class-variance-authority`, and `@tanstack/vue-query`
  from `peerDependencies`; none were imported by this package.

## [0.1.11] - 2026-05-30

### Fixed

- Memory leak, reactivity bugs, and dark mode consistency.

## [0.1.10] - 2026-05-14

### Added
- `rowClassName` prop for conditional row styling
  - Accepts a static string or a function `(row: any) => string` for per-row class customization
  - Example: `row-class-name="bg-green-50"` or `:row-class-name="(row) => row.status === 'active' ? 'bg-green-50' : 'bg-red-50'"`

## [0.1.9] - 2026-04-08

### Fixed
- Fixed filter state reset when changing pages - filters now persist correctly during pagination
- Added `filters` prop to pass filter state to the component
- Added `filterChange` event for emitting filter changes to parent
- `#filters` slot now receives `filters` prop for accessing current filter state

### Added
- `filters` prop for receiving external filter state
- `filterChange` event for emitting filter state changes
- `#filters` slot now exposes `filters` prop

## [0.1.8] - 2026-02-23

### Added
- `useRowSelection` composable for reusable row selection logic with helpers:
  - `rowSelection`, `selectedRowIds`, `selectedRowData`
  - `clearSelection`, `toggleAllCurrentPage`, `toggleRowSelection`
  - `selectRows`, `deselectRows`, `getSelectionColumn`
- `showSelectionInfo` prop to control selection info bar visibility (optional)
- `selection-info` slot for fully customizable selection UI
- Export `useRowSelection` composable and related types from package

### Changed
- Selection info bar is now optional and can be hidden or replaced with custom UI
- Improved documentation for row selection features

## [0.1.7] - 2026-02-07

### Changed
- Improved per page select component styling

## [0.1.6] - 2026-02-07

### Changed
- Improved datatable pagination and header styles

## [0.1.5] - 2026-02-07

### Changed
- Improved dark mode support and sorting indicators.

## [0.1.4] - 2026-02-07

### Fixed
- Removed search icon from input and updated input type.

## [0.1.3] - 2026-02-07

### Changed
- Improved dark mode support by using `bg-background` and `text-foreground` classes.
- Improved sorting indicators to show a default icon when no sort is active.

### Added
- Added `useDarkMode` composable to toggle dark mode.
- Added `tailwind.config.js` with `darkMode: 'class'` option.

## [0.1.2] - 2026-02-07

### Fixed
- Fixed an issue in the `DataTable` component where the search input icon and placeholder text would overlap.

## [0.1.1] - 2025-01-11

### Changed
- Made `DataTablePagination` component themeable using primary colors.
- Updated README with NPM and GitHub badges
- Added multiple package manager installation options (npm, yarn, pnpm, bun)
- Enhanced documentation with better structure and formatting
- Updated package.json metadata (repository URLs, homepage, bugs)
- Updated keywords in package.json

### Added
- LICENSE file (MIT License)
- Comprehensive CHANGELOG.md
- Community section in README (contributing, support, contact)
- "Show Your Support" section
- Theming section for customization guide
- Acknowledgments section
- Known issues section

### Documentation
- Improved installation instructions
- Added peer dependencies section clearly listed
- Added contact information
- Added related packages section
- Better component props documentation
- Added theming and customization guide

## [0.1.0] - 2025-01-11

### Added
- Initial release of Laravel TanStack DataTable
- `DataTable` component with full-featured table UI
- `DataTablePagination` component for pagination controls
- Search functionality with visual feedback
- Server-side sorting with visual indicators
- Row selection with bulk actions support
- Dark mode support
- Loading states and error handling
- Customizable via slots (filters, header, bulk-actions)
- TypeScript support with full type definitions
- Tailwind CSS styling

### Features
- ✅ Ready-to-use DataTable component
- ✅ Search with debounce
- ✅ Server-side pagination
- ✅ Sorting with visual indicators
- ✅ Row selection & bulk actions
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Customizable via slots
- ✅ TypeScript fully typed
- ✅ Responsive design

### Components
- `DataTable.vue` - Main table component with search, sorting, and selection
- `DataTablePagination.vue` - Pagination controls with page numbers and per-page selector

### Dependencies
- Requires `@toniel/laravel-tanstack-pagination` v0.1.0+
- Built with TanStack Table v8+
- Styled with Tailwind CSS
- Icons from Lucide Vue Next

### Documentation
- Complete README with usage examples
- Component API documentation
- Customization guide
- Slot documentation
- Dark mode setup guide

[Unreleased]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.11...v0.2.0
[0.1.11]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.10...v0.1.11
[0.1.9]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.8...v0.1.9
[0.1.10]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.9...v0.1.10
[0.1.8]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.7...v0.1.8
[0.1.9]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.8...v0.1.9
[0.1.7]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/toniel/laravel-tanstack-datatable/releases/tag/v0.1.0