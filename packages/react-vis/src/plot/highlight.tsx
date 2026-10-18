import React, {useState} from 'react';

import {AbstractSeriesProps} from './series/abstract-series';
import {getAttributeScale} from 'utils/scales-utils';
import {getCombinedClassName} from 'utils/styling-utils';

interface BrushArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface HighlightState {
  dragging: boolean;
  brushArea: BrushArea;
  brushing: boolean;
  startLocX: number;
  startLocY: number;
  dragArea: BrushArea | null;
}

interface HighlightProps extends AbstractSeriesProps<any> {
  enableX?: boolean;
  enableY?: boolean;
  drag?: boolean;
  color?: string;
  opacity?: number;
  highlightHeight?: number;
  highlightWidth?: number;
  highlightX?: number;
  highlightY?: number;
  innerWidth?: number;
  innerHeight?: number;
  marginRight?: number;
  marginBottom?: number;
  onBrush?: (area: HighlightCoordinates) => void;
  onBrushStart?: (event: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) => void;
  onBrushEnd?: (area: HighlightCoordinates | null) => void;
  onDrag?: (area: HighlightCoordinates) => void;
  onDragStart?: (event: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) => void;
  onDragEnd?: (area: HighlightCoordinates | null) => void;
}

type HighlightCoordinates = Partial<
  Record<'left' | 'right' | 'top' | 'bottom', number>
>;

function getLocs(evt: any) {
  const xLoc = evt.type === 'touchstart' ? evt.pageX : evt.offsetX;
  const yLoc = evt.type === 'touchstart' ? evt.pageY : evt.offsetY;
  return {xLoc, yLoc};
}

