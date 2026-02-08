<script setup lang="ts">
import type { LaravelPaginationResponse } from '@toniel/laravel-tanstack-pagination'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  pagination?: LaravelPaginationResponse | null
  perPageOptions?: number[]
  currentPerPage?: number
  showPerPageSelector?: boolean
}

interface Emits {
  pageChange: [page: number]
  perPageChange: [perPage: number]
}

const props = withDefaults(defineProps<Props>(), {
  pagination: null,
  perPageOptions: () => [10, 15, 25, 50, 100],
  currentPerPage: 10,
  showPerPageSelector: true,
})

const emit = defineEmits<Emits>()

const canGoPrevious = computed(() =>
  props.pagination ? props.pagination.meta.current_page > 1 : false
)

const canGoNext = computed(() =>
  props.pagination ? props.pagination.meta.current_page < props.pagination.meta.last_page : false
)

const visiblePages = computed(() => {
  if (!props.pagination) return []
  
  const current = props.pagination.meta.current_page
  const last = props.pagination.meta.last_page
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l: number | undefined

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    emit('pageChange', page)
  }
}

const goToFirstPage = () => {
  if (canGoPrevious.value) {
    emit('pageChange', 1)
  }
}

const goToLastPage = () => {
  if (canGoNext.value && props.pagination) {
    emit('pageChange', props.pagination.meta.last_page)
  }
}

const goToPreviousPage = () => {
  if (canGoPrevious.value && props.pagination) {
    emit('pageChange', props.pagination.meta.current_page - 1)
  }
}

const goToNextPage = () => {
  if (canGoNext.value && props.pagination) {
    emit('pageChange', props.pagination.meta.current_page + 1)
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-between gap-4 px-2 py-2 sm:flex-row text-foreground bg-background"
  >
    <!-- Left side: "Showing X to Y of Z entries" -->
    <div class="text-sm text-muted-foreground">
      <template v-if="pagination && pagination.meta.total > 0">
        Showing {{ pagination.meta.from }} to {{ pagination.meta.to }} of
        {{ pagination.meta.total }} entries
      </template>
      <template v-else>
        No entries to show
      </template>
    </div>

    <!-- Right side: Pagination and Per-page selector -->
    <div class="flex flex-col items-center gap-4 sm:flex-row">
      <!-- Per-page selector -->
      <div
        v-if="showPerPageSelector"
        class="flex items-center gap-2"
      >
        <span class="text-sm">Rows per page:</span>
        <select
          :value="currentPerPage || perPageOptions[0]"
          class="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          @change="emit('perPageChange', Number(($event.target as HTMLSelectElement).value) || perPageOptions[0])"
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

      <!-- Pagination controls -->
      <div
        v-if="pagination && pagination.meta.last_page > 1"
        class="flex items-center justify-center"
      >
        <nav class="flex items-center gap-1" role="navigation" aria-label="pagination">
          <!-- First Page -->
          <button
            :disabled="!canGoPrevious"
            :class="[
              'inline-flex items-center justify-center gap-1 h-10 w-10 text-sm font-medium transition-colors rounded-md p-2',
              canGoPrevious
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'opacity-50 cursor-not-allowed',
            ]"
            @click="goToFirstPage"
          >
            <ChevronsLeft class="h-5 w-5" />
            <span class="sr-only">First</span>
          </button>

          <!-- Previous Page -->
          <button
            :disabled="!canGoPrevious"
            :class="[
              'inline-flex items-center justify-center gap-1 h-10 w-10 text-sm font-medium transition-colors rounded-md p-2',
              canGoPrevious
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'opacity-50 cursor-not-allowed',
            ]"
            @click="goToPreviousPage"
          >
            <ChevronLeft class="h-5 w-5" />
            <span class="sr-only">Previous</span>
          </button>

          <!-- Page Numbers -->
          <div class="hidden items-center gap-1 sm:flex">
            <template
              v-for="(page, index) in visiblePages"
              :key="index"
            >
              <button
                v-if="page !== '...'"
                :class="[
                  'inline-flex items-center justify-center h-10 min-w-10 px-3 text-sm font-medium transition-colors rounded-md',
                  page === pagination.meta.current_page
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-accent hover:text-accent-foreground',
                ]"
                @click="goToPage(page as number)"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="inline-flex items-center justify-center h-10 min-w-10 px-3 text-muted-foreground"
              >
                ...
              </span>
            </template>
          </div>

          <!-- Next Page -->
          <button
            :disabled="!canGoNext"
            :class="[
              'inline-flex items-center justify-center gap-1 h-10 w-10 text-sm font-medium transition-colors rounded-md p-2',
              canGoNext
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'opacity-50 cursor-not-allowed',
            ]"
            @click="goToNextPage"
          >
            <ChevronRight class="h-5 w-5" />
            <span class="sr-only">Next</span>
          </button>

          <!-- Last Page -->
          <button
            :disabled="!canGoNext"
            :class="[
              'inline-flex items-center justify-center gap-1 h-10 w-10 text-sm font-medium transition-colors rounded-md p-2',
              canGoNext
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'opacity-50 cursor-not-allowed',
            ]"
            @click="goToLastPage"
          >
            <ChevronsRight class="h-5 w-5" />
            <span class="sr-only">Last</span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
