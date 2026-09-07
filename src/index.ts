// Composables
export { useDarkMode } from './composables/useDarkMode'
export { useRowSelection } from './composables/useRowSelection'

// Components
export { default as DataTable } from './components/DataTable.vue'
export { default as DataTablePagination } from './components/DataTablePagination.vue'

// Utils
export { cn } from './lib/utils'

// TanStack Table v9 feature set used by DataTable. Consumers need the
// DataTableFeatures type to declare columns, e.g. ColumnDef<DataTableFeatures, User>.
export { dataTableFeatures } from './lib/features'
export type { DataTableFeatures } from './lib/features'

// Types
export type { UseRowSelectionOptions, RowSelectionHelpers, SelectionColumnOptions } from './composables/useRowSelection'
