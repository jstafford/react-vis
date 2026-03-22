import React from 'react';
import PropTypes from 'prop-types';
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyLeft,
  sankeyRight,
  sankeyCenter,
  sankeyJustify
} from 'd3-sankey';

import XYPlot from 'plot/xy-plot';
import VerticalRectSeries from 'plot/series/vertical-rect-series';
import LabelSeries from 'plot/series/label-series';
import Voronoi from 'plot/voronoi';
import {AnimationParam} from 'animation';
import {Margin, MarginPropType, getInnerDimensions} from 'utils/chart-utils';
import {getCombinedClassName} from 'utils/styling-utils';
import {DISCRETE_COLOR_RANGE} from 'theme';

import SankeyLink from './sankey-link';

const NOOP = (..._args: any[]) => undefined;

const ALIGNMENTS = {
  justify: sankeyJustify,
  center: sankeyCenter,
  left: sankeyLeft,
  right: sankeyRight
};

const DEFAULT_MARGINS: Required<Margin> = {
  top: 20,
  left: 20,
  right: 20,
  bottom: 20
};

const DEFAULT_STYLE = {
  links: {},
  rects: {},
  labels: {}
};

export type SankeyAlignment = keyof typeof ALIGNMENTS;

export interface SankeyNode {
  name?: string;
  color?: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  sourceLinks?: any[] | null;
  targetLinks?: any[] | null;
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any;
}

export interface SankeyGraphLink {
  source: number | SankeyNode;
  target: number | SankeyNode;
  value?: number;
  color?: string;
  opacity?: number;
  width?: number;
  index?: number;
  y0?: number;
  y1?: number;
  [key: string]: any;
}

interface SankeyStyle {
  links?: React.CSSProperties;
  rects?: React.CSSProperties;
  labels?: React.CSSProperties;
}

export interface SankeyProps {
  align?: SankeyAlignment;
  animation?: AnimationParam;
  children?: React.ReactNode;
  className?: string;
  hasVoronoi?: boolean;
  height: number;
  hideLabels?: boolean;
  labelRotation?: number;
  layout?: number;
  links: SankeyGraphLink[];
  linkOpacity?: number;
  margin?: Margin;
  nodePadding?: number;
  nodes: SankeyNode[];
  nodeWidth?: number;
  onValueClick?: (node: SankeyNode, event?: React.SyntheticEvent<any>) => void;
  onValueMouseOver?: (node: SankeyNode, event?: React.SyntheticEvent<any>) => void;
  onValueMouseOut?: (node: SankeyNode, event?: React.SyntheticEvent<any>) => void;
  onLinkClick?: (link: SankeyGraphLink, event?: React.SyntheticEvent<any>) => void;
  onLinkMouseOver?: (link: SankeyGraphLink, event?: React.SyntheticEvent<any>) => void;
  onLinkMouseOut?: (link: SankeyGraphLink, event?: React.SyntheticEvent<any>) => void;
  style?: SankeyStyle;
  width: number;
  [key: string]: any;
}

