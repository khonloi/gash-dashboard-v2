import React from 'react';
import { Grid } from 'lucide-react';
import clsx from 'clsx';
import { createSvgLogo, BaseLogoProps } from './logoFactory';
import styles from './Logos.module.css';

export type BrandLogoProps = BaseLogoProps;

export const NikeLogo = createSvgLogo('/logos/brands/nike.svg', 'Nike', 2.8, 32);
export const AdidasLogo = createSvgLogo('/logos/brands/adidas.svg', 'Adidas', 1.45, 32);
export const PumaLogo = createSvgLogo('/logos/brands/puma.svg', 'Puma', 1.2, 32);
export const UnderArmourLogo = createSvgLogo(
  '/logos/brands/under-armour.svg',
  'Under Armour',
  1.3,
  32
);
export const AsicsLogo = createSvgLogo('/logos/brands/asics.svg', 'Asics', 2.8, 30);
export const NewBalanceLogo = createSvgLogo(
  '/logos/brands/new-balance.svg',
  'New Balance',
  1.4,
  30
);
export const ReebokLogo = createSvgLogo('/logos/brands/reebok.svg', 'Reebok', 2.2, 28);
export const JordanLogo = createSvgLogo('/logos/brands/jordan.svg', 'Air Jordan', 1.0, 32);
export const MizunoLogo = createSvgLogo('/logos/brands/mizuno.svg', 'Mizuno', 1.8, 28);
export const SpeedoLogo = createSvgLogo('/logos/brands/speedo.svg', 'Speedo', 4.5, 22);
export const WilsonLogo = createSvgLogo('/logos/brands/wilson.svg', 'Wilson', 3.8, 26);

export function MoreBrandsLogo({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <div className={clsx(styles.moreBrands, className)}>
      <Grid size={size} />
      <span>+ MORE BRANDS</span>
    </div>
  );
}

const BRAND_COMPONENT_MAP: Record<string, React.ComponentType<BrandLogoProps>> = {
  NIKE: NikeLogo,
  ADIDAS: AdidasLogo,
  PUMA: PumaLogo,
  'UNDER ARMOUR': UnderArmourLogo,
  ASICS: AsicsLogo,
  'NEW BALANCE': NewBalanceLogo,
  REEBOK: ReebokLogo,
  JORDAN: JordanLogo,
  'AIR JORDAN': JordanLogo,
  MIZUNO: MizunoLogo,
  SPEEDO: SpeedoLogo,
  WILSON: WilsonLogo,
};

interface BrandDispatcherProps extends BrandLogoProps {
  brand: string;
}

export function BrandLogo({ brand, size = 32, className, ...props }: BrandDispatcherProps) {
  const normalized = (brand || '').trim().toUpperCase();

  if (normalized === '+ MORE BRANDS' || normalized === 'MORE BRANDS') {
    return <MoreBrandsLogo size={16} className={className} />;
  }

  const Component = BRAND_COMPONENT_MAP[normalized];
  if (Component) {
    return <Component size={size} className={className} {...props} />;
  }

  return <span className={clsx(styles.fallbackBrand, className)}>{brand}</span>;
}
