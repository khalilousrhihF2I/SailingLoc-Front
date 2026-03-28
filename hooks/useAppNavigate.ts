import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { Page } from '../types/navigation';
import { buildPath } from '../config/routes';

/**
 * Hook that provides a navigate function compatible with the legacy
 * `onNavigate(page: Page, data?: any)` interface but backed by React Router.
 */
export function useAppNavigate() {
  const nav = useNavigate();

  return useCallback((page: Page, data?: any) => {
    const path = buildPath(page, data);
    nav(path, { state: data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [nav]);
}
