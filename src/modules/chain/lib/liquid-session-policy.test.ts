import { describe, expect, it } from 'vitest';

import type { LiquidLifecycleState } from './liquid-session-policy';
import {
  LIQUID_SESSION_TIMEOUT_MS,
  initialLiquidLifecycleState,
  isInLiquidBackgroundGrace,
  reduceLiquidLifecycle,
} from './liquid-session-policy';

const T = LIQUID_SESSION_TIMEOUT_MS;

describe('reduceLiquidLifecycle', () => {
  describe('background', () => {
    it('records the background epoch and clears any resume grace', () => {
      const { state, action } = reduceLiquidLifecycle(
        { backgroundedAt: null, resumeGraceUntil: 999 },
        { type: 'background', now: 1_000 },
      );
      expect(action).toBe('none');
      expect(state).toEqual({ backgroundedAt: 1_000, resumeGraceUntil: 0 });
    });
  });

  describe('foreground with no prior background', () => {
    it('does nothing (transient inactive→active)', () => {
      const { state, action } = reduceLiquidLifecycle(initialLiquidLifecycleState, {
        type: 'foreground',
        now: 5_000,
        isOnLiquid: true,
      });
      expect(action).toBe('none');
      expect(state).toBe(initialLiquidLifecycleState);
    });
  });

  describe('foreground off Liquid', () => {
    it('marks stale regardless of how short the background was', () => {
      const { state, action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'foreground', now: 1_000 + 5, isOnLiquid: false },
      );
      expect(action).toBe('markStale');
      expect(state).toEqual({ backgroundedAt: null, resumeGraceUntil: 0 });
    });

    it('marks stale even after a long background', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'foreground', now: 1_000 + T * 10, isOnLiquid: false },
      );
      expect(action).toBe('markStale');
    });
  });

  describe('foreground on Liquid', () => {
    it('reconnects within the timeout and suppresses the disconnect handler until the deadline', () => {
      const { state, action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'foreground', now: 1_000 + T - 1, isOnLiquid: true },
      );
      expect(action).toBe('reconnect');
      expect(state).toEqual({ backgroundedAt: null, resumeGraceUntil: 1_000 + T });
    });

    it('re-verifies at exactly the timeout boundary', () => {
      const { state, action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'foreground', now: 1_000 + T, isOnLiquid: true },
      );
      expect(action).toBe('reverify');
      expect(state).toEqual({ backgroundedAt: null, resumeGraceUntil: 0 });
    });

    it('re-verifies well beyond the timeout', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'foreground', now: 1_000 + T + 60_000, isOnLiquid: true },
      );
      expect(action).toBe('reverify');
    });
  });

  describe('networkDisconnected', () => {
    it('does nothing while backgrounded within the timeout', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: 1_000, resumeGraceUntil: 0 },
        { type: 'networkDisconnected', now: 1_000 + T - 1 },
      );
      expect(action).toBe('none');
    });

    it('does nothing during the post-resume grace', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: null, resumeGraceUntil: 10_000 },
        { type: 'networkDisconnected', now: 9_999 },
      );
      expect(action).toBe('none');
    });

    it('reconnects outside any grace window', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: null, resumeGraceUntil: 0 },
        { type: 'networkDisconnected', now: 50_000 },
      );
      expect(action).toBe('reconnect');
    });

    it('reconnects once the post-resume grace has elapsed', () => {
      const { action } = reduceLiquidLifecycle(
        { backgroundedAt: null, resumeGraceUntil: 10_000 },
        { type: 'networkDisconnected', now: 10_000 },
      );
      expect(action).toBe('reconnect');
    });
  });

  describe('end-to-end: off Liquid then back on Liquid stays consistent', () => {
    it('background→foreground(off Liquid) marks stale, then a later on-Liquid cycle reconnects', () => {
      let state: LiquidLifecycleState = initialLiquidLifecycleState;

      ({ state } = reduceLiquidLifecycle(state, { type: 'background', now: 0 }));
      const offLiquid = reduceLiquidLifecycle(state, {
        type: 'foreground',
        now: 5,
        isOnLiquid: false,
      });
      expect(offLiquid.action).toBe('markStale');
      state = offLiquid.state;

      ({ state } = reduceLiquidLifecycle(state, { type: 'background', now: 100_000 }));
      const onLiquid = reduceLiquidLifecycle(state, {
        type: 'foreground',
        now: 100_000 + 10,
        isOnLiquid: true,
      });
      expect(onLiquid.action).toBe('reconnect');
    });
  });
});

describe('isInLiquidBackgroundGrace', () => {
  it('is true while backgrounded within the timeout', () => {
    expect(
      isInLiquidBackgroundGrace({ backgroundedAt: 1_000, resumeGraceUntil: 0 }, 1_000 + T - 1),
    ).toBe(true);
  });

  it('is false once the background exceeds the timeout', () => {
    expect(
      isInLiquidBackgroundGrace({ backgroundedAt: 1_000, resumeGraceUntil: 0 }, 1_000 + T),
    ).toBe(false);
  });

  it('is true during the post-resume grace', () => {
    expect(
      isInLiquidBackgroundGrace({ backgroundedAt: null, resumeGraceUntil: 10_000 }, 9_999),
    ).toBe(true);
  });

  it('is false with no background and no resume grace', () => {
    expect(isInLiquidBackgroundGrace(initialLiquidLifecycleState, 123_456)).toBe(false);
  });
});
