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

import XYPlot from 'plot/xy-plot';
import PolygonSeries from 'plot/series/polygon-series';
import MarkSeries from 'plot/series/mark-series';
import LabelSeries from 'plot/series/label-series';
import {getCombinedClassName} from 'utils/styling-utils';
import {TreemapNode, TreemapProps, TreemapScales} from './index';

const MARGIN_ADJUST = 1.2;

interface TreemapSVGProps extends TreemapProps {
  nodes: TreemapNode[];
  scales: TreemapScales;
}

class TreemapSVG extends React.Component<TreemapSVGProps> {
  getCircularNodes(): {
    updatedNodes: JSX.Element;
    minY: number;
    maxY: number;
    minX: number;
    maxX: number;
  } {
    const {
      animation,
      hideRootNode,
      nodes,
      onLeafMouseOver,
      onLeafMouseOut,
      onLeafClick,
      scales,
      style
    } = this.props;

    const {rows, minY, maxY, minX, maxX} = nodes.reduce(
      (acc, node, index) => {
        if (!index && hideRootNode) {
          return acc;
        }
        const {x = 0, y = 0, r = 0} = node;
        return {
          maxY: Math.max(y + r, acc.maxY),
          minY: Math.min(y - r, acc.minY),
          maxX: Math.max(x + MARGIN_ADJUST * r, acc.maxX),
          minX: Math.min(x - MARGIN_ADJUST * r, acc.minX),
          rows: acc.rows.concat([
            {
              x,
              y,
              size: r,
              color: scales.color(node)
            }
          ])
        };
      },
      {
        rows: [] as Array<{x: number; y: number; size: number; color: any}>,
        maxY: -Infinity,
        minY: Infinity,
        maxX: -Infinity,
        minX: Infinity
      }
    );
    return {
      updatedNodes: (
        <MarkSeries
          animation={animation}
          className="rv-treemap__leaf rv-treemap__leaf--circle"
          onSeriesMouseEnter={onLeafMouseOver as any}
          onSeriesMouseLeave={onLeafMouseOut as any}
          onSeriesClick={onLeafClick as any}
          data={rows}
          colorType="literal"
          getColor={(datum: any) => datum.color}
          sizeType="literal"
          getSize={(datum: any) => datum.size}
          style={style}
        />
      ),
      minY,
      maxY,
      minX,
      maxX
    };
  }

  getNonCircularNodes(): {
    updatedNodes: JSX.Element[];
    minY: number;
    maxY: number;
    minX: number;
    maxX: number;
  } {
    const {
      animation,
      hideRootNode,
      nodes,
      onLeafMouseOver,
      onLeafMouseOut,
      onLeafClick,
      scales,
      style
    } = this.props;
    const {color} = scales;
    return nodes.reduce(
      (acc, node, index) => {
        if (!index && hideRootNode) {
          return acc;
        }
        const {x0 = 0, x1 = 0, y1 = 0, y0 = 0} = node;
        const x = x0;
        const y = y0;
        const nodeHeight = y1 - y0;
        const nodeWidth = x1 - x0;

        acc.maxY = Math.max(y + nodeHeight, acc.maxY);
        acc.minY = Math.min(y, acc.minY);
        acc.maxX = Math.max(x + nodeWidth, acc.maxX);
        acc.minX = Math.min(x, acc.minX);

        const data = [
          {x, y},
          {x, y: y + nodeHeight},
          {x: x + nodeWidth, y: y + nodeHeight},
          {x: x + nodeWidth, y}
        ];

        acc.updatedNodes = acc.updatedNodes.concat([
          <PolygonSeries
            animation={animation}
            className="rv-treemap__leaf"
            key={index}
            color={color(node)}
            type="literal"
            onSeriesMouseEnter={onLeafMouseOver as any}
            onSeriesMouseLeave={onLeafMouseOut as any}
            onSeriesClick={onLeafClick as any}
            data={data}
            style={{
              ...style,
              ...(node as any).style
            }}
          />
        ]);
        return acc;
      },
      {
        updatedNodes: [] as JSX.Element[],
        maxY: -Infinity,
        minY: Infinity,
        maxX: -Infinity,
        minX: Infinity
      }
    );
  }

  render(): JSX.Element {
    const {className, height, mode, nodes, width} = this.props;
    const useCirclePacking = mode === 'circlePack';

    const {minY, maxY, minX, maxX, updatedNodes} = useCirclePacking
      ? this.getCircularNodes()
      : this.getNonCircularNodes();

    const labels = nodes.reduce((acc: any[], node) => {
      if (!node.data.title) {
        return acc;
      }
      return acc.concat({
        ...node.data,
        x: node.x0 || node.x,
        y: node.y0 || node.y,
        label: `${node.data.title}`
      });
    }, []);

    return (
      <XYPlot
        {...this.props}
        className={getCombinedClassName(
          'rv-treemap',
          useCirclePacking && 'rv-treemap-circle-paked',
          className
        )}
        width={width}
        height={height}
        yDomain={[maxY, minY]}
        xDomain={[minX, maxX]}
        colorType="literal"
        hasTreeStructure
      >
        {updatedNodes}
        <LabelSeries data={labels} />
      </XYPlot>
    );
  }
}

(TreemapSVG as any).displayName = 'TreemapSVG';

export default TreemapSVG;