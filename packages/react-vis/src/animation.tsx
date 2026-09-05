import React from 'react';
import PropTypes from 'prop-types';
import {interpolate} from 'd3-interpolate';
import {spring, Motion, presets} from 'react-motion';

const ANIMATION_PROPTYPES = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    stiffness: PropTypes.number,
    nonAnimatedProps: PropTypes.arrayOf(PropTypes.string),
    damping: PropTypes.number
  }),
  PropTypes.bool
]);

const propTypes = {
  animatedProps: PropTypes.arrayOf(PropTypes.string).isRequired,
  animation: ANIMATION_PROPTYPES,
  onStart: PropTypes.func,
  onEnd: PropTypes.func
};

export type AnimationParam =
  | string
  | {stiffness?: number; nonAnimatedProps?: string[]; damping?: number}
  | boolean;

interface AnimationStyle {
  val?: number;
  stiffness: number;
  damping: number;
  precision?: number;
  [key: string]: any;
}

interface AnimationProps {
  animatedProps: string[];
  animation?: AnimationParam;
  onStart?: () => void;
  onEnd?: () => void;
  children?: React.ReactNode;
  [key: string]: any;
}

interface AnimationState {}

// type PresetValues = 'noWobble' | 'gentle' | 'wobbly' | 'stiff';

/**
 * Format the animation style object
 * @param {Object|String} animationStyle - The animation style property, either the name of a
 * presets are one of noWobble, gentle, wobbly, stiff
 */
const VALID_PRESETS = presets as unknown as {[key: string]: AnimationStyle};

function getAnimationStyle(animationStyle: AnimationParam = presets.noWobble): AnimationStyle {
  if (typeof animationStyle === 'string') {
    return VALID_PRESETS[animationStyle] || presets.noWobble;
  }
  if (typeof animationStyle === 'boolean') {
    return presets.noWobble;
  }
  const {damping, stiffness} = animationStyle;
  return {
    ...animationStyle,
    damping: damping || presets.noWobble.damping,
    stiffness: stiffness || presets.noWobble.stiffness
  };
}

/**
 * Extract the animated props from the entire props object.
 * @param {Object} props Props.
 * @returns {Object} Object of animated props.
 */
export function extractAnimatedPropValues(props: AnimationProps): {[key: string]: any} {
  const {animatedProps, ...otherProps} = props;

  return animatedProps.reduce((result: {[key: string]: any}, animatedPropName: string) => {
    if (Object.prototype.hasOwnProperty.call(otherProps, animatedPropName)) {
      result[animatedPropName] = otherProps[animatedPropName];
    }
    return result;
  }, {});
}

const Animation: any = (props: AnimationProps): React.ReactElement => {
  const interpolator = React.useRef<((t: number) => any) | null>(null);
  const previousProps = React.useRef<AnimationProps | null>(null);

  if (!previousProps.current) {
    interpolator.current = interpolate(extractAnimatedPropValues(props), {});
  }

  React.useEffect(() => {
    if (previousProps.current) {
      interpolator.current = interpolate(
        extractAnimatedPropValues(previousProps.current),
        extractAnimatedPropValues(props)
      );
      if (previousProps.current.onStart) {
        previousProps.current.onStart();
      }
    }
    previousProps.current = props;
  });

  const renderChildren = ({i}: any): React.ReactElement => {
    const {children} = props;
    const currentInterpolator = interpolator.current;
    const child = React.Children.only(children) as React.ReactElement;
    const interpolatedProps = currentInterpolator
      ? currentInterpolator(i)
      : currentInterpolator;

    // interpolator doesn't play nice with deeply nested objects
    // so we expose an additional prop for situations like these, so it _data,
    // which stores the full tree and can be recombined with the sanitized version
    // after interpolation
    let data = (interpolatedProps && interpolatedProps.data) || null;
    if (data && child.props._data) {
      data = data.map((row: any, index: number) => {
        const correspondingCell = child.props._data[index];
        return {
          ...row,
          parent: correspondingCell.parent,
          children: correspondingCell.children
        };
      });
    }

    return React.cloneElement(child, {
      ...child.props,
      ...interpolatedProps,
      data: data || child.props.data || null,
      // enforce re-rendering
      _animation: Math.random()
    });
  };

  const MotionComponent = Motion as any;
  const animationStyle = getAnimationStyle(props.animation);
  const defaultStyle = {i: 0};
  const style = {i: spring(1, animationStyle)};
  const key = Math.random();
  return (
    <MotionComponent
      {...{defaultStyle, style, key}}
      onRest={() => props.onEnd && props.onEnd()}
    >
      {renderChildren}
    </MotionComponent>
  );
};

Animation.propTypes = propTypes;
Animation.displayName = 'Animation';

export default Animation;

export const AnimationPropType = ANIMATION_PROPTYPES;
