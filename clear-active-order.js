// Utility script to clear active order from AsyncStorage
// Run this in your React Native app console or as a temporary button

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearActiveOrder = async () => {
  try {
    await AsyncStorage.removeItem('activeOrder');
    console.log('✅ Active order cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('❌ Error clearing active order:', error);
    return false;
  }
};

// Usage in React Native console:
// import { clearActiveOrder } from './clear-active-order';
// clearActiveOrder();

export default clearActiveOrder; 