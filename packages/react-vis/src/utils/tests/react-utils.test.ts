import {describe, expect, test, vi} from 'vitest';
import {
  getDOMNode,
  isReactDOMSupported,
  warning,
  warnOnce
} from '../react-utils';

describe('react-utils', () => {
  test('supports the current React DOM and returns refs unchanged', () => {
    const ref = document.createElement('div');
    expect(isReactDOMSupported()).toBe(true);
    expect(getDOMNode(ref)).toBe(ref);
  });

  test('warns once when requested', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warning('visible warning');
    warning('same warning', true);
    warning('same warning', true);
    warnOnce('another warning');
    warnOnce('another warning');
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });
});
