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
      <table className="table table-hover align-middle mb-0">
        <caption className="caption-top">
          Исходные товары и аналоги. Цена и остаток указаны для каждого склада.
        </caption>
        <OffersTableHeader />
        <tbody>
          {parts.flatMap((part, partIndex) => {
            const warehouses = part.warehouses.length
              ? part.warehouses
              : [null];
            return warehouses.map((warehouse, warehouseIndex) => (
              <OfferRow
                key={`${part.goodsID ?? part.number}-${partIndex}-${warehouse?.id ?? warehouseIndex}`}
                part={part}
                warehouse={warehouse}
              />
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}
