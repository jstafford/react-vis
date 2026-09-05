// Copyright (c) 2018 Uber Technologies, Inc.
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
import PropTypes from 'prop-types';

import {getCombinedClassName} from 'utils/styling-utils';

interface ChartLabelProps {
  innerHeight?: number;
  innerWidth?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  className?: string;
  includeMargin?: boolean;
  style?: {[key: string]: any};
  text: string;
  xPercent: number;
  yPercent: number;
}

const ChartLabel: any = (props: ChartLabelProps) => {
  const {
    innerHeight = 0,
    innerWidth = 0,
    marginBottom = 0,
    marginLeft = 0,
    marginRight = 0,
    marginTop = 0,
    className,
    includeMargin,
    style,
    text,
    xPercent,
    yPercent
  } = props;
  const width = innerWidth + (includeMargin ? marginLeft + marginRight : 0);
  const height = innerHeight + (includeMargin ? marginTop + marginBottom : 0);
  const xPos = width * xPercent + (includeMargin ? 0 : marginLeft);
  const yPos = height * yPercent + (includeMargin ? marginTop : 0);
  return (
    <g
      transform={`translate(${xPos}, ${yPos})`}
      className={getCombinedClassName('rv-xy-plot__axis__title', className)}
    >
      <text {...style}>{text}</text>
    </g>
  );
};

ChartLabel.displayName = 'ChartLabel';
ChartLabel.requiresSVG = true;
ChartLabel.propTypes = {
  className: PropTypes.string,
  includeMargin: PropTypes.bool,
  style: PropTypes.object,
  text: PropTypes.string.isRequired,
  xPercent: PropTypes.number.isRequired,
  yPercent: PropTypes.number.isRequired
};
ChartLabel.defaultProps = {
  className: '',
  includeMargin: true,
  text: '',
  xPercent: 0,
  yPercent: 0,
  style: {}
};
export default ChartLabel;
