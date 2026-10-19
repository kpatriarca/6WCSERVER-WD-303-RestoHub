const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.error || 'Something went wrong. Please try again.')
  }

  return result
}

export const restaurantService = {
  getRestaurants(params = {}) {
    const query = new URLSearchParams(params)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return request(`/restaurants${suffix}`)
  },

  getRestaurant(id) {
    return request(`/restaurants/${encodeURIComponent(id)}`)
  },

  getMetadata() {
    return request('/restaurants/meta')
  },

  getStats() {
    return request('/stats')
  },

  getBestQuality(limit = 6) {
    return request(`/restaurants/best-quality?limit=${limit}`)
  },

  createRestaurant(data) {
    return request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateRestaurant(id, data) {
    return request(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteRestaurant(id) {
    return request(`/restaurants/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
