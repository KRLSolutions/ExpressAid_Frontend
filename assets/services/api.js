import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.25.144.1:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
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

  // Make API request with authentication
  async request(endpoint, options = {}) {
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
      console.log('Using token in request:', token);
    } else {
      console.log('No token found for request');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async sendOTP(phoneNumber) {
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
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(addressId) {
    return this.request(`/users/addresses/${addressId}/default`, {
      method: 'PATCH',
    });
  }

  // Logout
  async logout() {
    await this.removeToken();
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
}

export default new ApiService(); 