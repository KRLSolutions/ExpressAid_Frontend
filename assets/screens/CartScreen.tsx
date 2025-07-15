import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';
import ChooseAddressModal from '../components/ChooseAddressModal';

const initialCart = [
  { id: '1', emoji: '🌡️', title: 'Fever Check', subtitle: 'Vitals, doctor call if needed', price: 499, qty: 1 },
  { id: '4', emoji: '👴', title: 'Elderly Care', subtitle: 'Bedridden, hygiene, mobility', price: 799, qty: 2 },
];

const TAX_RATE = 0.05;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { cart, updateQty } = useCart();
  const [addressModalVisible, setAddressModalVisible] = React.useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

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
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                <Ionicons name="remove" size={20} color="#22c55e" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                <Ionicons name="add" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addMoreBtn} onPress={() => navigation.navigate('SymptomEntry' as keyof AppDrawerParamList)}>
          <Text style={styles.addMoreText}>Add More</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => setAddressModalVisible(true)}>
          <Text style={styles.checkoutText}>Choose Address</Text>
        </TouchableOpacity>
      </View>
      <ChooseAddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onAddNew={() => {
          setAddressModalVisible(false);
          navigation.navigate('AddAddress' as never);
        }}
        onSelect={() => setAddressModalVisible(false)}
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
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#22c55e',
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
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMoreBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 8,
  },
  addMoreText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen; 