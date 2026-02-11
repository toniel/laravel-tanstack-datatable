<script setup lang="ts">
import type { LaravelPaginationResponse } from "@toniel/laravel-tanstack-pagination";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { computed } from "vue";

interface Props {
  pagination?: LaravelPaginationResponse | null;
  perPageOptions?: number[];
  currentPerPage?: number;
  showPerPageSelector?: boolean;
}

interface Emits {
  pageChange: [page: number];
  perPageChange: [perPage: number];
}

const props = withDefaults(defineProps<Props>(), {
  pagination: null,
  perPageOptions: () => [10, 15, 25, 50, 100],
  currentPerPage: 10,
  showPerPageSelector: true,
});

const emit = defineEmits<Emits>();

const canGoPrevious = computed(() =>
  props.pagination ? props.pagination.meta.current_page > 1 : false,
);

const canGoNext = computed(() =>
  props.pagination
    ? props.pagination.meta.current_page < props.pagination.meta.last_page
    : false,
);

const visiblePages = computed(() => {
  if (!props.pagination) return [];

  const current = props.pagination.meta.current_page;
  const last = props.pagination.meta.last_page;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l: number | undefined;

  for (let i = 1; i <= last; i++) {
    if (
      i === 1 ||
      i === last ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

const goToPage = (page: number | string) => {
  if (typeof page === "number") {
    emit("pageChange", page);
  }
};

const goToPreviousPage = () => {
  if (canGoPrevious.value && props.pagination) {
    emit("pageChange", props.pagination.meta.current_page - 1);
  }
};

const goToNextPage = () => {
  if (canGoNext.value && props.pagination) {
    emit("pageChange", props.pagination.meta.current_page + 1);
  }
};
</script>

<template>
  <div
    v-if="pagination && pagination.meta.last_page > 1"
    class="flex items-center justify-between border-t border-border bg-background px-4 py-3 sm:px-6"
  >
    <div class="flex flex-1 flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <p class="hidden text-sm text-muted-foreground sm:block">
          Showing
          <span class="font-medium">{{ pagination.meta.from }}</span>
          to
          <span class="font-medium">{{ pagination.meta.to }}</span>
          of
          <span class="font-medium">{{ pagination.meta.total }}</span>
          results
        </p>
      </div>

      <div v-if="showPerPageSelector" class="flex items-center gap-2">
        <p class="text-sm text-muted-foreground">Rows per page:</p>
        <select
          :value="currentPerPage"
          class="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          @change="
            emit(
              'perPageChange',
              Number(($event.target as HTMLSelectElement).value),
            )
          "
        >
          <option
            v-for="option in perPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <div>
        <nav
          class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <button
            :disabled="!canGoPrevious"
            class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="goToPreviousPage"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>

          <template v-for="(page, index) in visiblePages" :key="index">
            <button
              v-if="page !== '...'"
              :class="[
                'relative inline-flex items-center border px-4 py-2 text-sm font-medium',
                page === pagination.meta.current_page
                  ? 'z-10 border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50',
              ]"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              ...
            </span>
          </template>

          <button
            :disabled="!canGoNext"
            class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="goToNextPage"
          >
            <span class="sr-only">Next</span>
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
