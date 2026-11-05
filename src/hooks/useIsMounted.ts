import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Custom hook that safely detects client-side hydration without triggering
 * cascading re-renders or react-hooks/set-state-in-effect warnings.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
