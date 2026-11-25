/** fetch against our API, always sending the session cookie. */
export const request = (path: string, init?: RequestInit) =>
  fetch(`${import.meta.env.VITE_API_URL}${path}`, { credentials: 'include', ...init });
