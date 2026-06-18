import { NetworkOfflineFallback } from '@/components/fallback/network-offline-screen';
import { NetworkGuard } from '@/components/network-guard';

interface Options {
  fallback?: React.ReactNode;
  requireReachable?: boolean;
}

/**
 * Thin convenience wrapper over {@link NetworkGuard} for the common
 * "whole subtree is useless offline" case. Wrap the content component *inside*
 * the screen's `Page` so the offline fallback inherits the same safe-area. Use
 * {@link NetworkGuard} directly when you need the render-prop context.
 *
 * @example
 * const GuardedContent = withNetworkGuard(BuyScreenContent);
 * // <Page.Stack><GuardedContent /></Page.Stack>
 */
export const withNetworkGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Options,
) => {
  const fallback = options?.fallback ?? <NetworkOfflineFallback />;

  return function NetworkGuarded(props: P) {
    return (
      <NetworkGuard fallback={fallback} requireReachable={options?.requireReachable}>
        <Component {...props} />
      </NetworkGuard>
    );
  };
};
