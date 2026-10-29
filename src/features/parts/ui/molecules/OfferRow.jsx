import { formatNumber, formatPrice } from '@/features/parts/model/partsModel';

export function OfferRow({ part, warehouse, isFirstRow, rowSpan }) {
  return (
    <tr>
      {isFirstRow && (
        <>
          <th scope="rowgroup" rowSpan={rowSpan} className="part-number">
            {part.number || '—'}
          </th>
          <td rowSpan={rowSpan} className="part-name">
            <div>{part.name || 'Без наименования'}</div>
            <small className="text-secondary">
              {part.kind === 'original' ? 'Исходный товар' : 'Аналог'}
            </small>
          </td>
          <td rowSpan={rowSpan}>{part.brand || '—'}</td>
        </>
      )}
      <td className="warehouse-code">
        {warehouse ? warehouse.code || warehouse.id || '—' : '—'}
      </td>
      <td className="offer-price">
        {warehouse ? formatPrice(warehouse.price) : '—'}
      </td>
      <td
        className={
          warehouse?.stock > 0
            ? 'offer-stock offer-stock-positive'
            : 'offer-stock'
        }
      >
        {warehouse ? formatNumber(warehouse.stock) : 'Нет в наличии'}
      </td>
    </tr>
  );
}
