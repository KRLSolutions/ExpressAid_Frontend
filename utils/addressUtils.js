import api from '../services/api';

/**
 * Auto-fills missing address fields using reverse geocoding
 * @param {Object} addressData - Current address data with latitude and longitude
 * @returns {Object} - Updated address data with filled fields
 */
export const autoFillAddressFields = async (addressData) => {
  try {
    console.log('🔧 Auto-filling address fields for:', addressData);
    
    // Check if we have coordinates
    if (!addressData.latitude || !addressData.longitude) {
      console.log('⚠️ No coordinates provided for auto-fill');
      return addressData;
    }
    
    // Get reverse geocoded data
    const geocodedData = await api.reverseGeocode(addressData.latitude, addressData.longitude);
    
    // Create updated address data, preserving existing values and filling missing ones
    const updatedAddress = {
      ...addressData,
      // Only fill fields that are empty or missing
      houseNumber: addressData.houseNumber || geocodedData.houseNumber || '',
      floor: addressData.floor || geocodedData.floor || '',
      block: addressData.block || geocodedData.block || '',
      landmark: addressData.landmark || geocodedData.landmark || '',
      city: addressData.city || geocodedData.city || '',
      state: addressData.state || geocodedData.state || '',
      pincode: addressData.pincode || geocodedData.pincode || '',
    };
    
    console.log('✅ Auto-filled address data:', updatedAddress);
    return updatedAddress;
    
  } catch (error) {
    console.error('❌ Error auto-filling address fields:', error);
    // Return original data if auto-fill fails
    return addressData;
  }
};

/**
 * Auto-fills and updates an existing address in the database
 * @param {string} addressId - The ID of the address to update
 * @param {Object} addressData - Current address data
 * @returns {Object} - Updated address data from the server
 */
export const autoFillAndUpdateAddress = async (addressId, addressData) => {
  try {
    console.log('🔄 Auto-filling and updating address:', addressId);
    
    // Auto-fill the address fields
    const filledAddressData = await autoFillAddressFields(addressData);
    
    // Update the address in the database
    const updatedAddress = await api.updateAddress(addressId, filledAddressData);
    
    console.log('✅ Address updated successfully:', updatedAddress);
    return updatedAddress;
    
  } catch (error) {
    console.error('❌ Error auto-filling and updating address:', error);
    throw error;
  }
};

/**
 * Auto-fills all addresses for a user
 * @returns {Array} - Array of updated addresses
 */
export const autoFillAllAddresses = async () => {
  try {
    console.log('🔄 Auto-filling all addresses...');
    
    // Get all addresses
    const addressesResponse = await api.getAddresses();
    const addresses = addressesResponse.addresses || [];
    
    const updatedAddresses = [];
    
    for (const address of addresses) {
      try {
        // Check if address needs auto-filling (has coordinates but missing fields)
        const needsAutoFill = address.latitude && address.longitude && 
          (!address.city || !address.state || !address.pincode);
        
        if (needsAutoFill) {
          console.log(`🔄 Auto-filling address: ${address.name || address.type}`);
          const updatedAddress = await autoFillAndUpdateAddress(address._id, address);
          updatedAddresses.push(updatedAddress);
        } else {
          console.log(`⏭️ Address already complete: ${address.name || address.type}`);
        }
      } catch (error) {
        console.error(`❌ Error auto-filling address ${address._id}:`, error);
      }
    }
    
    console.log(`✅ Auto-filled ${updatedAddresses.length} addresses`);
    return updatedAddresses;
    
  } catch (error) {
    console.error('❌ Error auto-filling all addresses:', error);
    throw error;
  }
};

/**
 * Validates if an address has all required fields
 * @param {Object} addressData - Address data to validate
 * @returns {Object} - Validation result with isValid boolean and missing fields array
 */
export const validateAddress = (addressData) => {
  const requiredFields = ['address', 'city', 'state', 'pincode'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!addressData[field] || addressData[field].trim() === '') {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Formats an address for display
 * @param {Object} addressData - Address data to format
 * @returns {string} - Formatted address string
 */
export const formatAddress = (addressData) => {
  const parts = [];
  
  if (addressData.houseNumber) parts.push(addressData.houseNumber);
  if (addressData.address) parts.push(addressData.address);
  if (addressData.block) parts.push(`Block ${addressData.block}`);
  if (addressData.landmark) parts.push(`Near ${addressData.landmark}`);
  if (addressData.city) parts.push(addressData.city);
  if (addressData.state) parts.push(addressData.state);
  if (addressData.pincode) parts.push(addressData.pincode);
  
  return parts.join(', ');
};

/**
 * Checks if two addresses are the same location (within a small distance)
 * @param {Object} address1 - First address
 * @param {Object} address2 - Second address
 * @param {number} maxDistance - Maximum distance in meters (default: 100)
 * @returns {boolean} - True if addresses are at the same location
 */
export const areAddressesSameLocation = (address1, address2, maxDistance = 100) => {
  if (!address1.latitude || !address1.longitude || !address2.latitude || !address2.longitude) {
    return false;
  }
  
  const distance = calculateDistance(
    address1.latitude, address1.longitude,
    address2.latitude, address2.longitude
  );
  
  return distance <= maxDistance;
};

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}; 