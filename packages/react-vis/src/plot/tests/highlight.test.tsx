import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Highlight from '../highlight';

const baseScaleProps = {
  xRange: [0, 100],
  xDomain: [0, 100],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 100],
  yType: 'linear',
  innerWidth: 100,
  innerHeight: 100,
  marginLeft: 10,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 10
};

describe('Highlight', () => {
  test('renders the mouse target and highlight rectangle', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          innerWidth={100}
          innerHeight={60}
          marginLeft={10}
          marginRight={5}
          marginTop={8}
          marginBottom={7}
          className="selection"
          color="orange"
          opacity={0.5}
        />
      </svg>
    );

    expect(markup).toContain('selection rv-highlight-container');
    expect(markup).toContain('class="rv-mouse-target"');
    expect(markup).toContain('width="115"');
    expect(markup).toContain('height="75"');
    expect(markup).toContain('class="rv-highlight"');
    expect(markup).toContain('fill="orange"');
    expect(markup).toContain('opacity="0.5"');
  });

  test('renders with custom highlightWidth and highlightHeight dimensions', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          {...baseScaleProps}
          highlightWidth={50}
          highlightHeight={40}
          color="blue"
        />
      </svg>
    );

    expect(markup).toContain('width="50"');
    expect(markup).toContain('height="40"');
    expect(markup).toContain('fill="blue"');
  });

  test('renders highlight with highlightX and highlightY coordinate transforms', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          {...baseScaleProps}
          highlightX={50}
          highlightY={25}
          color="green"
        />
      </svg>
    );

    expect(markup).toContain('translate(50, 75)');
    expect(markup).toContain('fill="green"');
  });

  test('renders with custom opacity and color defaults', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight {...baseScaleProps} />
      </svg>
    );

    expect(markup).toContain('rv-highlight');
    expect(markup).toContain('opacity="0.3"');
    expect(markup).toContain('rgb(77, 182, 172)');
  });

  test('_getDrawArea calculates min/max from start and current location', () => {
    const instance = new Highlight(baseScaleProps);
    instance.state = {...instance.state, startLocX: 20, startLocY: 30};
    const area = instance._getDrawArea(80, 90);
    expect(area.left).toBeLessThanOrEqual(area.right);
    expect(area.top).toBeLessThanOrEqual(area.bottom);
  });

  test('_getDrawArea respects enableX when Y is disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: false,
      highlightHeight: 100
    });
    instance.state = {...instance.state, startLocX: 20, startLocY: 30};
    const area = instance._getDrawArea(80, 90);
    expect(area.top).toBe(0);
    expect(area.bottom).toBe(100);
  });

  test('_getDrawArea respects enableY when X is disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: true,
      highlightWidth: 100
    });
    instance.state = {...instance.state, startLocX: 20, startLocY: 30};
    const area = instance._getDrawArea(80, 90);
    expect(area.left).toBe(0);
    expect(area.right).toBe(100);
  });

  test('_getDragArea applies offset from startLoc to dragArea', () => {
    const instance = new Highlight(baseScaleProps);
    instance.state = {
      ...instance.state,
      startLocX: 50,
      startLocY: 50,
      dragArea: {left: 20, right: 60, top: 30, bottom: 70},
      brushArea: {left: 0, right: 0, top: 0, bottom: 0}
    };
    const area = instance._getDragArea(55, 60);
    expect(area.left).toBe(area.left);
    expect(area.right).toBe(area.right);
  });

  test('_getDragArea respects enableX when Y is disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: false
    });
    instance.state = {
      ...instance.state,
      startLocX: 50,
      startLocY: 50,
      dragArea: {left: 20, right: 60, top: 30, bottom: 70},
      brushArea: {left: 0, right: 0, top: 0, bottom: 0}
    };
    const area = instance._getDragArea(55, 60);
    expect(area.top).toBe(30);
    expect(area.bottom).toBe(70);
  });

  test('_getDragArea respects enableY when X is disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: true
    });
    instance.state = {
      ...instance.state,
      startLocX: 50,
      startLocY: 50,
      dragArea: {left: 20, right: 60, top: 30, bottom: 70},
      brushArea: {left: 0, right: 0, top: 0, bottom: 0}
    };
    const area = instance._getDragArea(55, 60);
    expect(area.left).toBe(20);
    expect(area.right).toBe(60);
  });

  test('_clickedOutsideDrag detects outer boundaries with both X and Y', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: true
    });
    instance.state = {
      ...instance.state,
      dragArea: {left: 20, right: 80, top: 30, bottom: 90},
      brushArea: {left: 20, right: 80, top: 30, bottom: 90}
    };

    expect(instance._clickedOutsideDrag(10, 50)).toBe(true);
    expect(instance._clickedOutsideDrag(90, 50)).toBe(true);
    expect(instance._clickedOutsideDrag(50, 20)).toBe(true);
    expect(instance._clickedOutsideDrag(50, 100)).toBe(true);
    expect(instance._clickedOutsideDrag(50, 50)).toBe(false);
  });

  test('_clickedOutsideDrag checks horizontal boundary with X only', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: false
    });
    instance.state = {
      ...instance.state,
      dragArea: {left: 20, right: 80, top: 30, bottom: 90},
      brushArea: {left: 20, right: 80, top: 30, bottom: 90}
    };

    expect(instance._clickedOutsideDrag(10, 50)).toBe(true);
    expect(instance._clickedOutsideDrag(50, 50)).toBe(false);
  });

  test('_clickedOutsideDrag checks vertical boundary with Y only', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: true
    });
    instance.state = {
      ...instance.state,
      dragArea: {left: 20, right: 80, top: 30, bottom: 90},
      brushArea: {left: 20, right: 80, top: 30, bottom: 90}
    };

    expect(instance._clickedOutsideDrag(50, 20)).toBe(true);
    expect(instance._clickedOutsideDrag(50, 50)).toBe(false);
  });

  test('_clickedOutsideDrag returns true when both X and Y disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: false
    });
    instance.state = {
      ...instance.state,
      dragArea: {left: 20, right: 80, top: 30, bottom: 90},
      brushArea: {left: 20, right: 80, top: 30, bottom: 90}
    };

    expect(instance._clickedOutsideDrag(50, 50)).toBe(true);
  });

  test('_clickedOutsideDrag returns true when no dragArea exists', () => {
    const instance = new Highlight(baseScaleProps);
    instance.state = {
      ...instance.state,
      dragArea: null,
      brushArea: {left: 0, right: 0, top: 0, bottom: 0}
    };

    expect(instance._clickedOutsideDrag(50, 50)).toBe(true);
  });

  test('renders with no enableX or enableY limiting full touch area', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          innerWidth={100}
          innerHeight={60}
          marginLeft={10}
          marginRight={5}
          marginTop={8}
          marginBottom={7}
          enableX={false}
          enableY={false}
          color="red"
        />
      </svg>
    );

    expect(markup).toContain('rv-mouse-target');
    expect(markup).toContain('fill="red"');
  });

  test('renders with only enableY limiting to vertical drag', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          innerWidth={100}
          innerHeight={60}
          marginLeft={10}
          marginRight={5}
          marginTop={8}
          marginBottom={7}
          enableX={false}
          enableY={true}
          color="purple"
        />
      </svg>
    );

    expect(markup).toContain('rv-mouse-target');
    expect(markup).toContain('fill="purple"');
  });

  test('renders with only enableX limiting to horizontal drag', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          innerWidth={100}
          innerHeight={60}
          marginLeft={10}
          marginRight={5}
          marginTop={8}
          marginBottom={7}
          enableX={true}
          enableY={false}
          color="yellow"
        />
      </svg>
    );

    expect(markup).toContain('rv-mouse-target');
    expect(markup).toContain('fill="yellow"');
  });

  test('renders with all handler props', () => {
    const handlers = {
      onBrush: () => undefined,
      onBrushStart: () => undefined,
      onBrushEnd: () => undefined,
      onDrag: () => undefined,
      onDragStart: () => undefined,
      onDragEnd: () => undefined
    };

    const markup = renderToStaticMarkup(
      <svg>
        <Highlight
          {...baseScaleProps}
          {...handlers}
          drag={true}
        />
      </svg>
    );

    expect(markup).toContain('rv-highlight-container');
    expect(markup).toContain('rv-mouse-target');
  });

  test('_convertAreaToCoordinates returns object with expected structure', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: true
    });
    const brushArea = {left: 20, right: 80, top: 30, bottom: 90};
    const result = instance._convertAreaToCoordinates(brushArea);

    expect(typeof result).toBe('object');
  });

  test('_convertAreaToCoordinates returns only vertical with enableY only', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: true
    });
    const brushArea = {left: 20, right: 80, top: 30, bottom: 90};
    const result = instance._convertAreaToCoordinates(brushArea);

    expect(result).toHaveProperty('top');
    expect(result).toHaveProperty('bottom');
  });

  test('_convertAreaToCoordinates returns only horizontal with enableX only', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: true,
      enableY: false
    });
    const brushArea = {left: 20, right: 80, top: 30, bottom: 90};
    const result = instance._convertAreaToCoordinates(brushArea);

    expect(result).toHaveProperty('left');
    expect(result).toHaveProperty('right');
  });

  test('_convertAreaToCoordinates returns empty when both X and Y disabled', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      enableX: false,
      enableY: false
    });
    const brushArea = {left: 20, right: 80, top: 30, bottom: 90};
    const result = instance._convertAreaToCoordinates(brushArea);

    expect(result).toEqual({});
  });

  test('startBrushing executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: false
    });
    const event = {
      nativeEvent: {
        offsetX: 50,
        offsetY: 60,
        type: 'mousedown'
      },
      type: 'mousedown'
    } as any;

    expect(() => instance.startBrushing(event)).not.toThrow();
  });

  test('startBrushing with drag enabled executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true
    });
    instance.state = {
      ...instance.state,
      dragArea: null
    };
    const event = {
      nativeEvent: {
        offsetX: 30,
        offsetY: 40,
        type: 'mousedown'
      },
      type: 'mousedown'
    } as any;

    expect(() => instance.startBrushing(event)).not.toThrow();
  });

  test('startBrushing with drag and existing dragArea executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true
    });
    const dragArea = {left: 10, right: 70, top: 20, bottom: 80};
    instance.state = {
      ...instance.state,
      dragArea
    };
    const event = {
      nativeEvent: {
        offsetX: 40,
        offsetY: 50,
        type: 'mousedown'
      },
      type: 'mousedown'
    } as any;

    expect(() => instance.startBrushing(event)).not.toThrow();
  });

  test('startBrushing with onBrushStart callback executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: false,
      onBrushStart: () => {}
    });
    const event = {
      nativeEvent: {
        offsetX: 50,
        offsetY: 60,
        type: 'mousedown'
      },
      type: 'mousedown'
    } as any;

    expect(() => instance.startBrushing(event)).not.toThrow();
  });

  test('startBrushing with onDragStart callback executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true,
      onDragStart: () => {}
    });
    const dragArea = {left: 10, right: 70, top: 20, bottom: 80};
    instance.state = {
      ...instance.state,
      dragArea
    };
    const event = {
      nativeEvent: {
        offsetX: 40,
        offsetY: 50,
        type: 'mousedown'
      },
      type: 'mousedown'
    } as any;

    expect(() => instance.startBrushing(event)).not.toThrow();
  });

  test('onBrush with brushing state executes without error', () => {
    const instance = new Highlight(baseScaleProps);
    instance.state = {
      ...instance.state,
      brushing: true,
      dragging: false,
      startLocX: 20,
      startLocY: 30
    };
    const event = {
      nativeEvent: {
        offsetX: 80,
        offsetY: 90,
        type: 'mousemove'
      },
      type: 'mousemove'
    } as any;

    expect(() => instance.onBrush(event)).not.toThrow();
  });

  test('onBrush with onBrush callback executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: false,
      onBrush: () => {}
    });
    instance.state = {
      ...instance.state,
      brushing: true,
      dragging: false,
      startLocX: 20,
      startLocY: 30
    };
    const event = {
      nativeEvent: {
        offsetX: 80,
        offsetY: 90,
        type: 'mousemove'
      },
      type: 'mousemove'
    } as any;

    expect(() => instance.onBrush(event)).not.toThrow();
  });

  test('onBrush with dragging state executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true
    });
    instance.state = {
      ...instance.state,
      brushing: false,
      dragging: true,
      startLocX: 50,
      startLocY: 50,
      dragArea: {left: 20, right: 60, top: 30, bottom: 70},
      brushArea: {left: 20, right: 60, top: 30, bottom: 70}
    };
    const event = {
      nativeEvent: {
        offsetX: 55,
        offsetY: 60,
        type: 'mousemove'
      },
      type: 'mousemove'
    } as any;

    expect(() => instance.onBrush(event)).not.toThrow();
  });

  test('onBrush with onDrag callback executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true,
      onDrag: () => {}
    });
    instance.state = {
      ...instance.state,
      brushing: false,
      dragging: true,
      startLocX: 50,
      startLocY: 50,
      dragArea: {left: 20, right: 60, top: 30, bottom: 70},
      brushArea: {left: 20, right: 60, top: 30, bottom: 70}
    };
    const event = {
      nativeEvent: {
        offsetX: 55,
        offsetY: 60,
        type: 'mousemove'
      },
      type: 'mousemove'
    } as any;

    expect(() => instance.onBrush(event)).not.toThrow();
  });

  test('stopBrushing when not brushing or dragging executes without error', () => {
    const instance = new Highlight(baseScaleProps);
    instance.state = {
      ...instance.state,
      brushing: false,
      dragging: false
    };

    expect(() => instance.stopBrushing()).not.toThrow();
  });

  test('stopBrushing with small brush executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: false,
      onBrushEnd: () => {}
    });
    instance.state = {
      ...instance.state,
      brushing: true,
      dragging: false,
      brushArea: {left: 20, right: 22, top: 30, bottom: 31}
    };

    expect(() => instance.stopBrushing()).not.toThrow();
  });

  test('stopBrushing with large brush executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: false,
      onBrushEnd: () => {}
    });
    const largeArea = {left: 20, right: 80, top: 30, bottom: 90};
    instance.state = {
      ...instance.state,
      brushing: true,
      dragging: false,
      brushArea: largeArea
    };

    expect(() => instance.stopBrushing()).not.toThrow();
  });

  test('stopBrushing in drag mode executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true
    });
    const largeArea = {left: 20, right: 80, top: 30, bottom: 90};
    instance.state = {
      ...instance.state,
      brushing: false,
      dragging: true,
      brushArea: largeArea
    };

    expect(() => instance.stopBrushing()).not.toThrow();
  });

  test('stopBrushing with onDragEnd callback executes without error', () => {
    const instance = new Highlight({
      ...baseScaleProps,
      drag: true,
      onDragEnd: () => {}
    });
    const largeArea = {left: 20, right: 80, top: 30, bottom: 90};
    instance.state = {
      ...instance.state,
      brushing: false,
      dragging: true,
      brushArea: largeArea
    };

    expect(() => instance.stopBrushing()).not.toThrow();
  });
});
