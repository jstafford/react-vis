import {describe, expect, test} from 'vitest';
import {getCombinedClassName} from '../styling-utils';

describe('styling-utils', () => {
  test('joins only truthy string class names', () => {
    expect(getCombinedClassName('one', null, 'two', false, '', undefined)).toBe(
      'one two'
    );
  });
});
