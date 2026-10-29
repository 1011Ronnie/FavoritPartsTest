import { OfferRow } from '@/features/parts/ui/molecules/OfferRow';
import { OffersTableHeader } from '@/features/parts/ui/molecules/OffersTableHeader';

export function OffersTable({ parts }) {
  if (!parts.length) {
    return (
      <p className="text-secondary" role="status">
        Товары и аналоги не найдены.
      </p>
    );
  }

  return (
    <div
      className="table-responsive"
      role="region"
      aria-label="Предложения по складам"
      tabIndex={0}
    >
      <table className="table offers-table mb-0">
        <caption className="caption-top">
          Исходные товары и аналоги. Цена и остаток указаны для каждого склада.
        </caption>
        <OffersTableHeader />
        {parts.map((part, partIndex) => {
          const warehouses = part.warehouses.length ? part.warehouses : [null];
          return (
            <tbody
              key={`${part.goodsID ?? part.number}-${partIndex}`}
              className={
                part.kind === 'original'
                  ? 'part-group part-group-original'
                  : 'part-group'
              }
            >
              {warehouses.map((warehouse, index) => (
                <OfferRow
                  key={`${warehouse?.id ?? 'warehouse'}-${index}`}
                  part={part}
                  warehouse={warehouse}
                  rowSpan={warehouses.length}
                  isFirstRow={index === 0}
                />
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
