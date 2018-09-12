import React, {Component} from 'react';

import {mapSection} from '../showcase-components/showcase-utils';
import {showCase} from '../index';
const {
  DynamicCrosshairScatterplot
} = showCase;

/* eslint-disable max-len */

const TOOLTIPS = [{
  name: 'Dynamic Crosshair Scatterplot',
  comment: 'Move your mouse over the chart to see the point.',
  component: DynamicCrosshairScatterplot,
  componentName: 'DynamicCrosshairScatterplot'
}];
/* eslint-enable max-len */

class AxesShowcase extends Component {
  render() {
    return (
      <article id="axes">
        <h2>Tooltips</h2>
        {TOOLTIPS.map(mapSection)}
      </article>
    );
  }
}

export default AxesShowcase;
