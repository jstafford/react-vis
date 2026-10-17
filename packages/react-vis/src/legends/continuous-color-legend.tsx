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

import {CONTINUOUS_COLOR_RANGE} from 'theme';
import {getCombinedClassName} from 'utils/styling-utils';

type LegendTitle = number | string;

export interface ContinuousColorLegendProps {
  className?: string;
  height?: number;
  endColor?: string;
  endTitle: LegendTitle;
  midColor?: string;
  midTitle?: LegendTitle;
  startColor?: string;
  startTitle: LegendTitle;
  width?: number;
  _displayName?: string;
}

function ContinuousColorLegend({
  startColor = CONTINUOUS_COLOR_RANGE[0],
  midColor,
  endColor = CONTINUOUS_COLOR_RANGE[1],
  startTitle,
  midTitle,
  endTitle,
  height,
  width,
  className = '',
  _displayName = 'ContinuousColorLegend'
}: ContinuousColorLegendProps): JSX.Element {
  const colors = [startColor];
  if (midColor) {
    colors.push(midColor);
  }
  colors.push(endColor);
  return (
    <div
      className={getCombinedClassName('rv-continuous-color-legend', className)}
      style={{width, height}}
    >
      <div
        className="rv-gradient"
        style={{background: `linear-gradient(to right, ${colors.join(',')})`}}
      />
      <div className="rv-legend-titles">
        <span className="rv-legend-titles__left">{startTitle}</span>
        <span className="rv-legend-titles__right">{endTitle}</span>
        {midTitle ? (
          <span className="rv-legend-titles__center">{midTitle}</span>
        ) : null}
      </div>
    </div>
  );
}

export default ContinuousColorLegend;
