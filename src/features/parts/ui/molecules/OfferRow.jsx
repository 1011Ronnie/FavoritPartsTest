import { formatNumber } from '@/features/parts/model/partsModel';

export function OfferRow({ part, warehouse }) {
  return (
    <tr>
      <td className="text-nowrap">{part.number || '—'}</td>
      <td className="part-name">
        <div>{part.name || 'Без наименования'}</div>
        <small className="text-secondary">
          {part.kind === 'original' ? 'Исходный товар' : 'Аналог'}
        </small>
      </td>
      <td>{part.brand || '—'}</td>
      <td>{warehouse ? warehouse.code || warehouse.id || '—' : '—'}</td>
      <td className="text-nowrap">
        {warehouse ? formatNumber(warehouse.price) : '—'}
      </td>
      <td className="text-nowrap">
        {warehouse ? formatNumber(warehouse.stock) : 'Нет в наличии'}
      </td>
    </tr>
  );
}
