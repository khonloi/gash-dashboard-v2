import React from 'react';

export interface BrandLogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
}

export function BrandLogoIcon({
  size = 28,
  color = 'currentColor',
  className,
  ...props
}: BrandLogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Brand Logo"
      {...props}
    >
      {/* Outer Triangle */}
      <polygon
        points="256,69 27,442 485,442"
        stroke={color}
        strokeWidth="34"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      {/* Inner Circle */}
      <circle cx="256" cy="332" r="67" stroke={color} strokeWidth="14" />
      {/* Inner Star */}
      <polygon
        points="
          256.00,283.00
          268.42,317.07
          304.60,318.06
          275.82,340.23
          286.11,374.84
          256.00,354.20
          225.89,374.84
          236.18,340.23
          207.40,318.06
          243.58,317.07
        "
        fill={color}
      />
    </svg>
  );
}
