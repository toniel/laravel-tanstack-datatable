# Laravel TanStack DataTable

Vue 3 DataTable components for Laravel pagination with TanStack Query and TanStack Table.

> 🔗 **Companion Package**: This package works together with [`@toniel/laravel-tanstack-pagination`](https://www.npmjs.com/package/@toniel/laravel-tanstack-pagination) - the core composables library.

## 📦 Installation

```bash
npm install @toniel/laravel-tanstack-datatable @toniel/laravel-tanstack-pagination
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install vue @tanstack/vue-query @tanstack/vue-table
```

## 🚀 Quick Start

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

## 🎯 Features

### ✅ Core Features
- 🔍 **Search** with debounce
- 📄 **Pagination** with Laravel meta
- 🔄 **Sorting** (client & server-side)
- 📊 **Row selection** with bulk actions
- 🎨 **Dark mode** support
- ⚡ **Loading states** & error handling
- 🔧 **Fully customizable** via slots

### 🎨 Component Props

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
| `showSearch` | `boolean` | `true` | Show search input |
| `showCaption` | `boolean` | `true` | Show table caption |
| `showPerPageSelector` | `boolean` | `true` | Show per page selector |
| `title` | `string` | `'Items'` | Table title |
| `itemName` | `string` | `'items'` | Item name for pluralization |
| `loadingText` | `string` | `'Loading...'` | Loading text |
| `errorTitle` | `string` | `'Error loading data'` | Error title |
| `emptyStateText` | `string` | `'📭 No items found'` | Empty state text |

#### DataTable Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pageChange` | `number` | Emitted when page changes |
| `perPageChange` | `number` | Emitted when per page changes |
| `searchChange` | `string` | Emitted when search input changes |
| `sortChange` | `string` | Emitted when sort column changes |
| `retry` | - | Emitted when retry button clicked |
| `update:rowSelection` | `RowSelectionState` | Emitted when row selection changes |

### 🎨 Slots

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
      ➕ Add User
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
      🗑️ Delete Selected
    </button>
    <button @click="clearSelection" class="...">
      Clear
    </button>
  </template>
</DataTable>
```

## 📖 Advanced Examples

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

## 🎨 Styling

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

## 🔗 Related Packages

- [`@toniel/laravel-tanstack-pagination`](https://www.npmjs.com/package/@toniel/laravel-tanstack-pagination) - Core composables (required)
- [`@tanstack/vue-query`](https://tanstack.com/query/latest/docs/vue/overview) - Data fetching & caching
- [`@tanstack/vue-table`](https://tanstack.com/table/latest/docs/framework/vue/vue-table) - Table state management

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
