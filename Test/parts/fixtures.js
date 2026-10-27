export const API_URL = 'http://localhost:3000/api/parts';

export function makePart(overrides = {}) {
  return {
    goodsID: 'part-1',
    brand: 'MEYLE',
    number: '7160500039/S',
    name: 'Рычаг подвески',
    count: 999,
    price: 999999,
    warehouses: [{ id: 'warehouse-1', code: 'МС2', price: 1250.5, stock: 3 }],
    ...overrides,
  };
}

export const emptyPart = {
  goodsID: '00000000-0000-0000-0000-000000000000',
  brand: '',
  number: '',
  name: '',
  count: 0,
  price: 0,
  warehouses: [],
};
