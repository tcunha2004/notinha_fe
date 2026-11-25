import type { User } from '../types';
import { request } from './api';

export async function getMe(): Promise<User | null> {
  const response = await request('/auth/me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`GET /auth/me failed: ${response.status}`);
  return response.json();
}

export async function loginWithGoogle(credential: string): Promise<User> {
  const response = await request('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!response.ok) throw new Error(`POST /auth/google failed: ${response.status}`);
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await request('/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error(`POST /auth/logout failed: ${response.status}`);
}
