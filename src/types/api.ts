export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: T;
  message?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginatedApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  results: number;
  pagination: ApiPagination;
  data: T;
}

export interface ApiErrorResponse {
  status: 'fail' | 'error';
  message: string;
  error?: unknown;
  stack?: string;
}
