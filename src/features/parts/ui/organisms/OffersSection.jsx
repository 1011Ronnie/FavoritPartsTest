import { OffersResults } from './OffersResults';

export function OffersSection({
  articleNumber,
  selectedBrand,
  isLoading,
  offersQuery,
  onRetry,
}) {
  return (
    <section className="border-top pt-4" aria-labelledby="offers-heading">
      <h2 className="h5" id="offers-heading">
        2. Предложения и аналоги
      </h2>
      {!selectedBrand ? (
        <p className="text-secondary mb-0">
          Выберите производителя из результатов поиска.
        </p>
      ) : (
        <>
          <p className="text-secondary">
            Артикул: <strong>{articleNumber}</strong> · Производитель:{' '}
            <strong>{selectedBrand}</strong>
          </p>
          <OffersResults
            isLoading={isLoading}
            offersQuery={offersQuery}
            onRetry={onRetry}
          />
        </>
      )}
    </section>
  );
}
