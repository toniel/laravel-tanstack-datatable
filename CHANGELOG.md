# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/toniel/laravel-tanstack-datatable/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/toniel/laravel-tanstack-datatable/releases/tag/v0.1.0
