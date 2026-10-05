import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('initializes with default guest state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets user when checkAuth finds authenticated session', async () => {
    const mockUser = {
      id: 'usr_123',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response);

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it('clears user when checkAuth returns no user session', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ user: null }),
    } as Response);

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('handles fetch network error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('logs out and clears user state', async () => {
    useAuthStore.setState({
      user: { id: 'usr_1', name: 'Test', email: 'test@meadow.in' },
      isAuthenticated: true,
      isLoading: false,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
