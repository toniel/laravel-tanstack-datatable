import type { ColumnDef, RowSelectionState } from "@tanstack/vue-table";
import { computed, h, nextTick, ref, type Ref } from "vue";

export interface UseRowSelectionOptions<T> {
  data: Ref<T[]>;
  getRowId?: (row: T) => string;
}

export interface RowSelectionHelpers<T> {
  rowSelection: Ref<RowSelectionState>;
  selectedRowIds: Ref<string[]>;
  selectedRowData: Ref<T[]>;
  isAllCurrentPageSelected: Ref<boolean>;
  isSomeCurrentPageSelected: Ref<boolean>;
  clearSelection: () => void;
  toggleAllCurrentPage: () => void;
  toggleRowSelection: (id: string) => void;
  selectRows: (ids: string[]) => void;
  deselectRows: (ids: string[]) => void;
  getSelectionColumn: (options?: SelectionColumnOptions) => ColumnDef<T>;
}

export interface SelectionColumnOptions {
  headerClass?: string;
  cellClass?: string;
  checkboxClass?: string;
  size?: number;
}

export function useRowSelection<T>(
  options: UseRowSelectionOptions<T>,
): RowSelectionHelpers<T> {
  const { data, getRowId = (row: any) => row.id } = options;

  const rowSelection = ref<RowSelectionState>({});

  const selectedRowIds = computed(() => {
    return Object.keys(rowSelection.value).filter(
      (id) => rowSelection.value[id],
    );
  });

  const selectedRowData = computed(() => {
    if (!data.value) return [];
    return data.value.filter((item) =>
      selectedRowIds.value.includes(String(getRowId(item))),
    );
  });

  const isAllCurrentPageSelected = computed(() => {
    if (!data.value || data.value.length === 0) return false;
    return data.value.every((item) =>
      rowSelection.value[String(getRowId(item))],
    );
  });

  const isSomeCurrentPageSelected = computed(() => {
    if (!data.value) return false;
    const selected = data.value.some((item) =>
      rowSelection.value[String(getRowId(item))],
    );
    return selected && !isAllCurrentPageSelected.value;
  });

  const clearSelection = () => {
    rowSelection.value = {};
  };

  const toggleAllCurrentPage = () => {
    if (!data.value) return;

    const newSelection = { ...rowSelection.value };

    if (isAllCurrentPageSelected.value) {
      data.value.forEach((item) => {
        delete newSelection[String(getRowId(item))];
      });
    } else {
      data.value.forEach((item) => {
        newSelection[String(getRowId(item))] = true;
      });
    }

    rowSelection.value = newSelection;
  };

  const toggleRowSelection = (id: string) => {
    const newSelection = { ...rowSelection.value };
    if (newSelection[id]) {
      delete newSelection[id];
    } else {
      newSelection[id] = true;
    }
    rowSelection.value = newSelection;
  };

  const selectRows = (ids: string[]) => {
    const newSelection = { ...rowSelection.value };
    ids.forEach((id) => {
      newSelection[id] = true;
    });
    rowSelection.value = newSelection;
  };

  const deselectRows = (ids: string[]) => {
    const newSelection = { ...rowSelection.value };
    ids.forEach((id) => {
      delete newSelection[id];
    });
    rowSelection.value = newSelection;
  };

  const getSelectionColumn = (
    columnOptions: SelectionColumnOptions = {},
  ): ColumnDef<T> => {
    const {
      headerClass = "flex items-center justify-center",
      cellClass = "flex items-center justify-center",
      checkboxClass = "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2",
      size = 50,
    } = columnOptions;

    return {
      id: "select",
      header: () => {
        const checkbox = h("input", {
          type: "checkbox",
          class: checkboxClass,
          checked: isAllCurrentPageSelected.value,
          onChange: toggleAllCurrentPage,
        });
        
        if (isSomeCurrentPageSelected.value) {
          nextTick(() => {
            const el = checkbox.el as HTMLInputElement | undefined;
            if (el) el.indeterminate = true;
          });
        }
        
        return h("div", { class: headerClass }, [checkbox]);
      },
      cell: ({ row }) => {
        const id = String(getRowId(row.original));
        return h("div", { class: cellClass }, [
          h("input", {
            type: "checkbox",
            class: checkboxClass,
            checked: Boolean(rowSelection.value[id]),
            onChange: () => toggleRowSelection(id),
          }),
        ]);
      },
      enableSorting: false,
      size,
    } as ColumnDef<T>;
  };

  return {
    rowSelection,
    selectedRowIds,
    selectedRowData,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    clearSelection,
    toggleAllCurrentPage,
    toggleRowSelection,
    selectRows,
    deselectRows,
    getSelectionColumn,
  };
}
