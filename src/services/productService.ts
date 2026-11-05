import { cache } from 'react';
import { apiClient, QueryParams } from '@/lib/apiClient';
import {
  FrontendProduct,
  BackendProduct,
  ProductCategoryStats,
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentInput,
} from '@/types/product';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';

export { mapProductToFrontend } from './productMapper';
import { mapProductToFrontend } from './productMapper';

/**
 * Fetch all products from backend with optional filters and search
 */
export const fetchProducts = cache(async (params?: QueryParams): Promise<FrontendProduct[]> => {
  try {
    const response = await apiClient.get<
      | ApiResponse<{ products: BackendProduct[] }>
      | PaginatedApiResponse<{ products: BackendProduct[] }>
      | BackendProduct[]
    >('/products', { params });

    let products: BackendProduct[] = [];
    if (response && 'data' in response && response.data && 'products' in response.data) {
      products = response.data.products;
    } else if (Array.isArray(response)) {
      products = response;
    }

    return products.map(mapProductToFrontend);
  } catch (error) {
    console.warn(
      'Could not fetch products from backend:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
});

/**
 * Fetch a single product by its slug or MongoDB ID
 */
export const fetchProductByHandle = cache(
  async (handleOrId: string): Promise<FrontendProduct | null> => {
    try {
      // 1) Try fetching by slug first
      try {
        const res = await apiClient.get<ApiResponse<{ product: BackendProduct }>>(
          `/products/slug/${encodeURIComponent(handleOrId)}`
        );

        if (res?.data?.product) {
          return mapProductToFrontend(res.data.product);
        }
      } catch (slugError: unknown) {
        // If 404, fallback to ID lookup
        const status = (slugError as { status?: number })?.status;
        if (status !== 404) {
          console.warn(`Slug lookup failed for ${handleOrId}, trying ID lookup...`);
        }
      }

      // 2) Fallback to fetching by ID
      const resById = await apiClient.get<ApiResponse<{ product: BackendProduct }>>(
        `/products/${encodeURIComponent(handleOrId)}`
      );

      if (resById?.data?.product) {
        return mapProductToFrontend(resById.data.product);
      }

      return null;
    } catch (error) {
      console.warn(
        `Could not fetch product ${handleOrId} from backend:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }
);

/**
 * Fetch featured products from backend
 */
export const fetchFeaturedProducts = cache(async (limit = 10): Promise<FrontendProduct[]> => {
  try {
    const response = await apiClient.get<ApiResponse<{ products: BackendProduct[] }>>(
      '/products/featured',
      { params: { limit } }
    );

    const products = response?.data?.products || [];
    return products.map(mapProductToFrontend);
  } catch (error) {
    console.warn(
      'Could not fetch featured products from backend:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
});

/**
 * Fetch product statistics (categories, counts, etc.)
 */
export const fetchProductStats = cache(async (): Promise<ProductCategoryStats[]> => {
  try {
    const response =
      await apiClient.get<ApiResponse<{ stats: ProductCategoryStats[] }>>('/products/stats');

    return response?.data?.stats || [];
  } catch (error) {
    console.warn(
      'Could not fetch product stats from backend:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
});

/**
 * Fetch raw BackendProduct by ID
 */
export async function getProductById(id: string): Promise<BackendProduct> {
  const response = await apiClient.get<ApiResponse<{ product: BackendProduct }>>(
    `/products/${encodeURIComponent(id)}`
  );
  return response.data.product;
}

/**
 * Fetch paginated backend products for admin table
 */
export async function getAdminProducts(params?: QueryParams): Promise<{
  products: BackendProduct[];
  total: number;
  page: number;
  limit: number;
}> {
  const response = await apiClient.get<
    ApiResponse<{ products: BackendProduct[]; total?: number; page?: number; limit?: number }>
  >('/products', { params });

  const data = response?.data;
  const products = data?.products || [];
  const total = data?.total ?? products.length;
  const page = data?.page ?? 1;
  const limit = data?.limit ?? products.length;

  return { products, total, page, limit };
}

/**
 * Create a new product
 */
export async function createProduct(payload: CreateProductInput): Promise<BackendProduct> {
  const response = await apiClient.post<ApiResponse<{ product: BackendProduct }>>(
    '/products',
    payload
  );
  return response.data.product;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  payload: UpdateProductInput
): Promise<BackendProduct> {
  const response = await apiClient.patch<ApiResponse<{ product: BackendProduct }>>(
    `/products/${encodeURIComponent(id)}`,
    payload
  );
  return response.data.product;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${encodeURIComponent(id)}`);
}

/**
 * Atomically adjust product stock
 */
export async function updateStock(
  id: string,
  payload: StockAdjustmentInput
): Promise<BackendProduct> {
  const response = await apiClient.patch<ApiResponse<{ product: BackendProduct }>>(
    `/products/${encodeURIComponent(id)}/stock`,
    payload
  );
  return response.data.product;
}
