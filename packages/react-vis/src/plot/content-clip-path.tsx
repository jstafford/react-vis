import React from 'react';

interface ContentClipPathProps {
  id?: string;
  innerWidth?: number;
  innerHeight?: number;
  _displayName?: string;
}

export default function ContentClipPath({
  id = 'content-area',
  innerWidth,
  innerHeight,
  _displayName = 'ContentClipPath'
}: ContentClipPathProps) {
  return (
    <defs>
      <clipPath id={id}>
        <rect x={0} y={0} width={innerWidth} height={innerHeight} />
      </clipPath>
    </defs>
  );
}

ContentClipPath.requiresSVG = true;
