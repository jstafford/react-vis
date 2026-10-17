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

import {getCombinedClassName} from 'utils/styling-utils';

type LegendTitle = number | string;

export interface ContinuousSizeLegendProps {
  className?: string;
  circlesTotal?: number;
  endSize?: number;
  endTitle: LegendTitle;
  height?: number;
  startSize?: number;
  startTitle: LegendTitle;
  width?: number;
  _displayName?: string;
}

function ContinuousSizeLegend({
  startTitle,
  endTitle,
  startSize = 2,
  endSize = 20,
  circlesTotal = 10,
  height,
  width,
  className = '',
  _displayName = 'ContinuousSizeLegend'
}: ContinuousSizeLegendProps): JSX.Element {
  const circles: React.ReactNode[] = [];
  const step = (endSize - startSize) / (circlesTotal - 1);

  for (let index = 0; index < circlesTotal; index++) {
    const size = step * index + startSize;
    circles.push(
      <div
        key={index}
        className="rv-bubble"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2
        }}
      />
    );
    // Add the separator in order to justify the content (otherwise the tags
    // will be stacked together without any margins around).
    circles.push(' ');
  }
  return (
    <div
      className={getCombinedClassName('rv-continuous-size-legend', className)}
      style={{width, height}}
    >
      <div className="rv-bubbles" style={{height: endSize}}>
        {circles}
        <div className="rv-spacer" />
      </div>
      <div className="rv-legend-titles">
        <span className="rv-legend-titles__left">{startTitle}</span>
        <span className="rv-legend-titles__right">{endTitle}</span>
      </div>
    </div>
  );
}

export default ContinuousSizeLegend;
