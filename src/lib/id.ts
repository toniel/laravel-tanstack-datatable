let counter = 0;

/**
 * Stable per-instance DOM id, used to wire `<label for>` to its control when
 * several tables share a page.
 *
 * Vue's own `useId()` would be the obvious choice, but it landed in 3.5 and
 * this package's peer range is `vue: ^3.0.0`, so a module-scoped counter is
 * used instead. Ids are generated during setup, in the same order on server
 * and client, so SSR hydration matches.
 */
export function useElementId(prefix: string): string {
  return `ltd-${prefix}-${++counter}`;
}
