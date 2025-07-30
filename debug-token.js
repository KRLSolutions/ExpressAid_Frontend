// Debug script to test token storage and retrieval
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugToken = async () => {
  try {
    console.log('🔍 Debugging token storage...');
    
    // Check all stored values
    const userId = await AsyncStorage.getItem('userId');
    const userToken = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    
    console.log('📱 Stored values:');
    console.log('userId:', userId);
    console.log('userToken:', userToken ? `${userToken.substring(0, 20)}...` : 'null');
    console.log('userData:', userData ? 'exists' : 'null');
    
    if (userToken) {
      console.log('✅ Token exists and is valid');
      return true;
    } else {
      console.log('❌ No token found');
      return false;
    }
  } catch (error) {
    console.error('🚨 Error debugging token:', error);
    return false;
  }
};

export const clearAllTokens = async () => {
  try {
    await AsyncStorage.multiRemove(['userId', 'userToken', 'userData']);
    console.log('🧹 All tokens cleared');
  } catch (error) {
    console.error('🚨 Error clearing tokens:', error);
  }
}; 