import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  normalizeOffers,
  uniqueManufacturers,
} from '@/features/parts/model/partsModel';

export const REQUEST_TIMEOUT = 20_000;

const fetchPartsQuery = fetchBaseQuery({
  baseUrl: '/api/',
  timeout: REQUEST_TIMEOUT,
});

export function getApiKey() {
  return import.meta.env.VITE_API_KEY?.trim() ?? '';
}

export const partsApi = createApi({
  reducerPath: 'partsApi',
  baseQuery: partsBaseQuery,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getManufacturers: builder.query({
      query: (number) => ({ url: 'parts', params: { number } }),
      transformResponse: ({ goods }) => uniqueManufacturers(goods),
    }),
    getOffers: builder.query({
      query: ({ number, brand }) => ({
        url: 'parts',
        params: { number, brand, analogues: 'on' },
      }),
      transformResponse: ({ goods }) => normalizeOffers(goods),
    }),
  }),
});

export const { useLazyGetManufacturersQuery, useLazyGetOffersQuery } = partsApi;

async function partsBaseQuery(requestArgs, api, extraOptions) {
  const key = getApiKey();
  if (!key) {
    return {
      error: { status: 'CUSTOM_ERROR', error: 'Не задан VITE_API_KEY.' },
    };
  }

  const response = await fetchPartsQuery(
    { ...requestArgs, params: { ...requestArgs.params, key } },
    api,
    extraOptions,
  );
  if (response.error) {
    return response;
  }

  const responseBody = response.data;
  if (responseBody && Object.hasOwn(responseBody, 'error')) {
    return {
      error: { status: 'CUSTOM_ERROR', error: String(responseBody.error) },
    };
  }
  if (!responseBody || !Array.isArray(responseBody.goods)) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: 'Сервис вернул некорректный ответ.',
      },
    };
  }

  return response;
}
