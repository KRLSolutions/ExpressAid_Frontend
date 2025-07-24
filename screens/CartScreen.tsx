import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';
import ChooseAddressModal from '../components/ChooseAddressModal';
import {

  CFSession,
  CFThemeBuilder,
  CFDropCheckoutPayment,
  CFEnvironment,
  CFPaymentComponentBuilder,
  CFPaymentModes,
  CFErrorResponse
} from 'cashfree-pg-api-contract';
import {
  CFPaymentGatewayService,
} from 'react-native-cashfree-pg-sdk';
import { url } from '../BackendURl';

const TAX_RATE = 0.05;

function getPaymentIcon(method: string) {
  if (method === 'phonepe') return require('../assets/phonepe.png');
  if (method === 'googlepay') return require('../assets/googlepay.png');
  return require('../assets/card.png');
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const route = useRoute<RouteProp<AppDrawerParamList, 'Cart'>>();
  const { cart, setCart, clearCart, getAfterHoursCharge } = useCart();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('phonepe');
  const [selectedAddress, setSelectedAddress] = useState<any>(null); // Local address state with proper typing
  // Remove isFetching state

  // Calculate after-hours charge
  const afterHoursCharge = getAfterHoursCharge();
  // Update subtotal, tax, and total to include after-hours charge
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0) + afterHoursCharge;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // Remove all useFocusEffect, useIsFocused, and isFetching logic
  // Remove the entire useFocusEffect block

  const handleUpdateQty = async (id: string, delta: number) => {
    // Update cart and get the updated cart immediately
    const updatedCart = cart
      .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0);
    
    // Update the cart in context
    setCart(updatedCart);
    
    // Convert frontend cart structure to backend structure
    const backendCart = updatedCart.map(item => ({
      productId: item.id,
      name: item.title,
      quantity: item.qty,
      price: item.price,
      image: item.emoji // Using emoji as image for now
    }));
    
    // Save to backend
    try {
      console.log('Saving cart:', backendCart);
      // const result = await api.saveCart(backendCart); // This line is removed
      console.log('Cart saved successfully: (locally)'); // This line is removed
    } catch (error: any) {
      console.error('Error saving cart:', error);
      const errorMessage = error.message || 'Failed to save cart. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
  };
