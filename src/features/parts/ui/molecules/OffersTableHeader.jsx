const TABLE_COLUMNS = [
  'Артикул',
  'Наименование',
  'Производитель',
  'Склад',
  'Цена',
  'Остаток',
];

export function OffersTableHeader() {
  return (
    <thead>
      <tr>
        {TABLE_COLUMNS.map((heading) => (
          <th key={heading} scope="col">
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  );
}
