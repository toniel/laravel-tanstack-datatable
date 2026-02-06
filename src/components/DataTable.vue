<script setup lang="ts">
import type { LaravelPaginationResponse } from '@toniel/laravel-tanstack-pagination'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/vue-table'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { computed } from 'vue'
import DataTablePagination from './DataTablePagination.vue'

interface Props {
  data?: any[]
  columns: ColumnDef<any>[]
  pagination?: LaravelPaginationResponse | null
  isLoading?: boolean
  error?: Error | null
  search?: string
  currentPerPage?: number
  perPageOptions?: number[]
  sortBy?: string | null
  sortDirection?: 'asc' | 'desc'

  // Row Selection Props
  rowSelection?: RowSelectionState
  enableRowSelection?: boolean
  getRowId?: (row: any) => string

  // UI Optiondels
  showSearch?: boolean
  showCaption?: boolean
  showPerPageSelector?: boolean

  // Text customization
  title?: string
  itemName?: string
  loadingText?: string
  errorTitle?: string
  emptyStateText?: string
}

const emit = defineEmits<{
  pageChange: [page: number]
  perPageChange: [perPage: number]
  searchChange: [search: string]
  sortChange: [column: string]
  retry: []
  'update:rowSelection': [selection: RowSelectionState]
}>()

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  pagination: null,
  isLoading: false,
  error: null,
  search: '',
  currentPerPage: 10,
  perPageOptions: () => [10, 15, 25, 50, 100],
  sortBy: null,
  sortDirection: 'asc',
  rowSelection: () => ({}),
  enableRowSelection: false,
  getRowId: (row: any) => row.id,
  showSearch: true,
  showCaption: true,
  showPerPageSelector: true,
  title: 'Items',
  itemName: 'items',
  loadingText: 'Loading...',
  errorTitle: 'Error loading data',
  emptyStateText: '📭 No items found',
})

// Computed properties for selection info
const selectedRowCount = computed(() => {
  return Object.keys(props.rowSelection || {}).filter(key => props.rowSelection?.[key]).length
})

const selectedRowIds = computed(() => {
  return Object.keys(props.rowSelection || {}).filter(key => props.rowSelection?.[key])
})

const selectedRowData = computed(() => {
  if (!props.data || !props.rowSelection) return []
  return props.data.filter(row => props.rowSelection[props.getRowId(row)])
})

// Table configuration
const table = useVueTable({
  get data() {
    return props.data || []
  },
  columns: props.columns,
  getCoreRowModel: getCoreRowModel(),
  enableSorting: true,
  manualSorting: true,
  enableRowSelection: props.enableRowSelection,
  getRowId: props.getRowId,
  state: {
    rowSelection: props.rowSelection || {},
  },
  onRowSelectionChange: (updater) => {
    const newSelection = typeof updater === 'function'
      ? updater(props.rowSelection || {})
      : updater
    emit('update:rowSelection', newSelection)
  },
  enableMultiRowSelection: true,
  enableSubRowSelection: false,
})

// Helper functions
const getSelectedRowIds = () => selectedRowIds.value
const getSelectedRowData = () => selectedRowData.value
const clearSelection = () => emit('update:rowSelection', {})

const selectAllCurrentPage = () => {
  const currentPageSelection: RowSelectionState = { ...props.rowSelection }
  table.getRowModel().rows.forEach(row => {
    currentPageSelection[row.id] = true
  })
  emit('update:rowSelection', currentPageSelection)
}

const deselectAllCurrentPage = () => {
  const newSelection: RowSelectionState = { ...props.rowSelection }
  table.getRowModel().rows.forEach(row => {
    delete newSelection[row.id]
  })
  emit('update:rowSelection', newSelection)
}

