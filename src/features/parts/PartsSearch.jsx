import { Loader } from '../../components/Loader';

import { OffersTable } from './OffersTable';
import { RequestError } from './RequestError';
import { usePartsSearch } from './usePartsSearch';

export function PartsSearch() {
  const search = usePartsSearch();

  return (
    <main className="container py-4 py-md-5">
      <header className="mb-4">
        <h1 className="h2">Поиск автозапчастей</h1>
        <p className="text-secondary mb-0">
          Введите артикул и выберите производителя, чтобы найти предложения и
          аналоги.
        </p>
      </header>

      {!search.isConfigured && (
        <div className="alert alert-warning" role="alert">
          Для поиска укажите <code>VITE_API_KEY</code> в файле <code>.env</code>{' '}
          и перезапустите приложение.
        </div>
      )}

      <section className="mb-4" aria-labelledby="article-heading">
        <h2 className="h5" id="article-heading">
          1. Поиск производителей
        </h2>
        <div className="search-input mb-3">
          <label className="form-label" htmlFor="article">
            Артикул
          </label>
          <input
            id="article"
            className="form-control"
            value={search.articleInput}
            onChange={(event) => search.handleArticleChange(event.target.value)}
            placeholder="Например, 7160500039S"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="article-help"
          />
          <div className="form-text" id="article-help">
            Поиск начнётся автоматически после ввода.
          </div>
        </div>

        {!search.articleNumber && (
          <p className="text-secondary" role="status">
            Введите артикул детали.
          </p>
        )}
        {search.isWaitingForInput && (
          <p className="text-secondary" role="status">
            Ожидаем завершения ввода…
          </p>
        )}
        <ManufacturersResults
          isLoading={search.isManufacturersPending}
          manufacturersQuery={search.manufacturersQuery}
          selectedBrand={search.selectedBrand}
          onBrandSelect={search.handleBrandSelect}
          onRetry={search.handleManufacturersRetry}
        />
      </section>

      <section className="border-top pt-4" aria-labelledby="offers-heading">
        <h2 className="h5" id="offers-heading">
          2. Предложения и аналоги
        </h2>
        {!search.selectedBrand ? (
          <p className="text-secondary mb-0">
            Выберите производителя из результатов поиска.
          </p>
        ) : (
          <>
            <p className="text-secondary">
              Артикул: <strong>{search.articleNumber}</strong> · Производитель:{' '}
              <strong>{search.selectedBrand}</strong>
            </p>
            <OffersResults
              isLoading={search.isOffersPending}
              offersQuery={search.offersQuery}
              onRetry={search.handleOffersRetry}
            />
          </>
        )}
      </section>
    </main>
  );
}

function ManufacturersResults({
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
    <div
      role="group"
      aria-label="Производители"
      className="d-flex flex-wrap gap-2"
    >
      {manufacturersQuery.currentData.map((brand) => (
        <button
          key={brand}
          type="button"
          aria-pressed={selectedBrand === brand}
          className={
            selectedBrand === brand
              ? 'btn btn-primary'
              : 'btn btn-outline-primary'
          }
          onClick={() => onBrandSelect(brand)}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}

function OffersResults({ isLoading, offersQuery, onRetry }) {
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
