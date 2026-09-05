import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import SankeyLink from '../sankey-link';

describe('SankeyLink', () => {
  test('renders a styled SVG link with defaults', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <SankeyLink data="M0,0L10,10" node={{id: 1}} strokeWidth={2} />
      </svg>
    );

    expect(markup).toContain('class="rv-sankey__link"');
    expect(markup).toContain('d="M0,0L10,10"');
    expect(markup).toContain('opacity="0.7"');
    expect(markup).toContain('stroke-width="2"');
    expect(markup).toContain('fill="none"');
  });

  test('accepts custom style and callback props', () => {
    const onLinkClick = vi.fn();
    const markup = renderToStaticMarkup(
      <svg>
        <SankeyLink
          data="M0,0L5,5"
          node="node-a"
          color="green"
          opacity={0.4}
          strokeWidth={4}
          style={{strokeDasharray: '3, 2'}}
          onLinkClick={onLinkClick}
        />
      </svg>
    );

    expect(markup).toContain('stroke="green"');
    expect(markup).toContain('opacity="0.4"');
    expect(markup).toContain('stroke-dasharray="3, 2"');
    expect(onLinkClick).not.toHaveBeenCalled();
  });
});
