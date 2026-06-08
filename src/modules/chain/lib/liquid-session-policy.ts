/**
 * Pure decision logic for the Liquid session lifecycle.
 *
 * The Liquid (GDK) session can't be kept alive in the Android background without a foreground
 * service, so the rules here decide — from app-state / network events — when to silently reconnect,
 * when to force a re-unlock, and when to simply mark the session stale. Keeping this pure (no React,
 * no store, no clock) makes the invariants explicit and unit-testable; `LiquidSessionInterceptor`
 * is just the adapter that feeds events in and runs the resulting action.
 */

export const LIQUID_SESSION_TIMEOUT_MS = 30_000;

export interface LiquidLifecycleState {
  /** Epoch (ms) the app was backgrounded at, or null while foregrounded. */
  backgroundedAt: number | null;
  /**
   * Until this epoch (ms), the network-disconnect handler stays suppressed after a resume, so it
   * can't race the reconnect kicked off on foreground.
   */
  resumeGraceUntil: number;
}

export const initialLiquidLifecycleState: LiquidLifecycleState = {
  backgroundedAt: null,
  resumeGraceUntil: 0,
};

export type LiquidLifecycleEvent =
  | { type: 'background'; now: number }
  | { type: 'foreground'; now: number; isOnLiquid: boolean }
  | { type: 'networkDisconnected'; now: number };

export type LiquidSessionAction =
  /** Do nothing. */
  | 'none'
  /** Restore the socket; if the authenticated session is gone, fall back to a re-unlock. */
  | 'reconnect'
  /** Tear down and force a re-unlock (password). */
  | 'reverify'
  /** Mark the session stale without tearing down — the next Liquid access re-verifies. */
  | 'markStale';

/**
 * True while the app is backgrounded within the timeout, or just-resumed before that original
 * deadline. The socket may drop here without the login being invalid, so teardown is suppressed.
 */
export const isInLiquidBackgroundGrace = (
  state: LiquidLifecycleState,
  now: number,
  timeoutMs: number = LIQUID_SESSION_TIMEOUT_MS,
): boolean =>
  (state.backgroundedAt !== null && now - state.backgroundedAt < timeoutMs) ||
  now < state.resumeGraceUntil;

/**
 * Given the current lifecycle state and an event, return the next state and the action to run.
 * Pure: the caller passes `now` and reads the chain from `isOnLiquid`, and applies the action.
 */
export const reduceLiquidLifecycle = (
  state: LiquidLifecycleState,
  event: LiquidLifecycleEvent,
  timeoutMs: number = LIQUID_SESSION_TIMEOUT_MS,
): { state: LiquidLifecycleState; action: LiquidSessionAction } => {
  switch (event.type) {
    case 'background':
      return {
        state: { backgroundedAt: event.now, resumeGraceUntil: 0 },
        action: 'none',
      };

    case 'foreground': {
      const { backgroundedAt } = state;

      // No recorded background (e.g. a transient inactive→active with no real suspension).
      if (backgroundedAt === null) {
        return { state, action: 'none' };
      }

      // Off Liquid the session is never maintained while backgrounded (no reconnect, no network
      // listener), so any background drops it and the cached login flag is stale. Mark it stale so
      // returning to Liquid re-verifies; no prompt is needed off Liquid.
      if (!event.isOnLiquid) {
        return {
          state: { backgroundedAt: null, resumeGraceUntil: 0 },
          action: 'markStale',
        };
      }

      // On Liquid: the 30s window gates the login teardown, not the socket. Within it, reconnect and
      // keep suppressing the disconnect handler until the original deadline; beyond it, re-verify.
      if (event.now - backgroundedAt < timeoutMs) {
        return {
          state: { backgroundedAt: null, resumeGraceUntil: backgroundedAt + timeoutMs },
          action: 'reconnect',
        };
      }

      return {
        state: { backgroundedAt: null, resumeGraceUntil: 0 },
        action: 'reverify',
      };
    }

    case 'networkDisconnected':
      // Backgrounding drops the socket; within the grace window the foreground handler decides on
      // resume, so do nothing. Outside it, reconnect (and only re-unlock if that fails).
      if (isInLiquidBackgroundGrace(state, event.now, timeoutMs)) {
        return { state, action: 'none' };
      }
      return { state, action: 'reconnect' };
  }
};
