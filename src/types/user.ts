export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserAddress {
  _id?: string;
  label: string; // e.g. 'Home', 'Office'
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  role?: UserRole;
  search?: string;
}

export interface UsersResult {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  results: number;
}
