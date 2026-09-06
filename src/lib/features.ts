import {
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/vue-table'

/**
 * TanStack Table v9 requires features to be registered explicitly — APIs are
 * feature-gated, so an unregistered feature means its methods do not exist.
 *
 * These three back exactly what DataTable uses:
 * - `rowSelectionFeature`    → row.getIsSelected(), onRowSelectionChange
 * - `rowSortingFeature`      → column.getCanSort()
 * - `columnVisibilityFeature`→ row.getVisibleCells(), table.getVisibleFlatColumns()
 *
 * The core row model is automatic in v9; there is no getCoreRowModel() option.
 */
export const dataTableFeatures = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  columnVisibilityFeature,
})

/**
 * Pass this to v9 generics when typing columns for `DataTable`, e.g.
 * `ColumnDef<DataTableFeatures, User>` or
 * `createColumnHelper<DataTableFeatures, User>()`.
 */
export type DataTableFeatures = typeof dataTableFeatures
