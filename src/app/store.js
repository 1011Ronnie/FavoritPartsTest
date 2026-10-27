import { configureStore } from '@reduxjs/toolkit';

import { partsApi } from '@/features/parts/api/partsApi';

export function createAppStore() {
  return configureStore({
    reducer: { [partsApi.reducerPath]: partsApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(partsApi.middleware),
  });
}
