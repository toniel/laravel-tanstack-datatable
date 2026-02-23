# Laravel TanStack DataTable

[![npm version](https://img.shields.io/npm/v/@toniel/laravel-tanstack-datatable)](https://www.npmjs.com/package/@toniel/laravel-tanstack-datatable)
[![npm downloads](https://img.shields.io/npm/dm/@toniel/laravel-tanstack-datatable)](https://www.npmjs.com/package/@toniel/laravel-tanstack-datatable)
[![GitHub](https://img.shields.io/github/license/toniel/laravel-tanstack-datatable)](https://github.com/toniel/laravel-tanstack-datatable/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/toniel/laravel-tanstack-datatable)](https://github.com/toniel/laravel-tanstack-datatable)

Vue 3 DataTable components for Laravel pagination with TanStack Query and TanStack Table.

> **Companion Package**: This package works together with [`@toniel/laravel-tanstack-pagination`](https://github.com/toniel/laravel-tanstack-pagination) - the core composables library.

## Installation

```bash
npm install @toniel/laravel-tanstack-datatable @toniel/laravel-tanstack-pagination
# or
yarn add @toniel/laravel-tanstack-datatable @toniel/laravel-tanstack-pagination
# or
pnpm add @toniel/laravel-tanstack-datatable @toniel/laravel-tanstack-pagination
# or
bun add @toniel/laravel-tanstack-datatable @toniel/laravel-tanstack-pagination
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install vue @tanstack/vue-query @tanstack/vue-table
```

## Quick Start

### Basic Usage

```vue
<script setup lang="ts">
import { usePagination } from '@toniel/laravel-tanstack-pagination'
import { DataTable } from '@toniel/laravel-tanstack-datatable'
import { createColumnHelper } from '@tanstack/vue-table'
import axios from 'axios'

// Define your data type
interface User {
  id: number
  name: string
  email: string
}

// Create columns
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
  }),
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
  }),
]

// Use pagination composable
const {
  tableData,
  pagination,
  search,
  currentPerPage,
  sortBy,
  sortDirection,
  isLoading,
  error,
  handlePageChange,
  handlePerPageChange,
  handleSearchChange,
  handleSortChange,
  refetch,
} = usePagination(
  (filters) => axios.get('/api/users', { params: filters }),
  { queryKey: 'users', defaultPerPage: 10 }
)
</script>

<template>
  <DataTable
    :data="tableData"
    :columns="columns"
    :pagination="pagination"
    :is-loading="isLoading"
    :error="error"
    :search="search"
    :current-per-page="currentPerPage"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    title="Users"
    item-name="users"
    @page-change="handlePageChange"
    @per-page-change="handlePerPageChange"
    @search-change="handleSearchChange"
    @sort-change="handleSortChange"
    @retry="refetch"
  />
</template>
```

## Features

### Core Features
- **Search** with debounce
- **Pagination** with Laravel meta
- **Sorting** (client & server-side)
- **Row selection** with bulk actions
- **Dark mode** support
- **Loading states** & error handling
- **Fully customizable** via slots

### Component Props

#### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | `[]` | Table data array |
| `columns` | `ColumnDef[]` | required | TanStack Table column definitions |
| `pagination` | `LaravelPaginationResponse` | `null` | Laravel pagination response |
| `isLoading` | `boolean` | `false` | Loading state |
| `error` | `Error` | `null` | Error object |
| `search` | `string` | `''` | Search query |
| `currentPerPage` | `number` | `10` | Current items per page |
| `perPageOptions` | `number[]` | `[10,15,25,50,100]` | Per page options |
| `sortBy` | `string` | `null` | Current sort column |
| `sortDirection` | `'asc'\|'desc'` | `'asc'` | Sort direction |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `rowSelection` | `RowSelectionState` | `{}` | Selected rows state |
| `getRowId` | `Function` | `(row) => row.id` | Get unique row ID |
| `showSelectionInfo` | `boolean` | `true` | Show selection info bar when rows are selected |
| `showSearch` | `boolean` | `true` | Show search input |
| `showCaption` | `boolean` | `true` | Show table caption |
| `showPerPageSelector` | `boolean` | `true` | Show per page selector |
| `title` | `string` | `'Items'` | Table title |
| `itemName` | `string` | `'items'` | Item name for pluralization |
| `loadingText` | `string` | `'Loading...'` | Loading text |
| `errorTitle` | `string` | `'Error loading data'` | Error title |
| `emptyStateText` | `string` | `'No items found'` | Empty state text |

#### DataTable Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pageChange` | `number` | Emitted when page changes |
| `perPageChange` | `number` | Emitted when per page changes |
| `searchChange` | `string` | Emitted when search input changes |
| `sortChange` | `string` | Emitted when sort column changes |
| `retry` | - | Emitted when retry button clicked |
| `update:rowSelection` | `RowSelectionState` | Emitted when row selection changes |

### Slots

#### `filters` Slot
Add custom filters next to search input:

```vue
<DataTable ...>
  <template #filters>
    <select v-model="status" class="...">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </template>
</DataTable>
```

#### `header` Slot
Add action buttons (e.g., Create button):

```vue
<DataTable ...>
  <template #header>
    <button @click="openCreateModal" class="...">
      Add User
    </button>
  </template>
</DataTable>
```

#### `bulk-actions` Slot
Add bulk action buttons when rows are selected:

```vue
<DataTable
  :enable-row-selection="true"
  v-model:row-selection="selectedRows"
  ...
>
  <template #bulk-actions="{ selectedIds, selectedData, clearSelection }">
    <button @click="bulkDelete(selectedIds)" class="...">
      Delete Selected
    </button>
    <button @click="clearSelection" class="...">
      Clear
    </button>
  </template>
</DataTable>
```

#### `selection-info` Slot
Fully customize the selection info bar (replaces the default blue bar):

```vue
<DataTable
  :enable-row-selection="true"
  v-model:row-selection="selectedRows"
  ...
>
  <template #selection-info="{ selectedIds, selectedData, selectedCount, clearSelection }">
    <div class="your-custom-class">
      {{ selectedCount }} items selected
      <button @click="handleBulkAction(selectedIds)">Action</button>
      <button @click="clearSelection">Clear</button>
    </div>
  </template>
</DataTable>
```

Slot props available:
- `selectedIds` - Array of selected row IDs
- `selectedData` - Array of selected row data objects
- `selectedCount` - Number of selected rows
- `clearSelection` - Function to clear all selections
- `selectAllCurrentPage` - Function to select all rows on current page
- `deselectAllCurrentPage` - Function to deselect all rows on current page

## Advanced Examples

### With Row Selection

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { RowSelectionState } from '@tanstack/vue-table'

const selectedRows = ref<RowSelectionState>({})

const bulkDelete = async (ids: string[]) => {
  await axios.delete('/api/users/bulk', { data: { ids } })
  selectedRows.value = {}
}
</script>

<template>
  <DataTable
    :enable-row-selection="true"
    v-model:row-selection="selectedRows"
    ...
  >
    <template #bulk-actions="{ selectedIds, clearSelection }">
      <button @click="bulkDelete(selectedIds)">Delete</button>
      <button @click="clearSelection">Clear</button>
    </template>
  </DataTable>
</template>
```

### With Custom Columns (Actions)

```vue
<script setup lang="ts">
const columns = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h('button', { onClick: () => edit(row.original) }, 'Edit'),
      h('button', { onClick: () => remove(row.original) }, 'Delete'),
    ]),
  }),
]
</script>
```

### With Checkbox Column

```vue
<script setup lang="ts">
import { Checkbox } from 'your-ui-library' // or native input

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      checked: table.getIsAllPageRowsSelected(),
      onUpdate: (val) => table.toggleAllPageRowsSelected(!!val),
    }),
    cell: ({ row }) => h(Checkbox, {
      checked: row.getIsSelected(),
      onUpdate: (val) => row.toggleSelected(!!val),
    }),
  }),
  // ... other columns
]
</script>
```

### Using `useRowSelection` Composable

For more control over row selection, use the `useRowSelection` composable:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRowSelection } from '@toniel/laravel-tanstack-datatable'
import { createColumnHelper } from '@tanstack/vue-table'

interface User {
  id: number
  name: string
  email: string
}

const tableData = ref<User[]>([])

const {
  rowSelection,
  selectedRowIds,
  selectedRowData,
  isAllCurrentPageSelected,
  clearSelection,
  toggleAllCurrentPage,
  toggleRowSelection,
  getSelectionColumn,
} = useRowSelection<User>({
  data: tableData,
  getRowId: (row) => String(row.id),
})

const columnHelper = createColumnHelper<User>()

const columns = [
  getSelectionColumn({ size: 50 }), // Automatic checkbox column
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
]

const handleBulkDelete = async () => {
  await axios.delete('/api/users/bulk', { data: { ids: selectedRowIds.value } })
  clearSelection()
  // refetch data...
}
</script>

<template>
  <DataTable
    :data="tableData"
    :columns="columns"
    :enable-row-selection="true"
    v-model:row-selection="rowSelection"
    :show-selection-info="false"
  >
    <template #selection-info="{ selectedIds, selectedCount, clearSelection }">
      <div class="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
        <span>{{ selectedCount }} users selected</span>
        <button @click="handleBulkDelete" class="btn-danger">Delete</button>
        <button @click="clearSelection">Clear</button>
      </div>
    </template>
  </DataTable>
</template>
```

