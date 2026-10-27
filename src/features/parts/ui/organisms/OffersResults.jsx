import { Loader } from '@/shared/ui/molecules/Loader';

import { RequestError } from '@/features/parts/ui/molecules/RequestError';

import { OffersTable } from './OffersTable';

export function OffersResults({ isLoading, offersQuery, onRetry }) {
  if (isLoading) {
    return <Loader>Загружаем предложения…</Loader>;
  }
  if (offersQuery?.isError) {
    return <RequestError error={offersQuery.error} onRetry={onRetry} />;
  }
  if (!offersQuery?.isSuccess) {
    return null;
  }

  return <OffersTable parts={offersQuery.currentData ?? []} />;
}
