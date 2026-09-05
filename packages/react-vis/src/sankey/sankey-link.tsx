// Copyright (c) 2016 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';

import {DISCRETE_COLOR_RANGE} from 'theme';
import Animation, {AnimationParam} from 'animation';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';

const DEFAULT_LINK_COLOR = DISCRETE_COLOR_RANGE[1];
const DEFAULT_LINK_OPACITY = 0.7;

export interface SankeyLinkProps {
  animation?: AnimationParam;
  color?: string;
  data: string;
  node: any;
  onLinkClick?: (node: any, event: React.MouseEvent<SVGPathElement>) => void;
  onLinkMouseOver?: (node: any, event: React.MouseEvent<SVGPathElement>) => void;
  onLinkMouseOut?: (node: any, event: React.MouseEvent<SVGPathElement>) => void;
  opacity?: number;
  strokeWidth: number;
  style?: React.SVGProps<SVGPathElement> | React.CSSProperties;
  [key: string]: any;
}

function SankeyLink(props: SankeyLinkProps): JSX.Element {
  const {
    animation,
    data,
    node,
    opacity,
    color,
    strokeWidth,
    style,
    onLinkClick = () => undefined,
    onLinkMouseOver = () => undefined,
    onLinkMouseOut = () => undefined
  } = props;
  if (animation) {
    return (
      <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
        <SankeyLink {...props} animation={undefined} />
      </Animation>
    );
  }
  return (
    <path
      d={data}
      {...(style)}
      className="rv-sankey__link"
      opacity={Number.isFinite(opacity) ? opacity : DEFAULT_LINK_OPACITY}
      stroke={color || DEFAULT_LINK_COLOR}
      onClick={event => onLinkClick(node, event)}
      onMouseOver={event => onLinkMouseOver(node, event)}
      onMouseOut={event => onLinkMouseOut(node, event)}
      strokeWidth={strokeWidth}
      fill="none"
    />
  );
}

(SankeyLink as any).displayName = 'SankeyLink';
(SankeyLink as any).requiresSVG = true;

export default SankeyLink;