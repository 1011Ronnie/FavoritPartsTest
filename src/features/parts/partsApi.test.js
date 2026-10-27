import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppStore } from '../../app/store';
import { emptyPart, makePart } from '../../test/fixtures';
import { API_URL, server } from '../../test/server';

import { partsApi, REQUEST_TIMEOUT } from './partsApi';

const stores = [];
function query(endpoint, args) {
  const store = createAppStore();
  stores.push(store);
  return store.dispatch(partsApi.endpoints[endpoint].initiate(args));
}

afterEach(() => {
  stores
    .splice(0)
    .forEach((store) => store.dispatch(partsApi.util.resetApiState()));
});

describe('parts API', () => {
  it('encodes the article and brand once and requests analogues with the configured key', async () => {
    let received;
    server.use(
      http.get(API_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json({ goods: [makePart()] });
      }),
    );
    const result = await query('getOffers', {
      number: 'A#1 &/+',
      brand: 'NGK/NTK & #',
    });
    expect(result.isSuccess).toBe(true);
    expect(Object.fromEntries(received)).toEqual({
      number: 'A#1 &/+',
      brand: 'NGK/NTK & #',
      analogues: 'on',
      key: 'test-key',
    });
  });

  it('does not send a request when the key is missing', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    const handler = vi.fn(() => HttpResponse.json({ goods: [] }));
    server.use(http.get(API_URL, handler));
    const result = await query('getManufacturers', '123');
    expect(result.isError).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it.each([{ goods: [] }, { goods: [emptyPart] }])(
    'recognizes an empty search response (%j)',
    async ({ goods }) => {
      server.use(http.get(API_URL, () => HttpResponse.json({ goods })));
      expect((await query('getManufacturers', '123')).data).toEqual([]);
    },
  );

  it('turns an API error with HTTP 200 into an error state without retrying', async () => {
    const handler = vi.fn(() =>
      HttpResponse.json({ error: 'Invalid key client!' }),
    );
    server.use(http.get(API_URL, handler));
    const result = await query('getManufacturers', '123');
    expect(result.error).toEqual({
      status: 'CUSTOM_ERROR',
      error: 'Invalid key client!',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles an HTTP error', async () => {
    server.use(http.get(API_URL, () => HttpResponse.json({}, { status: 503 })));
    expect((await query('getManufacturers', '123')).error.status).toBe(503);
  });

  it('handles a network failure', async () => {
    server.use(http.get(API_URL, () => HttpResponse.error()));
    expect((await query('getManufacturers', '123')).error.status).toBe(
      'FETCH_ERROR',
    );
  });

  it('handles malformed JSON', async () => {
    server.use(
      http.get(
        API_URL,
        () =>
          new HttpResponse('{broken', {
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
    expect((await query('getManufacturers', '123')).error.status).toBe(
      'PARSING_ERROR',
    );
  });

  it.each([null, {}, { goods: null }])(
    'handles invalid response structure (%j)',
    async (body) => {
      server.use(http.get(API_URL, () => HttpResponse.json(body)));
      expect((await query('getManufacturers', '123')).error.error).toContain(
        'некорректный ответ',
      );
    },
  );

  it('aborts a pending fetch when its query handle is cancelled', async () => {
    let resolveStarted;
    let resolveAborted;
    const started = new Promise((resolve) => {
      resolveStarted = resolve;
    });
    const aborted = new Promise((resolve) => {
      resolveAborted = resolve;
    });
    server.use(
      http.get(API_URL, async ({ request }) => {
        request.signal.addEventListener('abort', resolveAborted, {
          once: true,
        });
        resolveStarted();
        await delay(100);
        return HttpResponse.json({ goods: [] });
      }),
    );
    const pending = query('getManufacturers', '123');
    await started;
    pending.abort();
    await aborted;
    expect((await pending).error.name).toBe('AbortError');
  });

  it('times out a pending request after 20 seconds', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    server.use(
      http.get(API_URL, async () => {
        await delay(REQUEST_TIMEOUT + 1000);
        return HttpResponse.json({ goods: [] });
      }),
    );
    const pending = query('getManufacturers', '123');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT + 1);
    expect((await pending).error.status).toBe('TIMEOUT_ERROR');
  });
});
