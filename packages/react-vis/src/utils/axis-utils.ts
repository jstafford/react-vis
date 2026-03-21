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

import {range} from 'd3-array';
import {scaleLinear} from 'd3-scale';

export interface OrientationType {
  TOP: string;
  LEFT: string;
  RIGHT: string;
  BOTTOM: string;
  VERTICAL: string;
  HORIZONTAL: string;
}

export interface DirectionType {
  VERTICAL: string;
  HORIZONTAL: string;
}

export const ORIENTATION: OrientationType = {
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

export const DIRECTION: DirectionType = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

/**
 * Get total amount of ticks from a given size in pixels.
 * @param {number} size Size of the axis in pixels.
 * @returns {number} Total amount of ticks.
 */
export function getTicksTotalFromSize(size: number): number {
  if (size < 700) {
    if (size > 300) {
      return 10;
    }
    return 5;
  }
  return 20;
}

export interface D3Scale {
  ticks?: (count?: number) => any[];
  domain: () => any[];
}

/**
 * Get the tick values from a given d3 scale.
 * @param {d3.scale} scale Scale function.
 * @param {number} tickTotal Total number of ticks
 * @param {Array} tickValues Array of tick values if they exist.
 * @returns {Array} Array of tick values.
 */
export function getTickValues(
  scale: D3Scale,
  tickTotal: number,
  tickValues?: any[]
): any[] {
  return !tickValues
    ? scale.ticks
      ? scale.ticks(tickTotal)
      : scale.domain()
    : tickValues;
}

export interface AxisPoint {
  x: number;
  y: number;
}

export interface FitResult {
  left: number;
  right: number;
  slope: number;
  offset: number;
}

/**
 * Generate a description of a decorative axis in terms of a linear equation
 * y = slope * x + offset in coordinates
 * @param {Object} axisStart Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * @param {Object} axisEnd Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * @returns {Object} Object describing each the line in coordinates
 */
export function generateFit(axisStart: AxisPoint, axisEnd: AxisPoint): FitResult {
  // address the special case when the slope is infinite
  if (axisStart.x === axisEnd.x) {
    return {
      left: axisStart.y,
      right: axisEnd.y,
      slope: 0,
      offset: axisStart.x
    };
  }
  const slope = (axisStart.y - axisEnd.y) / (axisStart.x - axisEnd.x);
  return {
    left: axisStart.x,
    right: axisEnd.x,
    // generate the linear projection of the axis direction
    slope,
    offset: axisStart.y - slope * axisStart.x
  };
}

export interface GeneratePointsParams {
  axisStart: AxisPoint;
  axisEnd: AxisPoint;
  numberOfTicks: number;
  axisDomain: number[];
}

export interface TickPoint {
  x: number;
  y: number;
  text: number | undefined;
}

export interface GeneratePointsResult {
  slope: number;
  points: TickPoint[];
}

/**
 * Generate a description of a decorative axis in terms of a linear equation
 * y = slope * x + offset in coordinates
 * @param props
 * props.@param {Object} axisStart Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * props.@param {Object} axisEnd Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * props.@param {Number} numberOfTicks The number of ticks on the axis
 * props.@param {Array.Numbers} axisDomain The values to be interpolated across for the axis
 * @returns {Object} Object describing the slope and the specific coordinates of the points
 */
export function generatePoints({
  axisStart,
  axisEnd,
  numberOfTicks,
  axisDomain
}: GeneratePointsParams): GeneratePointsResult {
  const {left, right, slope, offset} = generateFit(axisStart, axisEnd);
  // construct a linear band of points, then map them
  const pointSlope = (right - left) / numberOfTicks;
  const axisScale = scaleLinear()
    .domain([left, right])
    .range(axisDomain);

  const slopeVertical = axisStart.x === axisEnd.x;
  return {
    slope: slopeVertical ? Infinity : slope,
    points: range(left, right + pointSlope, pointSlope)
      .map(val => {
        if (slopeVertical) {
          return {y: val, x: slope * val + offset, text: axisScale(val)};
        }
        return {x: val, y: slope * val + offset, text: axisScale(val)};
      })
      .slice(0, numberOfTicks + 1)
  };
}

/**
 * Compute the angle (in radians) of a decorative axis
 * @param {Object} axisStart Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * @param {Object} axisEnd Object of format {x, y} describing in coordinates
 * the start position of the decorative axis
 * @returns {Number} Angle in radials
 */
export function getAxisAngle(axisStart: AxisPoint, axisEnd: AxisPoint): number {
  if (axisStart.x === axisEnd.x) {
    return axisEnd.y > axisStart.y ? Math.PI / 2 : (3 * Math.PI) / 2;
  }
  return Math.atan((axisEnd.y - axisStart.y) / (axisEnd.x - axisStart.x));
}

export default {
  DIRECTION,
  ORIENTATION,
  getTicksTotalFromSize,
  getTickValues
};
