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
// global/window and plot/xy-plot lack type declarations
// eslint-disable-next-line @typescript-eslint/no-var-requires
const window: Window = require('global/window');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XYPlot: React.ComponentType<any> = require('plot/xy-plot').default;
import {getDOMNode} from 'utils/react-utils';

const CONTAINER_REF = 'container';

// As a performance enhancement, we want to only listen once
const resizeSubscribers: Array<() => void> = [];
const DEBOUNCE_DURATION = 100;
let timeoutId: number | null = null;

/**
 * Calls each subscriber, debounced to the DEBOUNCE_DURATION.
 */
function debounceEmitResize(): void {
  window.clearTimeout(timeoutId as number | undefined);
  timeoutId = window.setTimeout(emitResize, DEBOUNCE_DURATION) as unknown as number;
}

/**
 * Calls each subscriber once synchronously.
 */
function emitResize(): void {
  resizeSubscribers.forEach(cb => cb());
}

/**
 * Add the given callback to the list of subscribers to be called when the
 * window resizes. Returns a function that, when called, removes the given
 * callback from the list of subscribers. This function is also responsible for
 * adding and removing the resize listener on `window`.
 *
 * @param {Function} cb - Subscriber callback function
 * @returns {Function} Unsubscribe function
 */
function subscribeToDebouncedResize(cb: () => void): () => void {
  resizeSubscribers.push(cb);

  // if we go from zero to one Flexible components instances, add the listener
  if (resizeSubscribers.length === 1) {
    window.addEventListener('resize', debounceEmitResize);
  }
  return function unsubscribe() {
    removeSubscriber(cb);

    // if we have no Flexible components, remove the listener
    if (resizeSubscribers.length === 0) {
      window.clearTimeout(timeoutId as number | undefined);
      window.removeEventListener('resize', debounceEmitResize);
    }
  };
}

/**
 * Helper for removing the given callback from the list of subscribers.
 *
 * @param {Function} cb - Subscriber callback function
 */
function removeSubscriber(cb: () => void): void {
  const index = resizeSubscribers.indexOf(cb);
  if (index > -1) {
    resizeSubscribers.splice(index, 1);
  }
}

/**
 * Helper for getting a display name for the child component.
 * @param {*} Component React class for the child component.
 * @returns {String} The child component's name
 */
function getDisplayName(Component: React.ComponentType<any>): string {
  return Component.displayName || Component.name || 'Component';
}

interface FlexibleState {
  height: number;
  width: number;
}

/**
 * Add the ability to stretch the visualization on window resize.
 * @param {*} Component React class for the child component.
 * @param {boolean} isWidthFlexible Whether width should flex with container.
 * @param {boolean} isHeightFlexible Whether height should flex with container.
 * @returns {*} Flexible component.
 */
function makeFlexible<P extends {height?: number; width?: number}>(
  Component: React.ComponentType<P>,
  isWidthFlexible: boolean,
  isHeightFlexible: boolean
): React.ComponentClass<Omit<P, 'height' | 'width'>> {
  const ResultClass = class extends React.Component<
    Omit<P, 'height' | 'width'>,
    FlexibleState
  > {
    static get propTypes() {
      const {
        height, // eslint-disable-line no-unused-vars
        width, // eslint-disable-line no-unused-vars
        ...otherPropTypes
      } = (Component as any).propTypes || {};
      return otherPropTypes;
    }

    [CONTAINER_REF]: Element | null = null;
    cancelSubscription!: () => void;

    constructor(props: Omit<P, 'height' | 'width'>) {
      super(props);
      this.state = {
        height: 0,
        width: 0
      };
    }

    /**
     * Get the dimensions of the container and update state.
     * @private
     */
    _onResize = (): void => {
      const containerElement = getDOMNode(this[CONTAINER_REF]);
      if (!containerElement) {
        return;
      }
      const {offsetHeight, offsetWidth} = containerElement as HTMLElement;

      const newState: Partial<FlexibleState> = {};
      if (this.state.height !== offsetHeight) {
        newState.height = offsetHeight;
      }
      if (this.state.width !== offsetWidth) {
        newState.width = offsetWidth;
      }
      if (Object.keys(newState).length > 0) {
        this.setState(newState as FlexibleState);
      }
    };

    componentDidMount(): void {
      this._onResize();
      this.cancelSubscription = subscribeToDebouncedResize(this._onResize);
    }

    UNSAFE_componentWillReceiveProps(): void {
      this._onResize();
    }

    componentWillUnmount(): void {
      this.cancelSubscription();
    }

    render(): React.ReactNode {
      const {height, width} = this.state;
      const props = {
        ...this.props,
        animation:
          height === 0 && width === 0
            ? null
            : (this.props as any).animation
      } as unknown as P;

      const updatedDimensions = {
        ...(isHeightFlexible ? {height} : {}),
        ...(isWidthFlexible ? {width} : {})
      };

      return (
        <div
          ref={ref => (this[CONTAINER_REF] = ref)}
          style={{width: '100%', height: '100%'}}
        >
          <Component {...updatedDimensions} {...props} />
        </div>
      );
    }
  };

  (ResultClass as any).displayName = `Flexible${getDisplayName(Component)}`;

  return ResultClass;
}

export function makeHeightFlexible<P extends {height?: number; width?: number}>(
  component: React.ComponentType<P>
): React.ComponentClass<Omit<P, 'height' | 'width'>> {
  return makeFlexible(component, false, true);
}

export function makeVisFlexible<P extends {height?: number; width?: number}>(
  component: React.ComponentType<P>
): React.ComponentClass<Omit<P, 'height' | 'width'>> {
  return makeFlexible(component, true, true);
}

export function makeWidthFlexible<P extends {height?: number; width?: number}>(
  component: React.ComponentType<P>
): React.ComponentClass<Omit<P, 'height' | 'width'>> {
  return makeFlexible(component, true, false);
}

export const FlexibleWidthXYPlot = makeWidthFlexible(XYPlot);
export const FlexibleHeightXYPlot = makeHeightFlexible(XYPlot);
export const FlexibleXYPlot = makeVisFlexible(XYPlot);
