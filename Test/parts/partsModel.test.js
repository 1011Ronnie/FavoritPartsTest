import { describe, expect, it } from 'vitest';

import {
  formatNumber,
  getErrorMessage,
  normalizeOffers,
  uniqueManufacturers,
} from '@/features/parts/model/partsModel';

import { emptyPart, makePart } from './fixtures';

describe('response normalization', () => {
  it('removes the empty placeholder and deduplicates brands without changing special characters', () => {
    expect(
      uniqueManufacturers([
        emptyPart,
        null,
        makePart(),
        makePart(),
        makePart({ brand: 'NGK/NTK & #' }),
      ]),
    ).toEqual(['MEYLE', 'NGK/NTK & #']);
  });

  it('includes original goods and their analogues, including analogues of an empty original', () => {
    const result = normalizeOffers([
      makePart({
        analogues: [makePart({ goodsID: 'analogue' }), emptyPart, null],
      }),
      {
        ...emptyPart,
        analogues: [makePart({ goodsID: 'second-analogue', warehouses: null })],
      },
      null,
    ]);
    expect(result.map(({ goodsID, kind }) => ({ goodsID, kind }))).toEqual([
      { goodsID: 'part-1', kind: 'original' },
      { goodsID: 'analogue', kind: 'analogue' },
      { goodsID: 'second-analogue', kind: 'analogue' },
    ]);
    expect(result[2].warehouses).toEqual([]);
  });

  it('keeps valid warehouses and zero values', () => {
    expect(
      normalizeOffers([
        makePart({ warehouses: [null, [], { price: 0, stock: 0 }] }),
      ])[0].warehouses,
    ).toEqual([{ price: 0, stock: 0 }]);
  });

  it('distinguishes zero and unavailable numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('translates quota, network and timeout errors', () => {
    expect(getErrorMessage({ error: 'Request quota exceeded!' })).toContain(
      'лимит',
    );
    expect(getErrorMessage({ status: 'FETCH_ERROR' })).toContain('соединение');
    expect(getErrorMessage({ status: 'TIMEOUT_ERROR' })).toContain('20 секунд');
  });
});
