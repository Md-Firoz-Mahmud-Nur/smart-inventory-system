/* eslint-disable @typescript-eslint/no-explicit-any */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: any,
  ) {
    super(message);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      response.status,
      data.message || "An error occurred",
      data.errors,
    );
  }

  return data;
}

export const apiClient = {
  // Auth
  signup: (payload: { email: string; password: string; name: string }) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => request("/api/auth/logout", { method: "POST" }),

  // Products
  getProducts: (filters?: { status?: string; categoryId?: string }) => {
    const params = new URLSearchParams(filters as any);
    return request(`/api/products?${params.toString()}`);
  },

  getProduct: (id: string) => request(`/api/products/${id}`),

  createProduct: (payload: any) =>
    request("/api/products", { method: "POST", body: JSON.stringify(payload) }),

  updateProduct: (id: string, payload: any) =>
    request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: string) =>
    request(`/api/products/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/api/categories"),

  getCategory: (id: string) => request(`/api/categories/${id}`),

  createCategory: (payload: { name: string; description?: string }) =>
    request("/api/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (id: string, payload: any) =>
    request(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: string) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (filters?: { status?: string }) => {
    const params = new URLSearchParams(filters as any);
    return request(`/api/orders?${params.toString()}`);
  },

  getOrder: (id: string) => request(`/api/orders/${id}`),

  createOrder: (payload: {
    items: { productId: string; quantity: number }[];
  }) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),

  updateOrderStatus: (id: string, payload: { status: string }) =>
    request(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  cancelOrder: (id: string) =>
    request(`/api/orders/${id}`, { method: "DELETE" }),

  // Restock Queue
  getRestockQueue: (filters?: { status?: string; priority?: string }) => {
    const params = new URLSearchParams(filters as any);
    return request(`/api/restock-queue?${params.toString()}`);
  },

  addToRestockQueue: (payload: {
    productId: string;
    quantity: number;
    priority?: string;
  }) =>
    request("/api/restock-queue", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removeFromRestockQueue: (id: string) =>
    request(`/api/restock-queue/${id}`, { method: "DELETE" }),

  updateRestockStatus: (id: string, payload: { status: string }) =>
    request(`/api/restock-queue/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Activity Log
  getActivityLog: (filters?: {
    actionType?: string;
    limit?: number;
    targetId?: string;
  }) => {
    const params = new URLSearchParams(filters as any);
    return request(`/api/activity-log?${params.toString()}`);
  },
};
