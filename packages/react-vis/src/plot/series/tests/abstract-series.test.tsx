import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import AbstractSeries from '../abstract-series';

class TestSeries extends AbstractSeries<any> {
  render() {
    return <g />;
  }
}

const data = [{x: 0, y: 0}, {x: 10, y: 10}];
const props = {
  xRange: [0, 100],
  xDomain: [0, 10],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 10],
  yType: 'linear',
  data,
  marginLeft: 5,
  marginTop: 10
};

function eventAt(clientX: number, clientY: number, type = 'mousemove'): any {
  return {
    nativeEvent: {
      clientX,
      clientY,
      type,
      touches: [{pageX: clientX, pageY: clientY}]
    },
    currentTarget: {
      clientLeft: 0,
      clientTop: 0,
      getBoundingClientRect: () => ({left: 10, top: 20})
    },
    preventDefault: vi.fn()
  };
}

describe('AbstractSeries', () => {
  test('forwards value and series callbacks', () => {
    const value = vi.fn();
    const series = vi.fn();
    const instance = new TestSeries({
      ...props,
      onValueClick: value,
      onSeriesClick: series
    } as any);
    const event = {nativeEvent: {type: 'click'}} as any;

    (instance as any)._valueClickHandler(data[0], event);

    expect(value).toHaveBeenCalledWith(data[0], {event: event.nativeEvent});
    expect(series).toHaveBeenCalledWith({event: event.nativeEvent});
  });

  test('selects the nearest x value and reports its index', () => {
    const onNearestX = vi.fn();
    const instance = new TestSeries({...props, onNearestX} as any);

    (instance as any).onParentMouseMove(eventAt(104, 20));

    expect(onNearestX).toHaveBeenCalledWith(data[1], {
      innerX: 100,
      index: 1,
      event: expect.anything()
    });
  });

  test('selects the nearest xy value and supports touch coordinates', () => {
    const onNearestXY = vi.fn();
    const instance = new TestSeries({...props, onNearestXY} as any);
    const event = eventAt(10, 20, 'touchmove');

    (instance as any).onParentTouchMove(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onNearestXY).toHaveBeenCalledWith(data[1], {
      innerX: 100,
      innerY: 0,
      index: 1,
      event: event.nativeEvent
    });
  });
});
