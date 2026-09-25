/**
 * Client for the Django API (backend/, mounted at /api/). Same-origin requests with the Django
 * session cookie; POSTs send the CSRF token Django puts in the `csrftoken` cookie.
 */
import { getCookie } from '@/lib/auth';

// Same origin in the browser; the SSR server (server.js) has no origin, so it sets Django's.
let apiOrigin = '';
export const setApiOrigin = (origin: string) => {
  apiOrigin = origin.replace(/\/$/, '');
};

type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (path: string, query?: Query) => {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const search = params.toString();
  return `${apiOrigin}/api${path}${search ? `?${search}` : ''}`;
};

const request = async <T>(method: 'GET' | 'POST', path: string, options: { query?: Query; body?: unknown } = {}) => {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRFToken'] = getCookie('csrftoken');

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: 'same-origin',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new ApiError(`Erro na API (HTTP ${response.status})`, response.status, data);
  }
  return data as T;
};

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),
};
