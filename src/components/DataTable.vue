<script setup lang="ts">
import type { LaravelPaginationResponse } from "@toniel/laravel-tanstack-pagination";
import {
  FlexRender,
  useTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/vue-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, CircleX, Inbox, RefreshCw } from "lucide-vue-next";
import { computed } from "vue";
import { dataTableFeatures, type DataTableFeatures } from "../lib/features";
import DataTablePagination from "./DataTablePagination.vue";

interface Props {
  data?: any[];
  columns: ColumnDef<DataTableFeatures, any>[];
  pagination?: LaravelPaginationResponse | null;
  isLoading?: boolean;
  error?: Error | null;
  search?: string;
  currentPerPage?: number;
  perPageOptions?: number[];
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, any>;

  // Row Selection Props
  rowSelection?: RowSelectionState;
  enableRowSelection?: boolean;
  /**
   * Row identity. Numbers are accepted because the default returns `row.id`,
   * which is numeric for most Laravel models; every id is stringified before
   * it reaches the table or the selection map.
   */
  getRowId?: (row: any) => string | number;
  showSelectionInfo?: boolean;

  // UI Options
  showSearch?: boolean;
  showPerPageSelector?: boolean;

  // Row Styling
  rowClassName?: string | ((row: any) => string);

  // Text customization
  title?: string;
  itemName?: string;
  loadingText?: string;
  errorTitle?: string;
  emptyStateText?: string;
  searchPlaceholder?: string;
  /** Accessible name for the search input, announced by screen readers. */
  searchLabel?: string;
}

const emit = defineEmits<{
  pageChange: [page: number];
  perPageChange: [perPage: number];
  /**
   * Fired on every keystroke — this component does not debounce. Debounce in
   * the parent before issuing a request.
   */
  searchChange: [search: string];
  sortChange: [column: string];
  filterChange: [filters: Record<string, any>];
  retry: [];
  "update:rowSelection": [selection: RowSelectionState];
}>();

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  pagination: null,
  isLoading: false,
  error: null,
  search: "",
  currentPerPage: 10,
  perPageOptions: () => [10, 15, 25, 50, 100],
  sortBy: null,
  sortDirection: "asc",
  filters: () => ({}),
  rowSelection: () => ({}),
  enableRowSelection: false,
  getRowId: (row: any) => row.id,
  showSelectionInfo: true,
  showSearch: true,
  showPerPageSelector: true,
  rowClassName: "",
  title: "Items",
  itemName: "items",
  loadingText: "Loading...",
  errorTitle: "Error loading data",
  emptyStateText: "No items found",
  searchPlaceholder: "Search...",
  searchLabel: "Search",
});

// Selection info.
//
// NOTE ON SCOPE: ids and count span *every* page, because rowSelection is the
// full selection map owned by the parent. Row data can only ever cover the
// current page — this component never sees rows it has not been handed. Acting
// on `currentPageSelectedData` when rows are selected across several pages
// therefore silently misses the off-page ones, which is why it is named for its
// scope. Use the ids to fetch or mutate the full set.
const selectedRowIds = computed(() => Object.keys(props.rowSelection || {}));

const selectedRowCount = computed(() => selectedRowIds.value.length);

const currentPageSelectedData = computed(() => {
  if (!props.data || !props.rowSelection) return [];
  return props.data.filter(
    (row) => props.rowSelection[String(props.getRowId(row))],
  );
});

// True when the selection extends beyond the rows currently loaded, i.e. when
// currentPageSelectedData is an incomplete view of the selection.
const hasOffPageSelection = computed(
  () => selectedRowCount.value > currentPageSelectedData.value.length,
);

// Table configuration
const table = useTable({
  features: dataTableFeatures,
  data: computed(() => props.data || []),
  columns: computed(() => props.columns),
  enableSorting: true,
  manualSorting: true,
  // Reactive in v9: the adapter watches these computed values, so toggling
  // them at runtime now updates the table instance.
  enableRowSelection: computed(() => props.enableRowSelection),
  getRowId: (row: any) => String(props.getRowId(row)),
  state: computed(() => ({
    rowSelection: props.rowSelection || {},
  })),
  onRowSelectionChange: (updater) => {
    const newSelection =
      typeof updater === "function"
        ? updater(props.rowSelection || {})
        : updater;
    emit("update:rowSelection", newSelection);
  },
  enableMultiRowSelection: true,
  enableSubRowSelection: false,
});

