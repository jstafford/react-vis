import type React from 'react';

export interface ParentConfig {
  isDomainAdjustmentNeeded?: boolean;
  zeroBaseValue?: boolean;
}

export type SeriesComponentType<P = {[key: string]: unknown}> = {
  (props: P): React.JSX.Element | null,
  displayName?: string,
  requiresSVG?: boolean,
  isCanvas?: boolean,
  getParentConfig?: (attr?: string, props?: P) => ParentConfig,
  renderLayer?: (props: P, ctx: CanvasRenderingContext2D) => void
};
