import {describe, expect, test} from 'vitest';
import {
  addValueToArray,
  getUniquePropertyValues,
  transformValueToString
} from '../data-utils';

describe('data-utils', () => {
  test('returns unique values from an accessor', () => {
    expect(getUniquePropertyValues([{value: 1}, {value: 2}, {value: 1}], item => item.value)).toEqual([
      1,
      2
    ]);
  });

  test('adds a value at either end of a copied domain', () => {
    expect(addValueToArray([-10, 10], 1)).toEqual([-10, 10]);
    expect(addValueToArray([-10, 0], 1)).toEqual([-10, 1]);
    expect(addValueToArray([0, 10], -1)).toEqual([-1, 10]);
  });

  test('transforms dates and preserves numbers', () => {
    expect(transformValueToString(0)).toBe(0);
    expect(transformValueToString(new Date(43200000))).toBe('Thu Jan 01 1970');
  });
});
