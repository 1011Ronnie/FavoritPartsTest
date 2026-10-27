import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { normalizeOffers, uniqueManufacturers } from './partsModel'

export const REQUEST_TIMEOUT = 20_000

export function getApiKey() {
  return import.meta.env.VITE_API_KEY?.trim() ?? ''
}

const fetchQuery = fetchBaseQuery({ baseUrl: '/api/', timeout: REQUEST_TIMEOUT })

async function baseQuery(args, api, extraOptions) {
  const key = getApiKey()
  if (!key) return { error: { status: 'CUSTOM_ERROR', error: 'Не задан VITE_API_KEY.' } }

  const result = await fetchQuery({ ...args, params: { ...args.params, key } }, api, extraOptions)
  if (result.error) return result

  const data = result.data
  if (data && Object.hasOwn(data, 'error')) {
    return { error: { status: 'CUSTOM_ERROR', error: String(data.error) } }
  }
  if (!data || !Array.isArray(data.goods)) {
    return { error: { status: 'CUSTOM_ERROR', error: 'Сервис вернул некорректный ответ.' } }
  }
  return result
}

export const partsApi = createApi({
  reducerPath: 'partsApi',
  baseQuery,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getManufacturers: builder.query({
      query: (number) => ({ url: 'parts', params: { number } }),
      transformResponse: ({ goods }) => uniqueManufacturers(goods),
    }),
    getOffers: builder.query({
      query: ({ number, brand }) => ({ url: 'parts', params: { number, brand, analogues: 'on' } }),
      transformResponse: ({ goods }) => normalizeOffers(goods),
    }),
  }),
})

export const { useLazyGetManufacturersQuery, useLazyGetOffersQuery } = partsApi
