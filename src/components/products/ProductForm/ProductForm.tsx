'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Select } from '@/components/ui/Select/Select';
import { Switch } from '@/components/ui/Switch/Switch';
import { Button } from '@/components/ui/Button/Button';
import { BackendProduct } from '@/types/product';
import { productSchema, ProductFormData } from '@/lib/productValidation';
import styles from './ProductForm.module.css';

const CATEGORY_OPTIONS = [
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Apparel', label: 'Apparel' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Recovery', label: 'Recovery' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Visible on Storefront)' },
  { value: 'draft', label: 'Draft (Internal Only)' },
  { value: 'archived', label: 'Archived' },
];

export interface ProductFormProps {
  initialData?: BackendProduct | null;
  isSubmitting?: boolean;
  onSubmit: (data: ProductFormData) => Promise<void>;
  mode?: 'create' | 'edit';
}

export function ProductForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  mode = 'create',
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [category, setCategory] = useState(initialData?.category || 'Footwear');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [brand, setBrand] = useState(initialData?.brand || 'GASH Performance');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice ? String(initialData.compareAtPrice) : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.costPrice ? String(initialData.costPrice) : ''
  );
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [quantity, setQuantity] = useState(
    initialData?.quantity !== undefined ? String(initialData.quantity) : '0'
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5'
  );
  const [status, setStatus] = useState<ProductFormData['status']>(
    (initialData?.status as ProductFormData['status']) || 'active'
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  // Images array
  const initialImages: string[] = Array.isArray(initialData?.images)
    ? initialData.images.map((img) => (typeof img === 'string' ? img : img.url))
    : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === 'create') {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Profit Margin calculation preview
  const numPrice = parseFloat(price) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const hasMargin = numPrice > 0 && numCost > 0;
  const grossProfit = numPrice - numCost;
  const marginPercentage = numPrice > 0 ? ((grossProfit / numPrice) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      shortDescription: shortDescription.trim() || undefined,
      category,
      subcategory: subcategory.trim() || undefined,
      brand: brand.trim(),
      price: parseFloat(price) || 0,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      quantity: parseInt(quantity, 10) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      status,
      isFeatured,
      images,
      tags: [],
    };

    const parseResult = productSchema.safeParse(rawPayload);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = parseResult.error.flatten().fieldErrors;
      Object.entries(flattened).forEach(([k, msgs]) => {
        if (msgs && msgs.length > 0) {
          fieldErrors[k] = msgs[0];
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(parseResult.data);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.layoutGrid}>
        {/* Left / Main Column (2fr) */}
        <div className={styles.mainColumn}>
          {/* 1. Basic Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Details</h2>

            <div className={styles.grid2}>
              <Input
                id="productName"
                label="Product Name"
                placeholder="e.g. Carbon Rocket 4"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                errorText={errors.name}
                required
              />

              <Input
                id="productSlug"
                label="URL Slug"
                placeholder="e.g. carbon-rocket-4"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                errorText={errors.slug}
              />
            </div>

            <Input
              id="shortDescription"
              label="Short Summary"
              placeholder="One-line summary for product previews"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />

            <Textarea
              id="productDescription"
              label="Full Description"
              placeholder="Comprehensive technical specifications, material composition, and athlete benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              errorText={errors.description}
              rows={4}
              required
            />
          </section>

          {/* 2. Pricing & Margin */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pricing & Profitability</h2>

            <div className={styles.grid3}>
              <Input
                id="productPrice"
                type="number"
                step="0.01"
                min="0"
                label="Selling Price ($)"
                placeholder="149.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                errorText={errors.price}
                required
              />

              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                label="Compare-at Price ($)"
                placeholder="180.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                helperText="Original MSRP for sale display"
              />

              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                label="Cost Per Item ($)"
                placeholder="60.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                helperText="Internal unit wholesale cost"
              />
            </div>

            {hasMargin && (
              <div className={styles.marginBox}>
                <span>
                  <strong>Gross Profit:</strong> ${grossProfit.toFixed(2)} per unit
                </span>
                <span>
                  <strong>Profit Margin:</strong> {marginPercentage}%
                </span>
              </div>
            )}
          </section>

          {/* 3. Inventory & Stock */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Inventory Tracking</h2>

            <div className={styles.grid2}>
              <Input
                id="productSku"
                label="SKU (Stock Keeping Unit)"
                placeholder="e.g. GS-RUN-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                errorText={errors.sku}
                required
              />

              <Input
                id="productBarcode"
                label="Barcode (ISBN, UPC, GTIN)"
                placeholder="e.g. 194123456789"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <div className={styles.grid2}>
              <Input
                id="productQuantity"
                type="number"
                min="0"
                label="Initial Stock Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                errorText={errors.quantity}
                required
              />

              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                label="Low-Stock Alert Threshold"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                helperText="Triggers dashboard restock alerts"
              />
            </div>
          </section>

          {/* 4. Product Images */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Product Media</h2>

            <div className={styles.addImageRow}>
              <Input
                id="newImageUrl"
                type="url"
                label="Add Image by URL"
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                containerClassName={styles.imageInput}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
              >
                <Plus size={16} /> Add Image
              </Button>
            </div>

            {images.length > 0 && (
              <div className={styles.imagesList}>
                {images.map((url, idx) => (
                  <div key={url + idx} className={styles.imageCard}>
                    <Image
                      src={url}
                      alt={`Product photo ${idx + 1}`}
                      fill
                      className={styles.imageThumb}
                      unoptimized
                    />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right / Side Column (1fr) */}
        <div className={styles.sideColumn}>
          {/* Action Card */}
          <div className={styles.actionsCard}>
            <h2
              className={styles.sectionTitle}
              style={{ borderBottom: 'none', padding: 0, margin: 0 }}
            >
              Actions
            </h2>
            <div
              className={styles.actionsBar}
              style={{ justifyContent: 'stretch', gap: '8px', border: 'none', padding: 0 }}
            >
              <Button as={Link} href="/products" variant="ghost" fullWidth>
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                {mode === 'create' ? 'Create Product' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Publishing & Visibility */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Publishing Status</h2>

            <Select
              id="productStatus"
              label="Catalog Visibility"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductFormData['status'])}
            />

            <div style={{ paddingTop: 'var(--space-2)' }}>
              <Switch
                checked={isFeatured}
                onChange={setIsFeatured}
                label="Featured Product"
                description="Promote to storefront carousels"
              />
            </div>
          </section>

          {/* Categorization & Brand */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Organization</h2>

            <Select
              id="productCategory"
              label="Primary Category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              errorText={errors.category}
              required
            />

            <Input
              id="productSubcategory"
              label="Subcategory"
              placeholder="e.g. Marathon, Trail, Track"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />

            <Input
              id="productBrand"
              label="Brand"
              placeholder="e.g. GASH Performance"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              errorText={errors.brand}
              required
            />
          </section>
        </div>
      </div>
    </form>
  );
}
export default ProductForm;
