import AsyncStorage from '@react-native-async-storage/async-storage';
import performanceMonitor from '../utils/performanceMonitor';
import { url } from '../BackendURl';

const API_BASE_URL = url;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.requestCache = new Map();
    this.pendingRequests = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  // Get auth token from storage
  async getToken() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Retrieved token:', token);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Save auth token to storage
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('userToken', token);
      console.log('Saved token:', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  // Remove auth token from storage
  async removeToken() {
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Check if request is cached and valid
  isCached(endpoint, method = 'GET') {
    const cacheKey = `${method}:${endpoint}`;
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📦 Using cached response for:', cacheKey);
      return cached.data;
    }
    return null;
  }

  // Cache response
  cacheResponse(endpoint, data, method = 'GET') {
    const cacheKey = `${method}:${endpoint}`;
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log('💾 Cached response for:', cacheKey);
  }

  // Clear cache for specific endpoint

  // Check if request is already pending
  isPending(endpoint, method = 'GET') {
    const requestKey = `${method}:${endpoint}`;
    return this.pendingRequests.has(requestKey);
  }

  // Add pending request
  addPendingRequest(endpoint, method = 'GET') {
    const requestKey = `${method}:${endpoint}`;
    this.pendingRequests.set(requestKey, Date.now());
  }

  // Remove pending request
  removePendingRequest(endpoint, method = 'GET') {
    const requestKey = `${method}:${endpoint}`;
    this.pendingRequests.delete(requestKey);
  }

  // Make API request with authentication, caching, and deduplication
  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    
    // Check cache for GET requests
    if (method === 'GET') {
      const cached = this.isCached(endpoint, method);
      if (cached) return cached;
    }

    // Check if request is already pending
    if (this.isPending(endpoint, method)) {
      console.log('⏳ Request already pending for:', `${method}:${endpoint}`);
      // Wait for pending request to complete
      return new Promise((resolve, reject) => {
        const checkPending = () => {
          if (!this.isPending(endpoint, method)) {
            // Retry the request
            this.request(endpoint, options).then(resolve).catch(reject);
          } else {
            setTimeout(checkPending, 100);
          }
        };
        checkPending();
      });
    }

    this.addPendingRequest(endpoint, method);
    
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Using token in request:', token.substring(0, 10) + '...');
    } else {
      console.log('⚠️ No token found for request');
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 Making API request to:', url);
      console.log('📤 Request payload:', options.body ? JSON.parse(options.body) : 'No body');
      
      // Track API call for performance monitoring
      performanceMonitor.trackApiCall(endpoint);
      
      const response = await fetch(url, config);
      console.log('📡 Response status:', response.status);
      
      if (response.status === 401) {
        // Global 401 handler: clear token and user data, reload app
        await AsyncStorage.multiRemove(['userId', 'userToken', 'userData']);
        if (typeof window !== 'undefined')
          // future
          //  window.location.reload();
        throw new Error('Token required');
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      const data = await response.json().catch(() => ({}));
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        console.error('❌ API error:', data);
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Cache successful GET responses
      if (method === 'GET' && response.ok) {
        this.cacheResponse(endpoint, data, method);
      }
      
      return data;
    } catch (error) {
      console.error('🚨 API request error:', error);
      console.error('Error details:', {
        message: error.message,
        endpoint: `${this.baseURL}${endpoint}`
      });
      throw error;
    } finally {
      this.removePendingRequest(endpoint, method);
    }
  }

  // Authentication endpoints
  async sendOTP(phoneNumber) {
    console.log('🔧 Frontend API sendOTP called with phoneNumber:', phoneNumber);
    console.log('🔧 Using frontend API service at:', this.baseURL);
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber, otp) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });

    // Save token and userId after successful verification
    if (response.token && response.userId) {
      await this.saveToken(response.token);
      await AsyncStorage.setItem('userId', response.userId);
      await AsyncStorage.setItem('userToken', response.token);
    }

    return response;
  }

  async updateProfile(name, dateOfBirth) {
    return this.request('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify({ name, dateOfBirth }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User endpoints
  async getAddresses() {
    return this.request('/users/addresses');
  }

  async addAddress(addressData) {
    const response = await this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    // Clear addresses cache after adding new address
    this.clearCache('/users/addresses');
    return response;
  }

  async updateAddress(addressId, addressData) {
    const response = await this.request(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
    // Clear addresses cache after updating
    this.clearCache('/users/addresses');
    return response;
  }

  async deleteAddress(addressId) {
    const response = await this.request(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
    // Clear addresses cache after deleting
    this.clearCache('/users/addresses');
    return response;
  }

  async setDefaultAddress(addressId) {
    const response = await this.request(`/users/addresses/${addressId}/default`, {
      method: 'PATCH',
    });
    // Clear addresses cache after setting default
    this.clearCache('/users/addresses');
    return response;
  }

  // Logout
  async logout() {
    await this.removeToken();
    // Clear all caches on logout
    this.requestCache.clear();
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    if (!token) return false;

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      await this.removeToken();
      return false;
    }
  }

  // Cart endpoints with optimized caching
  async getCart() {
    return this.request('/users/cart');
  }

  async saveCart(cartItems) {
    const response = await this.request('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ cart: cartItems }),
    });
    return response;
  }

  // Cashfree: Create order and get payment session ID
  async createCashfreeOrder({ orderAmount, customerId, customerPhone, customerEmail, returnUrl, paymentMethod }) {
    console.log('🎯 createCashfreeOrder method called with:', {
      orderAmount,
      customerId,
      customerPhone,
      customerEmail,
      returnUrl,
      paymentMethod
    });
    console.log('🔍 paymentMethod value:', paymentMethod);
    console.log('🔍 paymentMethod type:', typeof paymentMethod);
    console.log('🔍 paymentMethod === undefined:', paymentMethod === undefined);
    console.log('🔍 paymentMethod === null:', paymentMethod === null);
    console.log('🔍 paymentMethod === "":', paymentMethod === "");
    
    const payload = {
      orderAmount,
      customerId,
      customerPhone,
      customerEmail,
    };
    // Only add paymentMethod if it's not undefined
    if (paymentMethod !== undefined) {
      payload.paymentMethod = paymentMethod;
      console.log('✅ Added paymentMethod to payload:', paymentMethod);
    } else {
      console.log('❌ paymentMethod is undefined, not adding to payload');
    }
    
    // FORCE FALLBACK: Always ensure we have a payment method
    if (!payload.paymentMethod) {
      payload.paymentMethod = 'phonepe';
      console.log('🔧 FORCED fallback payment method: phonepe');
    }
    
    if (returnUrl) payload.returnUrl = returnUrl;
    
    console.log('📦 Final payload for API:', payload);
    
    return this.request('/cashfree/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async placeOrder(order) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getOrderStatus(orderId) {
    return this.request(`/orders/${orderId}/status`);
  }

  async getDirections(origin, destination) {
    console.log('Frontend getDirections called with:', { origin, destination });
    const res = await fetch(`${this.baseURL}/maps/directions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin, destination }),
    });
    console.log('Directions API response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Directions API error response:', errorText);
      throw new Error('Failed to fetch directions');
    }
    const data = await res.json();
    console.log('Directions API success response:', data);
    return data;
  }

  // Utility function to clear active order from AsyncStorage
  async clearActiveOrder() {
    try {
      await AsyncStorage.removeItem('activeOrder');
      console.log('Active order cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing active order:', error);
    }
  }

  async getActiveOrder() {
    return this.request('/orders/active');
  }

  async finishOrder(orderId) {
    return this.request(`/orders/${orderId}/finish`, {
      method: 'PATCH',
    });
  }

  async completeOrder(orderId) {
    return this.request(`/orders/${orderId}/complete`, {
      method: 'PATCH',
    });
  }

  async deleteProfile() {
    const token = await this.getToken();
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete profile');
    }
    return response.json();
  }

  // Cashfree: Get UPI intent links for a payment session
  async getUpiSessionLinks(paymentSessionId, paymentMethod) {
    return this.request('/cashfree/upi-session', {
      method: 'POST',
      body: JSON.stringify({ paymentSessionId, paymentMethod }),
    });
  }
}

export default new ApiService(); 