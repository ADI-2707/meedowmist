import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns initial value immediately upon mount', () => {
    const { result } = renderHook(() => useDebounce('initial', 350));
    expect(result.current).toBe('initial');
  });

  it('does not update value before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');
  });

  it('updates value after delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe('updated');
  });

  it('coalesces multiple rapid updates into the latest value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'fourth' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe('fourth');
  });

  it('cleans up pending timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('value', 350));

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