const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    Alert.alert('Select Address', 'Please select a delivery address before placing the order.');
    return;
  }

  setPlacingOrder(true);

  try {
    const orderAmount = total + afterHoursCharge;

    const payload = {
      orderAmount,
      customerId: 'USER_123',
      customerPhone: selectedAddress?.phoneNumber || '9999999999',
      customerEmail: selectedAddress?.email || 'guest@example.com',
      returnUrl: 'https://yourfrontend.com/payment-success',
    };

    console.log('📦 Sending payload to backend:', payload);

 const response = await fetch(`${url}/cashfree/create-order`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('🎯 Cashfree API Response:', data);

    if (!data.paymentSessionId || !data.orderId) {
      throw new Error('Payment session ID or Order ID not received.');
    }

    const session = new CFSession(
      data.paymentSessionId,
      data.orderId,
      CFEnvironment.SANDBOX
    );

    const theme = new CFThemeBuilder()
      .setNavigationBarBackgroundColor('#6200EE')
      .setNavigationBarTextColor('#ffffff')
      .setButtonBackgroundColor('#6200EE')
      .setButtonTextColor('#ffffff')
      .setPrimaryTextColor('#000000')
      .setSecondaryTextColor('#666666')
      .build();

    const paymentModes = new CFPaymentComponentBuilder()
      .add(CFPaymentModes.CARD)
      .add(CFPaymentModes.UPI)
      // .add(CFPaymentModes.WALLET)
      .add(CFPaymentModes.NB)
      // .add(CFPaymentModes.PAY_LATER)
      .build();

    const dropPayment = new CFDropCheckoutPayment(session, paymentModes, theme);

    CFPaymentGatewayService.setCallback({
      onVerify: (orderId) => {
        console.log('✅ Payment Verified for Order:', orderId);
        Alert.alert('Success', `Payment successful for order: ${orderId}`);
        clearCart();
        navigation.navigate('Home');
      },
      onError: (err: CFErrorResponse, orderId) => {
        console.log('❌ Payment Error:', err.message, orderId);
        Alert.alert('Payment Failed', err.message || 'Unknown error');
      },
    });

    CFPaymentGatewayService.doPayment(dropPayment);

  } catch (error) {
    console.error('💥 Payment error:', error);
    Alert.alert('Order Failed', error.message || 'Could not place order.');
  } finally {
    setPlacingOrder(false);
  }
};


  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.bg}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Cart</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#64748b' }}>Your cart is empty.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.bg}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* selectedAddress && ( // This block is removed
          <View style={[styles.selectedAddressCard, { marginTop: 16 }]}>
            <View style={styles.selectedAddressHeader}>
              <Ionicons name="location-sharp" size={22} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.selectedAddressLabel}>Delivering to</Text>
            </View>
            <Text style={styles.selectedAddressText}>{selectedAddress.address}</Text>
            <TouchableOpacity style={[styles.changeAddressBtnModern, { paddingVertical: 10, paddingHorizontal: 24, minWidth: 100 }]} onPress={() => setAddressModalVisible(true)}>
              <Text style={[styles.changeAddressBtnText, { fontSize: 16 }]}>Change</Text>
            </TouchableOpacity>
          </View>
        ) */}
        {cart.filter(item => item.id !== 'after_hours').map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: '#e0e7ff', borderRadius: 10 }]} onPress={() => handleUpdateQty(item.id, -1)}>
                <Ionicons name="remove" size={22} color="#2563eb" />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: '#2563eb', fontSize: 16 }]}>{item.qty}</Text>
              <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: '#e0e7ff', borderRadius: 10 }]} onPress={() => handleUpdateQty(item.id, 1)}>
                <Ionicons name="add" size={22} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {afterHoursCharge > 0 && (
          <View style={[styles.cartItem, { backgroundColor: '#f8fafc', borderColor: '#e0e7ef' }]}> 
            <Text style={styles.emoji}>🌙</Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: '#b91c1c' }]}>After-Hours Service Charge</Text>
              <Text style={styles.itemSubtitle}>₹200 x number of services (applies for bookings after 9 PM or before 7 AM)</Text>
              <Text style={styles.itemPrice}>₹{afterHoursCharge}</Text>
            </View>
          </View>
        )}
        <View style={styles.billBox}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (5%)</Text>
            <Text style={styles.billValue}>₹{tax}</Text>
          </View>
          <View style={styles.billRowTotal}>
            <Text style={styles.billLabelTotal}>Grand Total</Text>
            <Text style={styles.billValueTotal}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>
      {/* Bottom bar changes after address is selected */}
      {selectedAddress ? (
        <View style={styles.bottomBarModernUpdatedFixed}>
          <TouchableOpacity
            style={[styles.placeOrderBtn, placingOrder && styles.placeOrderBtnDisabled]}
            onPress={()=>handlePlaceOrder()}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.placeOrderBtnText}>Place Order - ₹{total}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomBarCentered}>
          <TouchableOpacity style={styles.addMoreBtnCentered} onPress={() => navigation.navigate('SymptomEntry')}>
            <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.addMoreTextCentered}>Add More Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectAddressBtnCentered} onPress={() => setAddressModalVisible(true)}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.selectAddressTextCentered}>Select Address</Text>
          </TouchableOpacity>
        </View>
      )}
      <ChooseAddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onAddNew={() => setAddressModalVisible(false)}
        onSelect={handleSelectAddress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingLeft: 12,
    paddingBottom: 12,
    height: 90,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  backBtn: {
    width: 44,
    height: 44,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    elevation: 5,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emoji: {
    fontSize: 32,
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 5,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2563eb',
    marginHorizontal: 8,
  },
  billBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    color: '#64748b',
    fontSize: 15,
  },
  billValue: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  billLabelTotal: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
  },
  billValueTotal: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMoreBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginRight: 10,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
  selectAddressBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAddressText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
  selectedAddressCard: {
    backgroundColor: '#f0f6ff',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  selectedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedAddressLabel: {
    fontWeight: 'bold',
    color: '#2563eb',
    fontSize: 15,
  },
  selectedAddressText: {
    color: '#222',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 2,
  },
  changeAddressBtnModern: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 2,
  },
  changeAddressBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 12,
    marginRight: 8,
  },
  paymentText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeOrderBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 12,
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomBarModernUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    borderRadius: 32,
    elevation: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    margin: 18,
    padding: 18,
    minHeight: 80,
  },
  paymentBtnModernUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginRight: 14,
    minWidth: 150,
    justifyContent: 'center',
  },
  paymentTextModernUpdated: {
    color: '#222',
    fontWeight: '700',
    fontSize: 18,
  },
  placeOrderBtnModernUpdated: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 170,
    elevation: 4,
  },
  placeOrderTextModernUpdated: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  bottomBarModernUpdatedFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    elevation: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    margin: 18,
    padding: 18,
    minHeight: 80,
  },
  paymentBtnModernUpdatedFixed: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginRight: 12,
    minWidth: 0,
    justifyContent: 'center',
  },
  paymentTextModernUpdatedFixed: {
    color: '#222',
    fontWeight: '700',
    fontSize: 18,
  },
  placeOrderBtnModernUpdatedFixed: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    elevation: 4,
  },
  placeOrderTextModernUpdatedFixed: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomBarCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    gap: 16, // For React Native 0.71+, otherwise use margin
    marginBottom: 32, // Move the buttons up from the bottom
  },
  addMoreBtnCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5ff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  addMoreTextCentered: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
  selectAddressBtnCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginLeft: 10,
  },
  selectAddressTextCentered: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
});

export default CartScreen; 