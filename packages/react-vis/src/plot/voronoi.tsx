import React from 'react';
import PropTypes from 'prop-types';
import {voronoi} from 'd3-voronoi';

import {getAttributeFunctor} from 'utils/scales-utils';
import {getCombinedClassName} from 'utils/styling-utils';

const NOOP = (f: any) => f;

interface VoronoiProps {
  className?: string;
  extent?: number[][];
  nodes: {[key: string]: any}[];
  onBlur?: (data: any) => void;
  onClick?: (data: any) => void;
  onMouseUp?: (data: any) => void;
  onMouseDown?: (data: any) => void;
  onHover?: (data: any) => void;
  polygonStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  x?: (d: any) => number;
  y?: (d: any) => number;
  innerWidth?: number;
  innerHeight?: number;
  marginLeft?: number;
  marginTop?: number;
  [key: string]: any;
}

function getNodeIndex(evt: React.TouchEvent<SVGElement>) {
  const {
    nativeEvent: {pageX, pageY}
  } = evt as any;
  const target = document.elementFromPoint(pageX, pageY);
  if (!target) {
    return -1;
  }
  const {parentNode} = target;
  if (!parentNode) {
    return -1;
  }
  return Array.prototype.indexOf.call(parentNode.childNodes, target);
}

function getExtent({innerWidth, innerHeight, marginLeft, marginTop}: VoronoiProps) {
  return [
    [marginLeft || 0, marginTop || 0],
    [(innerWidth || 0) + (marginLeft || 0), (innerHeight || 0) + (marginTop || 0)]
  ] as [[number, number], [number, number]];
}

function Voronoi(props: VoronoiProps) {
  const {
    className,
    extent,
    nodes,
    onBlur = NOOP,
    onClick = NOOP,
    onMouseUp = NOOP,
    onMouseDown = NOOP,
    onHover = NOOP,
    polygonStyle,
    style,
    x,
    y
  } = props;

  const xAccessor = (x || getAttributeFunctor(props, 'x')) as (d: any) => number;
  const yAccessor = (y || getAttributeFunctor(props, 'y')) as (d: any) => number;

  const resolvedExtent =
    (extent as [[number, number], [number, number]] | undefined) ||
    getExtent(props);

  const voronoiInstance = voronoi<any>()
    .x(xAccessor)
    .y(yAccessor)
    .extent(resolvedExtent);

  const polygons = voronoiInstance.polygons(nodes as any) as any[];

  const handleTouchEvent =
    (handler: (data: any) => void) =>
    (evt: React.TouchEvent<SVGElement>) => {
      evt.preventDefault();
      const index = getNodeIndex(evt);
      if (index > -1 && index < polygons.length) {
        const d = polygons[index];
        handler(d.data);
      }
    };

  return (
    <g
      className={getCombinedClassName(className, 'rv-voronoi')}
      style={style}
      onTouchEnd={handleTouchEvent(onMouseUp)}
      onTouchStart={handleTouchEvent(onMouseDown)}
      onTouchMove={handleTouchEvent(onHover)}
      onTouchCancel={handleTouchEvent(onBlur)}
    >
      {polygons.map((d, i) => (
        <path
          className={`rv-voronoi__cell ${(d.data && d.data.className) || ''}`}
          d={`M${d.join('L')}Z`}
          onClick={() => onClick(d.data)}
          onMouseUp={() => onMouseUp(d.data)}
          onMouseDown={() => onMouseDown(d.data)}
          onMouseOver={() => onHover(d.data)}
          onMouseOut={() => onBlur(d.data)}
          fill="none"
          style={{
            pointerEvents: 'all',
            ...polygonStyle,
            ...(d.data && d.data.style)
          }}
          key={i}
        />
      ))}
    </g>
  );
}

(Voronoi as any).requiresSVG = true;
(Voronoi as any).displayName = 'Voronoi';
(Voronoi as any).defaultProps = {
  className: '',
  onBlur: NOOP,
  onClick: NOOP,
  onHover: NOOP,
  onMouseDown: NOOP,
  onMouseUp: NOOP
};

(Voronoi as any).propTypes = {
  className: PropTypes.string,
  extent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  onHover: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  x: PropTypes.func,
  y: PropTypes.func
};

export default Voronoi;