defineExpose({
  getSelectedRowIds,
  getSelectedRowData,
  clearSelection,
  selectAllCurrentPage,
  deselectAllCurrentPage,
  selectedRowCount,
  selectedRowIds,
  selectedRowData,
  table,
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Search Input, Filters, and Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Left side: Search and Filters -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <!-- Search Input -->
        <div
          v-if="showSearch"
          class="relative w-full max-w-sm"
        >
          <!-- <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <Search class="size-5 text-muted-foreground" />
          </div> -->
          <input
            :value="search"
            type="search"
            placeholder="Search..."
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ps-14 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="emit('searchChange', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Custom Filter Slot -->
        <div class="flex items-center gap-2">
          <slot name="filters" />
        </div>
      </div>

      <!-- Right-aligned header slot for add button -->
      <div class="flex items-center">
        <slot name="header" />
      </div>
    </div>

    <!-- Selection Info & Bulk Actions -->
    <div
      v-if="enableRowSelection && selectedRowCount > 0"
      class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
          {{ selectedRowCount }} {{ itemName }} selected
        </span>
        <div class="text-xs text-blue-600 dark:text-blue-400">
          IDs: {{ selectedRowIds.slice(0, 5).join(', ') }}{{ selectedRowIds.length > 5 ? '...' : '' }}
        </div>
      </div>

      <!-- Bulk Action Slot -->
      <div class="flex items-center gap-2">
        <slot
          name="bulk-actions"
          :selected-ids="selectedRowIds"
          :selected-data="selectedRowData"
          :selected-count="selectedRowCount"
          :clear-selection="clearSelection"
          :select-all-current-page="selectAllCurrentPage"
          :deselect-all-current-page="deselectAllCurrentPage"
        />

        <!-- Default clear button if no bulk actions provided -->
        <button
          v-if="!$slots['bulk-actions']"
          @click="clearSelection"
          class="px-3 py-1 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading && !data"
      class="flex items-center justify-center p-8"
    >
      <div class="w-8 h-8 mr-3 border-b-2 border-gray-900 dark:border-gray-100 rounded-full animate-spin" />
      <div class="text-lg text-gray-700 dark:text-gray-200">
        {{ loadingText }}
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex flex-col items-center p-8"
    >
      <div class="mb-2 text-lg text-red-600 dark:text-red-400">❌ {{ errorTitle }}</div>
      <div class="mb-4 text-sm text-gray-600 dark:text-gray-300">{{ error.message }}</div>
      <button
        class="px-4 py-2 text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        @click="emit('retry')"
      >
        🔄 Retry
      </button>
    </div>

    <!-- Table Content -->
    <div v-else class="rounded-lg border bg-white dark:bg-gray-900">
      <!-- Loading overlay for page changes -->
      <div
        v-if="isLoading"
        class="relative"
      >
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-lg">
          <div class="w-6 h-6 border-b-2 border-gray-900 dark:border-gray-100 rounded-full animate-spin" />
        </div>
      </div>

      <div class="relative w-full overflow-auto">
        <table class="w-full caption-bottom text-sm">
          <caption v-if="showCaption" class="mt-4 text-sm text-muted-foreground">
            {{ title }} - Total: {{ pagination?.meta?.total || 0 }} {{ itemName }}
            <span v-if="enableRowSelection && selectedRowCount > 0" class="ml-2 text-blue-600 dark:text-blue-400">
              ({{ selectedRowCount }} selected)
            </span>
          </caption>
          <thead class="[&_tr]:border-b">
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                :colspan="header.colSpan"
                class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
              >
                <div
                  v-if="!header.isPlaceholder"
                  :class="[
                    'flex items-center gap-2',
                    header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors' : ''
                  ]"
                  @click="header.column.getCanSort() ? emit('sortChange', header.column.id) : undefined"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <div v-if="header.column.getCanSort()" class="flex flex-col">
                    <ChevronUp
                      :class="[
                        'w-3 h-3 transition-colors',
                        sortBy === header.column.id && sortDirection === 'asc'
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-400'
                      ]"
                    />
                    <ChevronDown
                      :class="[
                        'w-3 h-3 -mt-1 transition-colors',
                        sortBy === header.column.id && sortDirection === 'desc'
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-400'
                      ]"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            <!-- Table Rows -->
            <template v-if="table.getRowModel().rows.length > 0">
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :class="[
                  'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                  enableRowSelection && row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                ]"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else>
              <tr>
                <td
                  :colspan="columns.length"
                  class="h-24 text-center"
                >
                  {{ emptyStateText }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Component -->
      <DataTablePagination
        :pagination="pagination"
        :current-per-page="currentPerPage"
        :per-page-options="perPageOptions"
        :show-per-page-selector="showPerPageSelector"
        @page-change="emit('pageChange', $event)"
        @per-page-change="emit('perPageChange', $event)"
      />
    </div>
  </div>
</template>
