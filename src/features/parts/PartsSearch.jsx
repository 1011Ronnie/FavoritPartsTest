import { Loader } from '../../components/Loader'
import { RequestError } from '../../components/RequestError'
import { OffersTable } from './OffersTable'
import { usePartsSearch } from './usePartsSearch'

export function PartsSearch() {
  const search = usePartsSearch()
  const manufacturers = search.manufacturers
  const offers = search.offers

  return (
    <main className="container py-4 py-md-5">
      <header className="mb-4">
        <h1 className="h2">Поиск автозапчастей</h1>
        <p className="text-secondary mb-0">Введите артикул и выберите производителя, чтобы найти предложения и аналоги.</p>
      </header>

      {!search.configured && (
        <div className="alert alert-warning" role="alert">
          Для поиска укажите <code>VITE_API_KEY</code> в файле <code>.env</code> и перезапустите приложение.
        </div>
      )}

      <section className="mb-4" aria-labelledby="article-heading">
        <h2 className="h5" id="article-heading">1. Поиск производителей</h2>
        <div className="search-input mb-3">
          <label className="form-label" htmlFor="article">Артикул</label>
          <input id="article" className="form-control" value={search.article}
            onChange={(event) => search.changeArticle(event.target.value)}
            placeholder="Например, 7160500039S" autoComplete="off" spellCheck={false}
            aria-describedby="article-help" />
          <div className="form-text" id="article-help">Поиск начнётся автоматически после ввода.</div>
        </div>

        {!search.number && <p className="text-secondary" role="status">Введите артикул детали.</p>}
        {search.waiting && <p className="text-secondary" role="status">Ожидаем завершения ввода…</p>}
        {search.manufacturersPending ? <Loader>Ищем производителей…</Loader> : (
          manufacturers?.isError ? <RequestError error={manufacturers.error} onRetry={search.retryManufacturers} /> : (
            manufacturers?.isSuccess ? (
              manufacturers.currentData?.length ? (
                <div role="group" aria-label="Производители" className="d-flex flex-wrap gap-2">
                  {manufacturers.currentData.map((brand) => (
                    <button key={brand} type="button" aria-pressed={search.brand === brand}
                      className={`btn ${search.brand === brand ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => search.selectBrand(brand)}>{brand}</button>
                  ))}
                </div>
              ) : <p className="text-secondary" role="status">Производители не найдены. Проверьте артикул.</p>
            ) : null
          )
        )}
      </section>

      <section className="border-top pt-4" aria-labelledby="offers-heading">
        <h2 className="h5" id="offers-heading">2. Предложения и аналоги</h2>
        {!search.brand ? <p className="text-secondary mb-0">Выберите производителя из результатов поиска.</p> : (
          <>
            <p className="text-secondary">Артикул: <strong>{search.number}</strong> · Производитель: <strong>{search.brand}</strong></p>
            {search.offersPending ? <Loader>Загружаем предложения…</Loader> : (
              offers?.isError ? <RequestError error={offers.error} onRetry={search.retryOffers} /> : (
                offers?.isSuccess ? <OffersTable parts={offers.currentData ?? []} /> : null
              )
            )}
          </>
        )}
      </section>
    </main>
  )
}
