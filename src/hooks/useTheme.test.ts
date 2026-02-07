import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Default matchMedia mock (light mode)
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    
    window.matchMedia = mockMatchMedia;
    
    // Reset document classes
    document.documentElement.classList.remove('dark');
  });

  describe('initialization', () => {
    it('initializes from localStorage when value exists', () => {
      localStorageMock.setItem('rafiq-nihon-theme', 'dark');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('dark');
    });

    it('defaults to light when no saved value', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('updates theme state', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });

    it('saves to localStorage', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('rafiq-nihon-theme', 'dark');
    });

    it('applies light class correctly', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('light');
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('applies dark class correctly', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('can set system theme', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('system');
      });
      
      expect(result.current.theme).toBe('system');
    });
  });

  describe('system theme', () => {
    it('system follows media query (light)', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('system');
      });
      
      // System is light, so dark class should not be present
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('system follows media query (dark)', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('system');
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('toggleTheme', () => {
    it('switches from light to dark', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
    });

    it('switches from dark to light', () => {
      localStorageMock.setItem('rafiq-nihon-theme', 'dark');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('dark');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('light');
    });
  });

  describe('isDark computed', () => {
    it('isDark is true when theme is dark', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.isDark).toBe(true);
    });

    it('isDark is false when theme is light', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('light');
      });
      
      expect(result.current.isDark).toBe(false);
    });

    it('isDark follows system when theme is system (dark)', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('system');
      });
      
      expect(result.current.isDark).toBe(true);
    });

    it('isDark follows system when theme is system (light)', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('system');
      });
      
      expect(result.current.isDark).toBe(false);
    });
  });
});
