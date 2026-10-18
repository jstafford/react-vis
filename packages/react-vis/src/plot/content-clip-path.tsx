import React from 'react';

interface ContentClipPathProps {
  id?: string;
  innerWidth?: number;
  innerHeight?: number;
}

export const ContentClipPath = ({
  id = 'content-area',
  innerWidth,
  innerHeight
}: ContentClipPathProps) => {
  return (
    <defs>
      <clipPath id={id}>
        <rect x={0} y={0} width={innerWidth} height={innerHeight} />
      </clipPath>
    </defs>
  );
}

ContentClipPath.displayName = 'ContentClipPath';
ContentClipPath.requiresSVG = true;
