import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProductByHandle,
  fetchFeaturedProducts,
  fetchProductStats,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '@/services/productService';
import {
  FrontendProduct,
  CreateProductInput,
  UpdateProductInput,
  StockAdjustmentInput,
} from '@/types/product';
import { QueryParams } from '@/lib/apiClient';
import { STALE_TIME } from '@/lib/queryDefaults';

export const productKeys = {
  all: ['products'] as const,
  list: (params?: QueryParams) => ['products', 'list', params] as const,
  adminList: (params?: QueryParams) => ['products', 'adminList', params] as const,
  stats: ['products', 'stats'] as const,
  featured: (limit?: number) => ['products', 'featured', limit] as const,
  detail: (handleOrId: string) => ['products', 'detail', handleOrId] as const,
  byId: (id: string) => ['products', 'byId', id] as const,
};

/**
 * Hook to fetch all products using TanStack Query
 */
export function useProductsQuery(
  paramsOrInitialData?: QueryParams | FrontendProduct[],
  maybeInitialData?: FrontendProduct[]
) {
  const isArray = Array.isArray(paramsOrInitialData);
  const params = isArray ? undefined : paramsOrInitialData;
  const initialData = isArray ? paramsOrInitialData : maybeInitialData;

  return useQuery({
    queryKey: params ? productKeys.list(params) : productKeys.all,
    queryFn: () => fetchProducts(params),
    initialData,
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Hook to fetch admin paginated products
 */
export function useAdminProductsQuery(params?: QueryParams) {
  return useQuery({
    queryKey: productKeys.adminList(params),
    queryFn: () => getAdminProducts(params),
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook to fetch single product by MongoDB ID
 */
export function useProductQuery(id: string) {
  return useQuery({
    queryKey: productKeys.byId(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Hook to fetch product category statistics
 */
export function useProductStatsQuery() {
  return useQuery({
    queryKey: productKeys.stats,
    queryFn: () => fetchProductStats(),
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Hook to fetch featured products
 */
export function useFeaturedProductsQuery(limit = 10, initialData?: FrontendProduct[]) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => fetchFeaturedProducts(limit),
    initialData,
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Hook to fetch a single product by handle or ID
 */
export function useProductByHandleQuery(handleOrId: string, initialData?: FrontendProduct | null) {
  return useQuery({
    queryKey: productKeys.detail(handleOrId),
    queryFn: () => fetchProductByHandle(handleOrId),
    initialData: initialData ?? undefined,
    enabled: Boolean(handleOrId),
    staleTime: STALE_TIME.STANDARD,
  });
}

function invalidateProductCaches(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: productKeys.all });
  queryClient.invalidateQueries({ queryKey: ['products', 'adminList'] });
  if (id) {
    queryClient.invalidateQueries({ queryKey: productKeys.byId(id) });
  }
  queryClient.invalidateQueries({ queryKey: productKeys.stats });
}

/**
 * Mutation to create a new product
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductInput) => createProduct(payload),
    onSuccess: () => invalidateProductCaches(queryClient),
  });
}

/**
 * Mutation to update an existing product
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductInput }) =>
      updateProduct(id, payload),
    onSuccess: (_, variables) => invalidateProductCaches(queryClient, variables.id),
  });
}

/**
 * Mutation to delete a product
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => invalidateProductCaches(queryClient),
  });
}

/**
 * Mutation to update product stock
 */
export function useUpdateStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockAdjustmentInput }) =>
      updateStock(id, payload),
    onSuccess: (_, variables) => invalidateProductCaches(queryClient, variables.id),
  });
}
