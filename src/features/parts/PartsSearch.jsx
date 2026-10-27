import { usePartsSearch } from '@/features/parts/hooks/usePartsSearch';
import { ApiKeyNotice } from '@/features/parts/ui/molecules/ApiKeyNotice';
import { SearchHeader } from '@/features/parts/ui/molecules/SearchHeader';
import { ManufacturersSection } from '@/features/parts/ui/organisms/ManufacturersSection';
import { OffersSection } from '@/features/parts/ui/organisms/OffersSection';

export function PartsSearch() {
  const search = usePartsSearch();

  return (
    <main className="container py-4 py-md-5">
      <SearchHeader />
      {!search.isConfigured && <ApiKeyNotice />}
      <ManufacturersSection
        articleInput={search.articleInput}
        articleNumber={search.articleNumber}
        isWaitingForInput={search.isWaitingForInput}
        isLoading={search.isManufacturersPending}
        manufacturersQuery={search.manufacturersQuery}
        selectedBrand={search.selectedBrand}
        onArticleChange={search.handleArticleChange}
        onBrandSelect={search.handleBrandSelect}
        onRetry={search.handleManufacturersRetry}
      />
      <OffersSection
        articleNumber={search.articleNumber}
        selectedBrand={search.selectedBrand}
        isLoading={search.isOffersPending}
        offersQuery={search.offersQuery}
        onRetry={search.handleOffersRetry}
      />
    </main>
  );
}
