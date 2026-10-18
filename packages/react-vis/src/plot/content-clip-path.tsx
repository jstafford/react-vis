import React from 'react';
import {SeriesComponentType} from 'seriesComponentType';

interface ContentClipPathProps {
  id?: string;
  innerWidth?: number;
  innerHeight?: number;
}

export const ContentClipPath: SeriesComponentType<ContentClipPathProps> = ({
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
