import { StrictMode } from 'react';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppStore } from '../../app/store';
import { emptyPart, makePart } from '../../test/fixtures';
import { API_URL, server } from '../../test/server';

import { partsApi } from './partsApi';
import { PartsSearch } from './PartsSearch';

const stores = [];
function renderSearch() {
  const store = createAppStore();
  stores.push(store);
  return render(
    <StrictMode>
      <Provider store={store}>
        <PartsSearch />
      </Provider>
    </StrictMode>,
  );
}

function enterArticle(article) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Артикул' }), {
    target: { value: article },
  });
}

const pause = (milliseconds) =>
  act(() => new Promise((resolve) => setTimeout(resolve, milliseconds)));

afterEach(() => {
  stores
    .splice(0)
    .forEach((store) => store.dispatch(partsApi.util.resetApiState()));
});

describe('parts search workflow', () => {
  it('supports choosing a manufacturer with Tab and Enter', async () => {
    server.use(
      http.get(API_URL, () => HttpResponse.json({ goods: [makePart()] })),
    );
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByRole('textbox', { name: 'Артикул' }), '123');
    const button = await screen.findByRole('button', { name: 'MEYLE' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('table')).toBeVisible();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears the debounce timer on unmount', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(() => HttpResponse.json({ goods: [] }));
    server.use(http.get(API_URL, handler));
    const { unmount } = renderSearch();
    enterArticle('123');
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(450));
    expect(handler).not.toHaveBeenCalled();
  });

  it('debounces input, trims only outer whitespace and clears results immediately', async () => {
    const articles = [];
    server.use(
      http.get(API_URL, ({ request }) => {
        articles.push(new URL(request.url).searchParams.get('number'));
        return HttpResponse.json({ goods: [makePart()] });
      }),
    );
    renderSearch();
    enterArticle('1');
    await pause(200);
    expect(articles).toEqual([]);
    enterArticle('  A#1 /+  ');
    await pause(200);
    expect(articles).toEqual([]);
    expect(await screen.findByRole('button', { name: 'MEYLE' })).toBeVisible();
    expect(articles).toEqual(['A#1 /+']);
    enterArticle(' ');
    expect(
      screen.queryByRole('button', { name: 'MEYLE' }),
    ).not.toBeInTheDocument();
    await pause(450);
    expect(articles).toHaveLength(1);
  });

  it('shows a configuration message and sends no requests without a key', async () => {
    vi.stubEnv('VITE_API_KEY', '');
    const handler = vi.fn(() => HttpResponse.json({ goods: [] }));
    server.use(http.get(API_URL, handler));
    renderSearch();
    enterArticle('123');
    await pause(450);
    expect(screen.getByRole('alert')).toHaveTextContent('VITE_API_KEY');
    expect(handler).not.toHaveBeenCalled();
  });

  it('shows an empty response rather than an empty brand button', async () => {
    server.use(
      http.get(API_URL, () => HttpResponse.json({ goods: [emptyPart] })),
    );
    renderSearch();
    enterArticle('unknown');
    expect(await screen.findByText(/Производители не найдены/)).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'Производители' }),
    ).not.toBeInTheDocument();
  });

  it('shows originals and analogues with warehouse prices, missing data and zero stock', async () => {
    server.use(
      http.get(API_URL, ({ request }) => {
        const isOffers = new URL(request.url).searchParams.has('brand');
        return HttpResponse.json({
          goods: [
            makePart(
              isOffers
                ? {
                    warehouses: [
                      { id: 'first', code: 'МС2', price: 1250.5, stock: 3 },
                      { id: 'fallback-id', price: 0, stock: 0 },
                      { id: 'missing-values' },
                    ],
                    analogues: [
                      makePart({
                        goodsID: 'analogue',
                        name: 'Аналог без складов',
                        brand: 'Mapco',
                        warehouses: [],
                      }),
                    ],
                  }
                : {},
            ),
          ],
        });
      }),
    );
    renderSearch();
    enterArticle('123');
    fireEvent.click(await screen.findByRole('button', { name: 'MEYLE' }));
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(rows[1]).toHaveTextContent('МС2');
    expect(rows[1]).toHaveTextContent('1 250,5');
    expect(
      within(rows[2])
        .getAllByRole('cell')
        .slice(-2)
        .map((cell) => cell.textContent),
    ).toEqual(['0', '0']);
    expect(rows[2]).toHaveTextContent('fallback-id');
    expect(
      within(rows[3])
        .getAllByRole('cell')
        .slice(-2)
        .map((cell) => cell.textContent),
    ).toEqual(['—', '—']);
    expect(rows[4]).toHaveTextContent('Нет в наличии');
    expect(rows[4]).toHaveTextContent('Аналог');
    expect(table).not.toHaveTextContent('999999');
    expect(table).not.toHaveTextContent('999');
    enterArticle('new');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'MEYLE' }),
    ).not.toBeInTheDocument();
  });

  it('allows a manufacturer request to be retried after an API error', async () => {
    let calls = 0;
    server.use(
      http.get(API_URL, () => {
        calls += 1;
        return HttpResponse.json(
          calls === 1
            ? { error: 'Request quota exceeded!' }
            : { goods: [makePart()] },
        );
      }),
    );
    renderSearch();
    enterArticle('123');
    expect(await screen.findByRole('alert')).toHaveTextContent('лимит');
    expect(calls).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить запрос' }));
    expect(await screen.findByRole('button', { name: 'MEYLE' })).toBeVisible();
    expect(calls).toBe(2);
  });

  it('allows offers to be retried and handles an empty offers response', async () => {
    let offersCalls = 0;
    server.use(
      http.get(API_URL, ({ request }) => {
        if (!new URL(request.url).searchParams.has('brand')) {
          return HttpResponse.json({ goods: [makePart()] });
        }
        offersCalls += 1;
        return offersCalls === 1
          ? HttpResponse.error()
          : HttpResponse.json({ goods: [] });
      }),
    );
    renderSearch();
    enterArticle('123');
    fireEvent.click(await screen.findByRole('button', { name: 'MEYLE' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('соединение');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить запрос' }));
    expect(
      await screen.findByText('Товары и аналоги не найдены.'),
    ).toBeVisible();
    expect(offersCalls).toBe(2);
  });

  it('aborts a previous article immediately and ignores a late response', async () => {
    const aborted = vi.fn();
    const calls = [];
    server.use(
      http.get(API_URL, async ({ request }) => {
        const number = new URL(request.url).searchParams.get('number');
        calls.push(number);
        if (number === 'old') {
          request.signal.addEventListener('abort', aborted, { once: true });
          await delay(700);
        }
        return HttpResponse.json({ goods: [makePart({ brand: number })] });
      }),
    );
    renderSearch();
    enterArticle('old');
    await waitFor(() => expect(calls).toEqual(['old']));
    enterArticle('new');
    await waitFor(() => expect(aborted).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('button', { name: 'new' })).toBeVisible();
    await pause(400);
    expect(
      screen.queryByRole('button', { name: 'old' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles article A → B → A without showing a cached or aborted response', async () => {
    let aCalls = 0;
    const bAborted = vi.fn();
    server.use(
      http.get(API_URL, async ({ request }) => {
        const number = new URL(request.url).searchParams.get('number');
        if (number === 'B') {
          request.signal.addEventListener('abort', bAborted, { once: true });
          await delay(700);
          return HttpResponse.json({
            goods: [makePart({ brand: 'B-result' })],
          });
        }
        aCalls += 1;
        await delay(aCalls === 1 ? 0 : 100);
        return HttpResponse.json({
          goods: [makePart({ brand: `A-result-${aCalls}` })],
        });
      }),
    );
    renderSearch();
    enterArticle('A');
    expect(
      await screen.findByRole('button', { name: 'A-result-1' }),
    ).toBeVisible();
    enterArticle('B');
    await pause(500);
    enterArticle('A');
    expect(
      screen.queryByRole('button', { name: 'A-result-1' }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'A-result-2' }),
    ).toBeVisible();
    expect(bAborted).toHaveBeenCalledTimes(1);
    await pause(300);
    expect(
      screen.queryByRole('button', { name: 'B-result' }),
    ).not.toBeInTheDocument();
  });

  it('aborts offers on brand switches, handles A → B → A and ignores late offers', async () => {
    const aborted = vi.fn();
    const started = [];
    let aCalls = 0;
    server.use(
      http.get(API_URL, async ({ request }) => {
        const brand = new URL(request.url).searchParams.get('brand');
        if (!brand) {
          return HttpResponse.json({
            goods: [makePart({ brand: 'A' }), makePart({ brand: 'B' })],
          });
        }
        started.push(brand);
        if (brand === 'A') {
          aCalls += 1;
        }
        const label = `${brand}-${aCalls}`;
        request.signal.addEventListener('abort', aborted, { once: true });
        await delay(
          brand === 'A' && aCalls === 1 ? 600 : brand === 'B' ? 500 : 20,
        );
        return HttpResponse.json({ goods: [makePart({ name: label, brand })] });
      }),
    );
    renderSearch();
    enterArticle('123');
    fireEvent.click(await screen.findByRole('button', { name: 'A' }));
    await waitFor(() => expect(started).toEqual(['A']));
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    await waitFor(() => expect(started).toEqual(['A', 'B']));
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(await screen.findByRole('table')).toHaveTextContent('A-2');
    await pause(650);
    expect(screen.getByRole('table')).toHaveTextContent('A-2');
    expect(screen.getByRole('table')).not.toHaveTextContent('A-1');
    expect(screen.getByRole('table')).not.toHaveTextContent('B-1');
    expect(aborted).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cancels pending offers when the article changes and cancels requests on unmount', async () => {
    const aborted = vi.fn();
    const started = vi.fn();
    server.use(
      http.get(API_URL, async ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (!params.has('brand') && params.get('number') === '123') {
          return HttpResponse.json({ goods: [makePart()] });
        }
        started();
        request.signal.addEventListener('abort', aborted, { once: true });
        await delay(300);
        return HttpResponse.json({ goods: [makePart()] });
      }),
    );
    const { unmount } = renderSearch();
    enterArticle('123');
    fireEvent.click(await screen.findByRole('button', { name: 'MEYLE' }));
    await waitFor(() => expect(started).toHaveBeenCalledTimes(1));
    enterArticle('456');
    await waitFor(() => expect(aborted).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(started).toHaveBeenCalledTimes(2));
    unmount();
    await waitFor(() => expect(aborted).toHaveBeenCalledTimes(2));
  });
});
