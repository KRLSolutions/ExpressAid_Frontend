import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import * as Linking from 'expo-linking';
import Navigation from './navigation';
import { CartProvider, ActiveOrderProvider, SelectedAddressProvider } from './CartContext';
import { UserStoreProvider } from './store/userStore';
import './i18n';

export default function App() {
  useEffect(() => {
    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 Deep link received:', event.url);
      handleDeepLink(event.url);
    });

    // Handle deep links when app is opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial deep link:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('🔗 Processing deep link:', url);
    
    // Parse the URL to extract parameters
    const parsedUrl = Linking.parse(url);
    console.log('🔗 Parsed URL:', parsedUrl);
    
    // Check if this is a payment return URL
    if (parsedUrl.path === 'payment/return') {
      const orderId = parsedUrl.queryParams?.order_id;
      console.log('🔗 Payment return with order ID:', orderId);
      
      // Here you can handle the payment return
      // For example, navigate to a success screen or check payment status
      // You might want to make an API call to verify the payment status
      
      // For now, just log the return
      console.log('✅ Payment completed, order ID:', orderId);
    }
  };

  return (
    <UserStoreProvider>
      <SelectedAddressProvider>
        <CartProvider>
          <ActiveOrderProvider>
            <PaperProvider>
              <Navigation />
            </PaperProvider>
          </ActiveOrderProvider>
        </CartProvider>
      </SelectedAddressProvider>
    </UserStoreProvider>
  );
}
