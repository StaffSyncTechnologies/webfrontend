import { API_BASE_URL } from '../services/endpoints';

const API_ROOT = API_BASE_URL.replace('/api/v1', '');

/**
 * Convert a file path (relative or absolute) to a full URL.
 * Relative paths like /api/v1/files/logos/xxx.png get the API root prepended.
 * Absolute http(s) URLs are returned as-is.
 */
export function buildFileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_ROOT}${path}`;
}
