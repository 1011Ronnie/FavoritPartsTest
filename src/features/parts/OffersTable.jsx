import { formatNumber } from './partsModel';

const TABLE_COLUMNS = [
  'Артикул',
  'Наименование',
  'Производитель',
  'Склад',
  'Цена',
  'Остаток',
];

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
        <thead>
          <tr>
            {TABLE_COLUMNS.map((heading) => (
              <th key={heading} scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parts.flatMap((part, partIndex) => {
            const warehouses = part.warehouses.length
              ? part.warehouses
              : [null];
            return warehouses.map((warehouse, warehouseIndex) => (
              <tr
                key={`${part.goodsID ?? part.number}-${partIndex}-${warehouse?.id ?? warehouseIndex}`}
              >
                <td className="text-nowrap">{part.number || '—'}</td>
                <td className="part-name">
                  <div>{part.name || 'Без наименования'}</div>
                  <small className="text-secondary">
                    {part.kind === 'original' ? 'Исходный товар' : 'Аналог'}
                  </small>
                </td>
                <td>{part.brand || '—'}</td>
                <td>
                  {warehouse ? warehouse.code || warehouse.id || '—' : '—'}
                </td>
                <td className="text-nowrap">
                  {warehouse ? formatNumber(warehouse.price) : '—'}
                </td>
                <td className="text-nowrap">
                  {warehouse ? formatNumber(warehouse.stock) : 'Нет в наличии'}
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}
