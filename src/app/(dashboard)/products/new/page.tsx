'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm/ProductForm';
import { PageHeader } from '@/components/layout';
import { useCreateProductMutation } from '@/hooks/useProducts';
import { useToastStore } from '@/store/useToastStore';
import { ProductFormData } from '@/lib/productValidation';
import dashboardStyles from '@/app/(dashboard)/dashboard.module.css';

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProductMutation();
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      await createMutation.mutateAsync(formData);
      addToast(`Product "${formData.name}" created successfully!`, 'success');
      router.push('/products');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create product', 'error');
    }
  };

  return (
    <div className={dashboardStyles.pageContainer}>
      <PageHeader
        title="Create New Product"
        subtitle="Add a new item to your store catalog with pricing, stock tracking, and media."
        backHref="/products"
        backLabel="Back to Products"
      />

      <ProductForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} mode="create" />
    </div>
  );
}
