import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadInvoice, ApiError } from './purchases';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => fetchMock.mockReset());

const photo = new File(['jpeg'], 'nota.jpg', { type: 'image/jpeg' });

describe('uploadInvoice', () => {
  it('posts the photo as multipart with cookies and returns id + status', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ id: 'abc', status: 'ok' }));
    await expect(uploadInvoice(photo)).resolves.toEqual({ id: 'abc', status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/invoice\/upload_invoice$/);
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' });
    expect((init.body as FormData).get('image')).toBe(photo);
  });

  it('throws ApiError carrying the HTTP status', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 422 }));
    await expect(uploadInvoice(photo)).rejects.toMatchObject({
      constructor: ApiError,
      status: 422,
    });
  });
});