// Number of columns actually rendered in a row. Uses the visible flat columns
// rather than props.columns.length, which counts top-level defs and so is wrong
// for grouped headers or hidden columns.
const visibleColumnCount = computed(
  () => table.getVisibleFlatColumns().length || props.columns.length,
);

// aria-sort belongs on the <th>, and only on the column actually sorted.
const ariaSortFor = (columnId: string, canSort: boolean) => {
  if (!canSort) return undefined;
  if (props.sortBy !== columnId) return "none";
  return props.sortDirection === "asc" ? "ascending" : "descending";
};

const clearSelection = () => emit("update:rowSelection", {});

const selectAllCurrentPage = () => {
  const currentPageSelection: RowSelectionState = { ...props.rowSelection };
  table.getRowModel().rows.forEach((row) => {
    currentPageSelection[row.id] = true;
  });
  emit("update:rowSelection", currentPageSelection);
};

const deselectAllCurrentPage = () => {
  const newSelection: RowSelectionState = { ...props.rowSelection };
  table.getRowModel().rows.forEach((row) => {
    delete newSelection[row.id];
  });
  emit("update:rowSelection", newSelection);
};

defineExpose({
  clearSelection,
  selectAllCurrentPage,
  deselectAllCurrentPage,
  selectedRowCount,
  selectedRowIds,
  currentPageSelectedData,
  hasOffPageSelection,
  table,
});
</script>

