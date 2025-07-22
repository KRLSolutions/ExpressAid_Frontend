import React from 'react';
import { View, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const CashfreePaymentScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { paymentSessionId } = route.params;
  const [placingOrder, setPlacingOrder] = React.useState(false);
  const [webviewError, setWebviewError] = React.useState<string | null>(null);
  const [webviewKey, setWebviewKey] = React.useState(0); // for retry

  // Cashfree hosted checkout URL (sandbox)
  // Format: https://sandbox.cashfree.com/pg/view/payment/{payment_session_id}
  const paymentUrl = `https://sandbox.cashfree.com/pg/view/payment/${paymentSessionId}`;

  console.log('💳 Opening Cashfree payment URL:', paymentUrl);

  const handleNavigationStateChange = async (navState: any) => {
    console.log('🔄 Navigation state changed:', navState.url);
    
    if (navState.url.includes('success')) {
      if (placingOrder) return;
      setPlacingOrder(true);
      Alert.alert('Payment Success', 'Your payment was successful!');
      navigation.navigate('HomeScreen');
    } else if (navState.url.includes('failure')) {
      Alert.alert('Payment Failed', 'Your payment was not successful. Please try again.');
      navigation.goBack();
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    setWebviewError(nativeEvent.description || 'Failed to load payment page.');
  };

  const handleRetry = () => {
    setWebviewError(null);
    setWebviewKey(prev => prev + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      {webviewError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: 'red', fontSize: 16, marginBottom: 16, textAlign: 'center' }}>{webviewError}</Text>
          <TouchableOpacity onPress={handleRetry} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: '#2563eb' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={webviewKey}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default CashfreePaymentScreen; 