#### `useRowSelection` API

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `rowSelection` | `Ref<RowSelectionState>` | Reactive selection state |
| `selectedRowIds` | `Ref<string[]>` | Array of selected row IDs |
| `selectedRowData` | `Ref<T[]>` | Array of selected row data |
| `isAllCurrentPageSelected` | `Ref<boolean>` | Whether all current page rows are selected |
| `isSomeCurrentPageSelected` | `Ref<boolean>` | Whether some (but not all) rows are selected |
| `clearSelection` | `() => void` | Clear all selections |
| `toggleAllCurrentPage` | `() => void` | Toggle select all on current page |
| `toggleRowSelection` | `(id: string) => void` | Toggle single row selection |
| `selectRows` | `(ids: string[]) => void` | Select multiple rows by IDs |
| `deselectRows` | `(ids: string[]) => void` | Deselect multiple rows by IDs |
| `getSelectionColumn` | `(options?) => ColumnDef<T>` | Get a checkbox column definition |

#### `getSelectionColumn` Options

```ts
getSelectionColumn({
  headerClass: 'flex items-center justify-center',
  cellClass: 'flex items-center justify-center',
  checkboxClass: 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded',
  size: 50,
})
```

## Styling

This package uses Tailwind CSS utility classes. Make sure Tailwind is configured in your project.

