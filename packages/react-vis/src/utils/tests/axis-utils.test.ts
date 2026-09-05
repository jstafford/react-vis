import {describe, expect, test} from 'vitest';
import {scaleLinear} from 'd3-scale';
import {
  generateFit,
  generatePoints,
  getAxisAngle,
  getTickValues,
  getTicksTotalFromSize
} from '../axis-utils';

describe('axis-utils', () => {
  test('chooses tick totals by size', () => {
    expect(getTicksTotalFromSize(0)).toBe(5);
    expect(getTicksTotalFromSize(301)).toBe(10);
    expect(getTicksTotalFromSize(700)).toBe(20);
  });

  test('uses scale ticks or domain and accepts explicit values', () => {
    const scale = scaleLinear().domain([0, 1]);
    expect(getTickValues(scale, 2)).toEqual([0, 0.5, 1]);
    expect(getTickValues({domain: () => ['a', 'b']}, 2)).toEqual(['a', 'b']);
    expect(getTickValues(scale, 2, ['custom'])).toEqual(['custom']);
  });

  test('computes fits, points, and vertical angles', () => {
    expect(generateFit({x: 0, y: 0}, {x: 1, y: 1})).toEqual({
      left: 0,
      right: 1,
      slope: 1,
      offset: 0
    });
    expect(generateFit({x: 2, y: 0}, {x: 2, y: 1})).toEqual({
      left: 0,
      right: 1,
      slope: 0,
      offset: 2
    });
    expect(getAxisAngle({x: 0, y: 0}, {x: 0, y: 1})).toBe(Math.PI / 2);
    expect(getAxisAngle({x: 0, y: 0}, {x: 0, y: -1})).toBe((3 * Math.PI) / 2);
    expect(generatePoints({
      axisStart: {x: 0, y: 1},
      axisEnd: {x: 1, y: 1},
      numberOfTicks: 2,
      axisDomain: [10, 20]
    }).points).toHaveLength(3);
  });
});
