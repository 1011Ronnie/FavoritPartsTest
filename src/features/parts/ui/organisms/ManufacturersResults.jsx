import { Loader } from '@/shared/ui/molecules/Loader';

import { ManufacturersList } from '@/features/parts/ui/molecules/ManufacturersList';
import { RequestError } from '@/features/parts/ui/molecules/RequestError';

export function ManufacturersResults({
  isLoading,
  manufacturersQuery,
  selectedBrand,
  onBrandSelect,
  onRetry,
}) {
  if (isLoading) {
    return <Loader>Ищем производителей…</Loader>;
  }
  if (manufacturersQuery?.isError) {
    return <RequestError error={manufacturersQuery.error} onRetry={onRetry} />;
  }
  if (!manufacturersQuery?.isSuccess) {
    return null;
  }
  if (!manufacturersQuery.currentData?.length) {
    return (
      <p className="text-secondary" role="status">
        Производители не найдены. Проверьте артикул.
      </p>
    );
  }

  return (
    <ManufacturersList
      brands={manufacturersQuery.currentData}
      selectedBrand={selectedBrand}
      onBrandSelect={onBrandSelect}
    />
  );
}
