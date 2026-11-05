import React from 'react';
import Image, { ImageProps } from 'next/image';
import clsx from 'clsx';
import styles from './Logos.module.css';

export interface BaseLogoProps extends Omit<Partial<ImageProps>, 'src' | 'alt'> {
  size?: number;
  className?: string;
}

export function createSvgLogo(src: string, alt: string, defaultRatio = 1, defaultSize = 32) {
  const LogoComponent = ({ size = defaultSize, className, style, ...props }: BaseLogoProps) => {
    const width = Math.round(size * defaultRatio);
    return (
      <Image
        src={src}
        alt={alt}
        aria-label={alt}
        width={width}
        height={size}
        unoptimized
        style={{ objectFit: 'contain', maxHeight: size, ...style }}
        className={clsx(styles.logoImg, className)}
        {...props}
      />
    );
  };
  LogoComponent.displayName = `${alt.replace(/\s+/g, '')}Logo`;
  return LogoComponent;
}