function Sankey(props: SankeyProps): JSX.Element {
  const {
    align = 'justify',
    animation,
    children,
    className = '',
    hasVoronoi = false,
    height,
    hideLabels = false,
    labelRotation = 0,
    layout = 50,
    links,
    linkOpacity,
    margin = DEFAULT_MARGINS,
    nodePadding = 10,
    nodes,
    nodeWidth = 10,
    onValueClick = NOOP,
    onValueMouseOver = NOOP,
    onValueMouseOut = NOOP,
    onLinkClick = NOOP,
    onLinkMouseOver = NOOP,
    onLinkMouseOut = NOOP,
    style: sankeyStyle = DEFAULT_STYLE,
    width
  } = props;
  const {style: _ignoredStyle, ...xyPlotProps} = props;

  if (nodes.length === 0) {
    return (
      <XYPlot
        {...xyPlotProps}
        yType="literal"
        className={getCombinedClassName('rv-sankey', className)}
      />
    );
  }

  const nodesCopy = nodes.map(node => ({...node}));
  const linksCopy = links.map(link => ({...link}));

  const {marginLeft, marginTop, marginRight, marginBottom} = getInnerDimensions(
    {
      margin,
      height,
      width
    },
    DEFAULT_MARGINS
  );

  const sankeyInstance = (sankey() as any)
    .extent([
      [marginLeft, marginTop],
      [width - marginRight, height - marginBottom - marginTop]
    ])
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .nodes(nodesCopy)
    .links(linksCopy)
    .nodeAlign(ALIGNMENTS[align])
    .iterations(layout);
  sankeyInstance(nodesCopy);

  const nWidth = sankeyInstance.nodeWidth() as number;
  const path = sankeyLinkHorizontal();

  return (
    <XYPlot
      {...xyPlotProps}
      yType="literal"
      className={getCombinedClassName('rv-sankey', className)}
    >
      {linksCopy.map((link, index) => (
        <SankeyLink
          style={sankeyStyle.links}
          data={(path(link as any) as string | null) || ''}
          opacity={link.opacity || linkOpacity}
          color={link.color}
          onLinkClick={onLinkClick}
          onLinkMouseOver={onLinkMouseOver}
          onLinkMouseOut={onLinkMouseOut}
          strokeWidth={Math.max(link.width || 0, 1)}
          node={link}
          nWidth={nWidth}
          key={`link-${index}`}
        />
      ))}
      <VerticalRectSeries
        animation={animation}
        className={getCombinedClassName(className, 'rv-sankey__node')}
        data={nodesCopy.map(node => ({
          ...node,
          y: (node.y1 || 0) - marginTop,
          y0: (node.y0 || 0) - marginTop,
          x: node.x1 || 0,
          x0: node.x0 || 0,
          color: node.color || DISCRETE_COLOR_RANGE[0],
          sourceLinks: null,
          targetLinks: null
        }))}
        style={sankeyStyle.rects}
        onValueClick={onValueClick as any}
        onValueMouseOver={onValueMouseOver as any}
        onValueMouseOut={onValueMouseOut as any}
        colorType="literal"
      />
      {!hideLabels && (
        <LabelSeries
          animation={animation}
          className={className}
          rotation={labelRotation}
          labelAnchorY="text-before-edge"
          data={nodesCopy.map((node, index) => ({
            x: (node.x0 || 0) + ((node.x0 || 0) < width / 2 ? nWidth + 10 : -10),
            y: ((node.y0 || 0) + (node.y1 || 0)) / 2 - marginTop,
            label: node.name,
            style: {
              textAnchor: (node.x0 || 0) < width / 2 ? 'start' : 'end',
              dy: '-.5em',
              ...sankeyStyle.labels
            },
            ...nodes[index]
          }))}
        />
      )}
      {hasVoronoi && (
        <Voronoi
          className="rv-sankey__voronoi"
          extent={[
            [-marginLeft, -marginTop],
            [width + marginRight, height + marginBottom]
          ]}
          nodes={nodesCopy}
          onClick={onValueClick}
          onHover={onValueMouseOver}
          onBlur={onValueMouseOut}
          x={(datum: SankeyNode) => (datum.x0 || 0) + ((datum.x1 || 0) - (datum.x0 || 0)) / 2}
          y={(datum: SankeyNode) => (datum.y0 || 0) + ((datum.y1 || 0) - (datum.y0 || 0)) / 2}
        />
      )}
      {children}
    </XYPlot>
  );
}

(Sankey as any).defaultProps = {
  align: 'justify',
  className: '',
  hasVoronoi: false,
  hideLabels: false,
  labelRotation: 0,
  layout: 50,
  margin: DEFAULT_MARGINS,
  nodePadding: 10,
  nodeWidth: 10,
  onValueMouseOver: NOOP,
  onValueClick: NOOP,
  onValueMouseOut: NOOP,
  onLinkClick: NOOP,
  onLinkMouseOver: NOOP,
  onLinkMouseOut: NOOP,
  style: DEFAULT_STYLE
};

(Sankey as any).propTypes = {
  align: PropTypes.oneOf(['justify', 'left', 'right', 'center']),
  className: PropTypes.string,
  hasVoronoi: PropTypes.bool,
  height: PropTypes.number.isRequired,
  hideLabels: PropTypes.bool,
  labelRotation: PropTypes.number,
  layout: PropTypes.number,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
      target: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired
    })
  ).isRequired,
  margin: MarginPropType,
  nodePadding: PropTypes.number,
  nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
  nodeWidth: PropTypes.number,
  onValueMouseOver: PropTypes.func,
  onValueClick: PropTypes.func,
  onValueMouseOut: PropTypes.func,
  onLinkClick: PropTypes.func,
  onLinkMouseOver: PropTypes.func,
  onLinkMouseOut: PropTypes.func,
  style: PropTypes.shape({
    links: PropTypes.object,
    rects: PropTypes.object,
    labels: PropTypes.object
  }),
  width: PropTypes.number.isRequired
};

export default Sankey;