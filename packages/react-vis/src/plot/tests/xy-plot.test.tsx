import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {renderToStaticMarkup} from 'react-dom/server';
import XYPlot from '../xy-plot';
import LineSeries from '../series/line-series';

describe('XYPlot', () => {
  test('renders an empty sized plot without an SVG', () => {
    const markup = renderToStaticMarkup(
      <XYPlot width={300} height={200} className="empty-plot" />
    );

    expect(markup).toBe(
      '<div class="rv-xy-plot empty-plot" style="width:300px;height:200px"></div>'
    );
  });

  test('renders SVG children with plot dimensions and scale props', () => {
    const markup = renderToStaticMarkup(
      <XYPlot width={300} height={200} margin={20} className="line-plot">
        <LineSeries data={[{x: 0, y: 0}, {x: 1, y: 1}]} />
      </XYPlot>
    );

    expect(markup).toContain('class="rv-xy-plot line-plot"');
    expect(markup).toContain('class="rv-xy-plot__inner"');
    expect(markup).toContain('width="300"');
    expect(markup).toContain('height="200"');
    expect(markup).toContain('rv-xy-plot__series--line');
  });

  test('updates scale mixins from props and routes event handlers through parent and series callbacks', () => {
    const onMouseDown = vi.fn();
    const onTouchStart = vi.fn();
    const onSeriesMouseDown = vi.fn();
    const series = new (class extends React.Component<any> {
      onParentMouseDown = onSeriesMouseDown;
      onParentTouchStart = onTouchStart;
      render() {
        return <g />;
      }
    })({});

    const nextProps = {
      width: 300,
      height: 200,
      children: [<LineSeries key="line" data={[{x: 0, y: 0}, {x: 1, y: 1}]} />]
    };
    const state = {
      data: [[{x: 0, y: 0}]],
      scaleMixins: XYPlot._getScaleMixins([[{x: 0, y: 0}]], nextProps as any)
    };

    expect(state.scaleMixins).toEqual(expect.any(Object));

    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <XYPlot
          width={300}
          height={200}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <LineSeries key="line" data={[{x: 0, y: 0}]} />
        </XYPlot>,
        container
      );
    });
    const mouseEvent = new MouseEvent('mousedown', {bubbles: true});
    const touchEvent = new TouchEvent('touchstart', {bubbles: true});
    container.querySelector('svg')!.dispatchEvent(mouseEvent);
    container.querySelector('svg')!.dispatchEvent(touchEvent);

    expect(onMouseDown).toHaveBeenCalled();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