### Dark Mode

Dark mode is automatically supported via Tailwind's `dark:` classes. Configure dark mode in your `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}
```

### Custom Styling

You can override styles using Tailwind classes or custom CSS:

```css
/* Custom table styles */
.data-table {
  /* Your custom styles */
}
```

## Theming

The components use Tailwind CSS and support dark mode out of the box. You can customize colors by:

1. **Using Tailwind Config:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Customize colors here
      }
    }
  }
}
```

2. **CSS Variables:**
```css
:root {
  --color-primary: ...;
  --color-border: ...;
}
```

## Related Packages

- [`@toniel/laravel-tanstack-pagination`](https://github.com/toniel/laravel-tanstack-pagination) - Core composables (required)
- [`@tanstack/vue-query`](https://tanstack.com/query/latest/docs/vue/overview) - Data fetching & caching
- [`@tanstack/vue-table`](https://tanstack.com/table/latest/docs/framework/vue/vue-table) - Table state management

## Show Your Support

If this package helped you, please consider:
- Starring the [GitHub repository](https://github.com/toniel/laravel-tanstack-datatable)
- [Reporting bugs](https://github.com/toniel/laravel-tanstack-datatable/issues)
- [Suggesting new features](https://github.com/toniel/laravel-tanstack-datatable/issues)
- [Contributing code](https://github.com/toniel/laravel-tanstack-datatable/pulls)

## 📄 License

[MIT](https://github.com/toniel/laravel-tanstack-datatable/blob/main/LICENSE) © [Toniel](https://github.com/toniel)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 🐛 Known Issues

Check the [GitHub Issues](https://github.com/toniel/laravel-tanstack-datatable/issues) page for known issues and feature requests.

## 📮 Contact

- GitHub: [@toniel](https://github.com/toniel)
- NPM: [@toniel](https://www.npmjs.com/~toniel)

## 🙏 Acknowledgments

Built with these amazing libraries:
- [Vue 3](https://vuejs.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/toniel">Toniel</a>
</div>

