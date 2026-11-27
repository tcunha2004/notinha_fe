import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { purchases } from '../../mocks/purchases';
import type { PurchaseItem } from '../../types';
import { PriceTrend } from './PriceTrend';

const item = purchases[0]?.items[0] as PurchaseItem;
const trend = (unit_price: number, previous_unit_price: number | null) =>
  render(<PriceTrend item={{ ...item, unit_price, previous_unit_price }} />).container;

describe('PriceTrend', () => {
  it('shows nothing on the first purchase or when the price held', () => {
    expect(trend(10, null)).toBeEmptyDOMElement();
    expect(trend(10, 10)).toBeEmptyDOMElement();
  });

  it('shows the signed change per unit', () => {
    expect(trend(12, 10)).toHaveTextContent('+R$ 2,00/un');
    expect(trend(9.8, 10)).toHaveTextContent('−R$ 0,20/un');
  });
});
