// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    ...options.headers,
  }
  const isFormData = options.body instanceof FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const errorMessage =
        errorBody.message || errorBody.error || `HTTP Error: ${response.status}`
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// ========== PRODUCTS API ==========
export const productsAPI = {
  // Get all products with pagination
  getAll: async (page = 1, limit = 10) => {
    return apiCall(`/products?page=${page}&limit=${limit}`)
  },

  // Get product by ID
  getById: async (id) => {
    return apiCall(`/products/${id}`)
  },

  // Search products
  search: async (query) => {
    return apiCall(`/products/search?q=${encodeURIComponent(query)}`)
  },

  // Create product (admin only)
  create: async (productData) => {
    const hasFile = productData && productData.imageFile instanceof File
    if (hasFile) {
      const formData = new FormData()
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'imageFile') return
        if (key === 'sizes') {
          formData.append('sizes', JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })
      formData.append('image', productData.imageFile)
      return apiCall("/products", {
        method: "POST",
        body: formData,
      })
    }
    return apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  // Update product (admin only)
  update: async (id, productData) => {
    const hasFile = productData && productData.imageFile instanceof File
    if (hasFile) {
      const formData = new FormData()
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'imageFile') return
        if (key === 'sizes') {
          formData.append('sizes', JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })
      formData.append('image', productData.imageFile)
      return apiCall(`/products/${id}`, {
        method: "PUT",
        body: formData,
      })
    }
    return apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  // Delete product (admin only)
  delete: async (id) => {
    return apiCall(`/products/${id}`, {
      method: "DELETE",
    })
  },

  // Add review to product
  addReview: async (id, reviewData) => {
    return apiCall(`/products/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  },
}

// ========== ORDERS API ==========
export const ordersAPI = {
  // Create new order
  create: async (orderData) => {
    return apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  },

  // Get all orders (admin)
  getAll: async () => {
    return apiCall("/orders")
  },

  // Get order by ID
  getById: async (id) => {
    return apiCall(`/orders/${id}`)
  },

  // Get order by order number
  getByOrderNumber: async (orderNumber) => {
    return apiCall(`/orders/number/${orderNumber}`)
  },

  // Update order status (admin)
  updateStatus: async (id, status) => {
    return apiCall(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },

  // Cancel order
  cancel: async (id) => {
    return apiCall(`/orders/${id}/cancel`, {
      method: "POST",
    })
  },
}

// ========== PAYMENT API ==========
export const paymentAPI = {
  // Initialize mock payment
  initialize: async (payload) => {
    return apiCall("/payment/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}

// ========== CONTACT API ==========
export const contactAPI = {
  send: async (payload) => {
    return apiCall("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}

// ========== HEALTH CHECK ==========
export const healthCheck = async () => {
  try {
    return await apiCall("/health")
  // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    console.error("Backend is not available")
    return null
  }
}

export default {
  productsAPI,
  ordersAPI,
  paymentAPI,
  contactAPI,
  healthCheck,
}
