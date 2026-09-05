import {describe, expect, test} from 'vitest';
import {
  DEFAULT_MARGINS,
  getInnerDimensions,
  getRadialLayoutMargin
} from '../chart-utils';

describe('chart-utils', () => {
  test('calculates dimensions from default and numeric margins', () => {
    expect(getInnerDimensions({width: 300, height: 200}, DEFAULT_MARGINS)).toEqual({
      marginLeft: 40,
      marginRight: 10,
      marginTop: 10,
      marginBottom: 40,
      innerWidth: 250,
      innerHeight: 150
    });
    expect(getInnerDimensions({width: 100, height: 80, margin: 5}, DEFAULT_MARGINS)).toEqual({
      marginLeft: 5,
      marginRight: 5,
      marginTop: 5,
      marginBottom: 5,
      innerWidth: 90,
      innerHeight: 70
    });
  });

  test('centers a radial layout', () => {
    expect(getRadialLayoutMargin(500, 300, 120)).toEqual({
      bottom: 30,
      left: 130,
      right: 130,
      top: 30
    });
  });
});
