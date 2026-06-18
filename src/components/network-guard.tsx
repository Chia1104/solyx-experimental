import { useNetworkState } from 'expo-network';

export interface NetworkGuardContext {
  /** Whether the device currently has a network connection. */
  isConnected: boolean;
}

interface Props {
  children: React.ReactNode | ((ctx: NetworkGuardContext) => React.ReactNode);
  /**
   * Rendered while offline. Receives the guard context so it can show e.g. a
   * retry affordance. When omitted, children still render — useful for the
   * "soft guard" pattern where you only want the context (to show a banner over
   * cached data) rather than replacing the screen.
   */
  fallback?: React.ReactNode | ((ctx: NetworkGuardContext) => React.ReactNode);
  /**
   * Treat "connected but no real internet" (captive portal, wifi without
   * uplink) as offline. Defaults to `false` to avoid false positives on
   * flaky reachability probes.
   */
  requireReachable?: boolean;
}

const render = (
  node: Props['children'] | Props['fallback'],
  ctx: NetworkGuardContext,
): React.ReactNode => (typeof node === 'function' ? node(ctx) : node);

/**
 * Per-screen network guard. Mirrors the shape of `AppGuard` (children-or-render-prop
 * + `fallback` + context) but scoped to a single screen/section.
 *
 * Pairs with `useOnlineManager` (which makes the underlying queries pause/resume):
 * this component decides what the *user* sees while offline.
 *
 * - Hard guard: pass `fallback` → offline replaces the subtree with the fallback.
 * - Soft guard: omit `fallback`, use the render-prop `isConnected` to overlay a
 *   banner while keeping the (persisted/cached) content visible.
 */
export const NetworkGuard = ({ children, fallback, requireReachable }: Props) => {
  const { isConnected, isInternetReachable } = useNetworkState();

  // `isConnected` is `undefined` until the first probe resolves — treat unknown
  // as online to avoid a fallback flash on cold start.
  const online = isConnected !== false && (!requireReachable || isInternetReachable !== false);
  const ctx: NetworkGuardContext = { isConnected: !!isConnected };

  if (!online && fallback !== undefined) {
    return render(fallback, ctx);
  }

  return render(children, ctx);
};
