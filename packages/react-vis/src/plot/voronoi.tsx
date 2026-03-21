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
  return Array.prototype.indexOf.call(parentNode.childNodes, target);
}

function getExtent({innerWidth, innerHeight, marginLeft, marginTop}: VoronoiProps) {
  return [
    [marginLeft, marginTop],
    [innerWidth + marginLeft, innerHeight + marginTop]
  ];
}

function Voronoi(props: VoronoiProps) {
  const {
    className,
    extent,
    nodes,
    onBlur,
    onClick,
    onMouseUp,
    onMouseDown,
    onHover,
    polygonStyle,
    style,
    x,
    y
  } = props;

  const voronoiInstance = voronoi()
    .x(x || getAttributeFunctor(props, 'x'))
    .y(y || getAttributeFunctor(props, 'y'))
    .extent(extent || getExtent(props));

  const polygons = voronoiInstance.polygons(nodes);

  const handleTouchEvent = (handler: (data: any) => void) => (evt: React.TouchEvent<SVGElement>) => {
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

Voronoi.requiresSVG = true;
Voronoi.displayName = 'Voronoi';
Voronoi.defaultProps = {
  className: '',
  onBlur: NOOP,
  onClick: NOOP,
  onHover: NOOP,
  onMouseDown: NOOP,
  onMouseUp: NOOP
};

Voronoi.propTypes = {
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