<template>
    <div class="p-4 flex flex-col gap-4 bg-background text-foreground">
    <!-- Search Input, Filters, and Header Section -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left side: Search and Filters -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <!-- Search Input -->
        <div v-if="showSearch" class="relative w-full max-w-sm">
          <input
            :value="search"
            type="search"
            :aria-label="searchLabel"
            :placeholder="searchPlaceholder"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="
              emit('searchChange', ($event.target as HTMLInputElement).value)
            "
          />
        </div>

        <!-- Custom Filter Slot -->
        <div class="flex items-center gap-2">
          <slot name="filters" :filters="filters" />
        </div>
      </div>

      <!-- Right-aligned header slot for add button -->
      <div class="flex items-center">
        <slot name="header" />
      </div>
    </div>

    <!-- Selection Info & Bulk Actions -->
    <template v-if="enableRowSelection && selectedRowCount > 0">
      <slot
        name="selection-info"
        :selected-ids="selectedRowIds"
        :current-page-selected-data="currentPageSelectedData"
        :has-off-page-selection="hasOffPageSelection"
        :selected-count="selectedRowCount"
        :clear-selection="clearSelection"
        :select-all-current-page="selectAllCurrentPage"
        :deselect-all-current-page="deselectAllCurrentPage"
      >
        <div
          v-if="showSelectionInfo"
          class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
              {{ selectedRowCount }} {{ itemName }} selected
            </span>
            <div class="text-xs text-blue-600 dark:text-blue-400">
              IDs: {{ selectedRowIds.slice(0, 5).join(", ")
              }}{{ selectedRowIds.length > 5 ? "..." : "" }}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <slot
              name="bulk-actions"
              :selected-ids="selectedRowIds"
              :current-page-selected-data="currentPageSelectedData"
              :has-off-page-selection="hasOffPageSelection"
              :selected-count="selectedRowCount"
              :clear-selection="clearSelection"
              :select-all-current-page="selectAllCurrentPage"
              :deselect-all-current-page="deselectAllCurrentPage"
            />

            <button
              v-if="!$slots['bulk-actions']"
              @click="clearSelection"
              class="px-3 py-1 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </slot>
    </template>

    <!-- Loading State -->
    <div
      v-if="isLoading && data.length === 0"
      class="flex items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <div
        class="w-8 h-8 mr-3 border-b-2 border-gray-900 dark:border-gray-100 rounded-full animate-spin"
        aria-hidden="true"
      />
      <div class="text-lg text-gray-700 dark:text-gray-200">
        {{ loadingText }}
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex flex-col items-center p-8"
      role="alert"
    >
      <div class="flex items-center gap-2 mb-2 text-lg text-red-600 dark:text-red-400">
        <CircleX class="size-6" />
        <span>{{ errorTitle }}</span>
      </div>
      <div class="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {{ error.message }}
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        @click="emit('retry')"
      >
        <RefreshCw class="size-4" />
        <span>Retry</span>
      </button>
    </div>

    <!-- Table Content -->
    <div
      v-else
      class="relative rounded-lg border bg-background dark:border-gray-700"
    >
      <!--
        Loading overlay for page changes. `relative` lives on the container
        above so inset-0 resolves against the full table box; on its own
        wrapper the box collapsed to zero height and the backdrop covered
        nothing.
      -->
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-900/70"
        role="status"
        aria-live="polite"
      >
        <div
          class="w-6 h-6 border-b-2 border-gray-900 dark:border-gray-100 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span class="sr-only">{{ loadingText }}</span>
      </div>

      <div class="relative w-full overflow-auto">
        <table class="w-full caption-bottom text-sm">

          <thead class="[&_tr]:border-b bg-muted">
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="border-b transition-colors"
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                :colspan="header.colSpan"
                :aria-sort="ariaSortFor(header.column.id, header.column.getCanSort())"
                class="h-12 px-4 text-left align-middle font-bold text-muted-foreground [&:has([role=checkbox])]:pr-0"
              >
                <!--
                  Sortable headers are real <button>s so they are focusable and
                  respond to Enter/Space; non-sortable ones stay plain divs so
                  they are not announced as controls.
                -->
                <button
                  v-if="!header.isPlaceholder && header.column.getCanSort()"
                  type="button"
                  class="flex items-center gap-2 cursor-pointer select-none hover:bg-accent p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @click="emit('sortChange', header.column.id)"
                >
                  <FlexRender :header="header" />
                  <ChevronsUpDown
                    v-if="sortBy !== header.column.id"
                    :size="10"
                    class="text-gray-400"
                    aria-hidden="true"
                  />
                  <ChevronUp
                    v-else-if="sortDirection === 'asc'"
                    :size="10"
                    class="text-gray-900 dark:text-gray-100"
                    aria-hidden="true"
                  />
                  <ChevronDown
                    v-else
                    :size="10"
                    class="text-gray-900 dark:text-gray-100"
                    aria-hidden="true"
                  />
                </button>

                <div
                  v-else-if="!header.isPlaceholder"
                  class="flex items-center gap-2"
                >
                  <FlexRender :header="header" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-0 dark:[&_tr:last-child]:border-0">
            <!-- Table Rows -->
            <template v-if="table.getRowModel().rows.length > 0">
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :class="[
                  'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted dark:border-gray-700 dark:hover:bg-gray-800',
                  enableRowSelection && row.getIsSelected()
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                    : '',
                  typeof rowClassName === 'function' ? rowClassName(row.original) : (rowClassName || ''),
                ]"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                >
                  <FlexRender :cell="cell" />
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else>
              <tr>
                <td
                  :colspan="visibleColumnCount"
                  class="h-24 text-center dark:text-gray-400"
                >
                  <div class="flex flex-col items-center gap-2">
                    <Inbox class="size-8 text-muted-foreground" />
                    <span>{{ emptyStateText }}</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot v-if="pagination && pagination.meta.last_page > 1" class="border-t">
            <tr>
              <td :colspan="visibleColumnCount" class="p-0">
                <!-- Pagination Component -->
                <DataTablePagination
                  :pagination="pagination"
                  :current-per-page="currentPerPage"
                  :per-page-options="perPageOptions"
                  :show-per-page-selector="showPerPageSelector"
                  @page-change="emit('pageChange', $event)"
                  @per-page-change="emit('perPageChange', $event)"
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
