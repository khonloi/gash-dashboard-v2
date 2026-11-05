'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductForm } from '@/components/products/ProductForm/ProductForm';
import { PageHeader } from '@/components/layout';
import { useProductQuery, useUpdateProductMutation } from '@/hooks/useProducts';
import { useToastStore } from '@/store/useToastStore';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { ProductFormData } from '@/lib/productValidation';
import dashboardStyles from '@/app/(dashboard)/dashboard.module.css';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();

  const { data: product, isLoading, isError } = useProductQuery(id);
  const updateMutation = useUpdateProductMutation();
  const addToast = useToastStore((state) => state.addToast);

  if (isLoading) {
    return (
      <div className={dashboardStyles.pageContainer}>
        <Skeleton style={{ width: '280px', height: '36px', borderRadius: 'var(--radius-md)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
          <Skeleton style={{ height: '420px', borderRadius: 'var(--radius-xl)' }} />
          <Skeleton style={{ height: '320px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={dashboardStyles.pageContainer}>
        <EmptyState
          title="Product Not Found"
          description="The requested product does not exist or may have been deleted from catalog."
          action={
            <Button as={Link} href="/products" variant="primary">
              Return to Products
            </Button>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: formData,
      });
      addToast(`Product "${formData.name}" updated successfully!`, 'success');
      router.push('/products');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update product', 'error');
    }
  };

  return (
    <div className={dashboardStyles.pageContainer}>
      <PageHeader
        title={`Edit Product: ${product.name}`}
        subtitle="Update catalog information, adjust stock thresholds, and manage pricing."
        backHref="/products"
        backLabel="Back to Products"
      />

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        mode="edit"
      />
    </div>
  );
}
