import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BackendProduct } from '@/types/product';
import styles from '@/app/(dashboard)/dashboard.module.css';

export interface ProductIdentityCellProps {
  product: BackendProduct;
}

export function ProductIdentityCell({ product }: ProductIdentityCellProps) {
  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0].url
      : '/icon.svg';

  const productId = product._id || product.id;

  return (
    <div className={styles.tableProductCell}>
      <Image
        src={imageUrl}
        alt={product.name}
        width={44}
        height={44}
        className={styles.tableProductThumb}
        unoptimized
      />
      <div className={styles.tableProductMeta}>
        <Link href={`/products/${productId}/edit`} className={styles.tableProductName}>
          {product.name}
        </Link>
        <span className={styles.tableProductSku}>SKU: {product.sku || 'N/A'}</span>
      </div>
    </div>
  );
}
