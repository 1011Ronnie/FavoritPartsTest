import { ArticleField } from '@/features/parts/ui/molecules/ArticleField';

import { ManufacturersResults } from './ManufacturersResults';

export function ManufacturersSection({
  articleInput,
  articleNumber,
  isWaitingForInput,
  isLoading,
  manufacturersQuery,
  selectedBrand,
  onArticleChange,
  onBrandSelect,
  onRetry,
}) {
  return (
    <section className="mb-4" aria-labelledby="article-heading">
      <h2 className="h5" id="article-heading">
        1. Поиск производителей
      </h2>
      <ArticleField value={articleInput} onChange={onArticleChange} />

      {!articleNumber && (
        <p className="text-secondary" role="status">
          Введите артикул детали.
        </p>
      )}
      {isWaitingForInput && (
        <p className="text-secondary" role="status">
          Ожидаем завершения ввода…
        </p>
      )}
      <ManufacturersResults
        isLoading={isLoading}
        manufacturersQuery={manufacturersQuery}
        selectedBrand={selectedBrand}
        onBrandSelect={onBrandSelect}
        onRetry={onRetry}
      />
    </section>
  );
}
