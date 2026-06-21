import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

beforeEach(() => {
  localStorage.clear();
});

describe('useSettings', () => {
  it('returns default settings on first use', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.passPercent).toBe(65);
    expect(result.current.settings.randomizeQuestions).toBe(true);
    expect(result.current.settings.theme).toBe('light');
  });

  it('updateSettings merges patch into current settings', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.updateSettings({ passPercent: 70 });
    });
    expect(result.current.settings.passPercent).toBe(70);
    expect(result.current.settings.theme).toBe('light'); // unchanged
  });

  it('updateSettings persists to localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.updateSettings({ theme: 'dark' });
    });
    expect(localStorage.getItem('tae_settings')).toContain('dark');
  });

  it('new hook instance reads persisted settings', () => {
    const { result: r1 } = renderHook(() => useSettings());
    act(() => {
      r1.current.updateSettings({ passPercent: 80 });
    });
    const { result: r2 } = renderHook(() => useSettings());
    expect(r2.current.settings.passPercent).toBe(80);
  });

  it('toggling theme dark then back to light persists correctly', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.updateSettings({ theme: 'dark' }); });
    expect(result.current.settings.theme).toBe('dark');
    act(() => { result.current.updateSettings({ theme: 'light' }); });
    expect(result.current.settings.theme).toBe('light');
  });
});
