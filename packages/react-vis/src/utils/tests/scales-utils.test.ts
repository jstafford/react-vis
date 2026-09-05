import {describe, expect, test} from 'vitest';
import {
  _adjustCategoricalScale,
  _getScaleDistanceAndAdjustedDomain,
  _getSmallestDistanceIndex,
  extractScalePropsFromProps,
  getAttributeFunctor,
  getAttr0Functor,
  getAttributeScale,
  getAttributeValue,
  getDomainByAccessor,
  getMissingScaleProps,
  getOptionalScaleProps,
  getScaleObjectFromProps,
  getXYPlotValues,
  literalScale
} from '../scales-utils';

describe('ScaleUtils', () => {
  test('computes the smallest distance index and categorical adjustment', () => {
    const scaleObject = {
      type: 'ordinal',
      domain: ['a', 'b', 'c'],
      range: [0, 50, 100],
      distance: 0,
      attr: 'x',
      baseValue: undefined,
      isValue: false,
      accessor: d => d.x,
      accessor0: d => d.x0
    } as any;

    expect(_getSmallestDistanceIndex(['a', 'b', 'c'], scaleObject)).toBe(1);
    expect(_adjustCategoricalScale({...scaleObject, domain: ['a', 'b']}).distance).toBe(25);
  });

  test('derives domains, scales, and value functors from props', () => {
    const data = [{x: 1, x0: 0, y: 2, y0: 0}, {x: 5, x0: 1, y: 6, y0: 2}];

    expect(getDomainByAccessor(data, d => d.x, d => d.x0, 'linear')).toEqual([0, 5]);
    expect(getAttributeScale({xDomain: [0, 10], xRange: [0, 100], xType: 'linear'}, 'x')).toBeTruthy();
    expect(
      getScaleObjectFromProps(
        {
          xDomain: [2, 4],
          xRange: [10, 20],
          xType: 'linear',
          _adjustBy: ['x'],
          _adjustWhat: [0],
          _allData: [data]
        },
        'x'
      )
    ).toMatchObject({
      domain: [0, 6],
      type: 'linear'
    });
    expect(getAttributeFunctor({xDomain: [0, 10], xRange: [0, 100], xType: 'linear'}, 'x')?.(data[0])).toBe(10);
    expect(getAttr0Functor({xDomain: [0, 10], xRange: [0, 100], xType: 'linear'}, 'x')?.(data[0])).toBe(0);
    expect(getAttributeValue({xDomain: [0, 10], xRange: [0, 100], xType: 'linear', _xValue: 7}, 'x')).toBe(7);
  });

  test('extracts missing props and XYPlot fallbacks', () => {
    const data = [{x: 1, y: 2}, {x: 5, y: 6}];
    const props = {xType: 'linear', yType: 'linear'};

    expect(getMissingScaleProps(props, data, ['x', 'y'])).toMatchObject({
      xDomain: [1, 5],
      yDomain: [2, 6],
      getX: expect.any(Function),
      getY: expect.any(Function)
    });
    expect(extractScalePropsFromProps({xDomain: [0, 1], getX: d => d.x}, ['x'])).toMatchObject({
      xDomain: [0, 1],
      getX: expect.any(Function)
    });
    expect(getOptionalScaleProps({xPadding: 10, yDomain: [0, 1]})).toEqual({xPadding: 10});
    expect(getXYPlotValues({colorDomain: [0, 1], colorRange: ['#fff', '#000'], colorType: 'linear'}, [{props: {color: 0.5}}])).toEqual([
      {_colorValue: expect.any(String)}
    ]);
    expect(literalScale('A')('A')).toBe('A');
  });

  test('adjusts domains and handles degenerate/zero cases', () => {
    const scaleObject = {
      type: 'linear',
      domain: [1, 2],
      range: [0, 100],
      distance: 0,
      attr: 'y',
      baseValue: 0,
      isValue: false,
      accessor: d => d.y,
      accessor0: d => d.y0
    } as any;

    expect(_getScaleDistanceAndAdjustedDomain([{y: 2}, {y: 2}], scaleObject)).toMatchObject({
      domain0: expect.any(Number),
      domainN: expect.any(Number),
      distance: expect.any(Number)
    });
    expect(getAttributeScale({xDomain: [5, 5], xRange: [10, 20], xType: 'linear'}, 'x')).not.toBeNull();
  });
});