export function Highlight(props: HighlightProps): JSX.Element {
  const [state, setState] = useState<HighlightState>({
    dragging: false,
    brushArea: {top: 0, right: 0, bottom: 0, left: 0},
    brushing: false,
    startLocX: 0,
    startLocY: 0,
    dragArea: null
  });

  function getDrawArea(xLoc: number, yLoc: number) {
    const {startLocX, startLocY} = state;
    const {
      enableX,
      enableY,
      highlightWidth,
      highlightHeight,
      innerWidth = 0,
      innerHeight = 0,
      marginLeft = 0,
      marginRight = 0,
      marginBottom = 0,
      marginTop = 0
    } = props;
    const plotHeight = innerHeight + marginTop + marginBottom;
    const plotWidth = innerWidth + marginLeft + marginRight;
    const touchWidth = highlightWidth || plotWidth;
    const touchHeight = highlightHeight || plotHeight;

    return {
      bottom: enableY ? Math.max(startLocY, yLoc) : touchHeight,
      right: enableX ? Math.max(startLocX, xLoc) : touchWidth,
      left: enableX ? Math.min(xLoc, startLocX) : 0,
      top: enableY ? Math.min(yLoc, startLocY) : 0
    };
  }

  function getDragArea(xLoc: number, yLoc: number) {
    const {enableX, enableY} = props;
    const {startLocX, startLocY, dragArea, brushArea} = state;
    const area = dragArea || brushArea;

    return {
      bottom: area.bottom + (enableY ? yLoc - startLocY : 0),
      left: area.left + (enableX ? xLoc - startLocX : 0),
      right: area.right + (enableX ? xLoc - startLocX : 0),
      top: area.top + (enableY ? yLoc - startLocY : 0)
    };
  }

  function clickedOutsideDrag(xLoc: number, yLoc: number) {
    const {enableX, enableY} = props;
    const {
      dragArea,
      brushArea: {left, right, top, bottom}
    } = state;
    const clickedOutsideDragX = dragArea && (xLoc < left || xLoc > right);
    const clickedOutsideDragY = dragArea && (yLoc < top || yLoc > bottom);
    if (enableX && enableY) {
      return clickedOutsideDragX || clickedOutsideDragY;
    }
    if (enableX) {
      return clickedOutsideDragX;
    }
    if (enableY) {
      return clickedOutsideDragY;
    }
    return true;
  }

  function convertAreaToCoordinates(brushArea: BrushArea): HighlightCoordinates {
    const {enableX, enableY, marginLeft = 0, marginTop = 0} = props;
    const xScale = getAttributeScale(props, 'x') as any;
    const yScale = getAttributeScale(props, 'y') as any;

    if (enableX && enableY) {
      return {
        bottom: yScale.invert(brushArea.bottom),
        left: xScale.invert(brushArea.left - marginLeft),
        right: xScale.invert(brushArea.right - marginLeft),
        top: yScale.invert(brushArea.top)
      };
    }

    if (enableY) {
      return {
        bottom: yScale.invert(brushArea.bottom - marginTop),
        top: yScale.invert(brushArea.top - marginTop)
      };
    }

    if (enableX) {
      return {
        left: xScale.invert(brushArea.left - marginLeft),
        right: xScale.invert(brushArea.right - marginLeft)
      };
    }

    return {};
  }

  function startBrushing(e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) {
    const {onBrushStart, onDragStart, drag} = props;
    const {dragArea} = state;
    const {xLoc, yLoc} = getLocs((e as any).nativeEvent);

    const startArea = (dragging: boolean, resetDrag: any) => {
      const emptyBrush = {
        bottom: yLoc,
        left: xLoc,
        right: xLoc,
        top: yLoc
      };
      setState(previous => ({
        ...previous,
        dragging,
        brushArea: dragArea && !resetDrag ? dragArea : emptyBrush,
        brushing: !dragging,
        startLocX: xLoc,
        startLocY: yLoc
      }));
    };

    const outsideDrag = clickedOutsideDrag(xLoc, yLoc);
    if ((drag && !dragArea) || !drag || outsideDrag) {
      startArea(false, outsideDrag);

      if (onBrushStart) {
        onBrushStart(e);
      }
      return;
    }

    if (drag && dragArea) {
      startArea(true, outsideDrag);
      if (onDragStart) {
        onDragStart(e);
      }
    }
  }

  function stopBrushing() {
    const {brushing, dragging, brushArea} = state;
    if (!brushing && !dragging) {
      return;
    }
    const {onBrushEnd, onDragEnd, drag} = props;
    const noHorizontal = Math.abs(brushArea.right - brushArea.left) < 5;
    const noVertical = Math.abs(brushArea.top - brushArea.bottom) < 5;
    const isNulled = noVertical || noHorizontal;
    setState({
      brushing: false,
      dragging: false,
      brushArea: drag ? brushArea : {top: 0, right: 0, bottom: 0, left: 0},
      startLocX: 0,
      startLocY: 0,
      dragArea: drag && !isNulled ? brushArea : null
    });

    if (brushing && onBrushEnd) {
      onBrushEnd(!isNulled ? convertAreaToCoordinates(brushArea) : null);
    }

    if (drag && onDragEnd) {
      onDragEnd(!isNulled ? convertAreaToCoordinates(brushArea) : null);
    }
  }

  function onBrush(e: React.MouseEvent<SVGElement>) {
    const {onBrush, onDrag, drag} = props;
    const {brushing, dragging} = state;
    const {xLoc, yLoc} = getLocs((e as any).nativeEvent);
    if (brushing) {
      const brushArea = getDrawArea(xLoc, yLoc);
      setState(previous => ({...previous, brushArea}));

      if (onBrush) {
        onBrush(convertAreaToCoordinates(brushArea));
      }
    }

    if (drag && dragging) {
      const brushArea = getDragArea(xLoc, yLoc);
      setState(previous => ({...previous, brushArea}));
      if (onDrag) {
        onDrag(convertAreaToCoordinates(brushArea));
      }
    }
  }

    const {
      color,
      className,
      highlightHeight,
      highlightWidth,
      highlightX,
      highlightY,
      innerWidth = 0,
      innerHeight = 0,
      marginLeft = 0,
      marginRight = 0,
      marginTop = 0,
      marginBottom = 0,
      opacity
    } = props;
    const {
      brushArea: {left, right, top, bottom}
    } = state;

    let leftPos = 0;
    if (highlightX) {
      const xScale = getAttributeScale(props, 'x') as (value: any) => number;
      leftPos = xScale(highlightX);
    }

    let topPos = 0;
    if (highlightY) {
      const yScale = getAttributeScale(props, 'y') as (value: any) => number;
      topPos = yScale(highlightY);
    }

    const plotWidth = marginLeft + marginRight + innerWidth;
    const plotHeight = marginTop + marginBottom + innerHeight;
    const touchWidth = highlightWidth || plotWidth;
    const touchHeight = highlightHeight || plotHeight;

    return (
      <g
        transform={`translate(${leftPos}, ${topPos})`}
        className={getCombinedClassName(className, 'rv-highlight-container')}
      >
        <rect
          className="rv-mouse-target"
          fill="black"
          opacity="0"
          x="0"
          y="0"
          width={Math.max(touchWidth, 0)}
          height={Math.max(touchHeight, 0)}
          onMouseDown={startBrushing}
          onMouseMove={onBrush}
          onMouseUp={stopBrushing}
          onMouseLeave={stopBrushing}
          onTouchEnd={e => {
            e.preventDefault();
            stopBrushing();
          }}
          onTouchCancel={e => {
            e.preventDefault();
            stopBrushing();
          }}
          onContextMenu={e => e.preventDefault()}
          onContextMenuCapture={e => e.preventDefault()}
        />
        <rect
          className="rv-highlight"
          pointerEvents="none"
          opacity={opacity}
          fill={color}
          x={left}
          y={top}
          width={Math.min(Math.max(0, right - left), touchWidth)}
          height={Math.min(Math.max(0, bottom - top), touchHeight)}
        />
      </g>
    );
}

(Highlight as any).displayName = 'HighlightOverlay';
(Highlight as any).defaultProps = {
  color: 'rgb(77, 182, 172)',
  className: '',
  enableX: true,
  enableY: true,
  opacity: 0.3
};
(Highlight as any).requiresSVG = true;


export default Highlight;
