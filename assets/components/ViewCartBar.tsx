import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../CartContext';

interface ViewCartBarProps {
  navigation: any;
}

const ViewCartBar: React.FC<ViewCartBarProps> = ({ navigation }) => {
  const { cart } = useCart();
  if (!cart.length) return null;
  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const getCount = () => cart.reduce((a, b) => a + b.qty, 0);
  return (
    <Pressable style={styles.cartBar} onPress={() => navigation.navigate('Cart')} android_ripple={{ color: '#e0e7ff' }}>
      <Text style={styles.cartBarEmoji}>{cart[0]?.emoji}</Text>
      <Text style={styles.cartBarText}>View cart</Text>
      <Text style={styles.cartBarCount}>{getCount()} ITEM{getCount() > 1 ? 'S' : ''}</Text>
      <Text style={styles.cartBarTotal}>₹{getTotal()}</Text>
      <Ionicons name="chevron-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cartBar: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    bottom: 28,
    backgroundColor: '#2563eb',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    elevation: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minHeight: 38,
    maxWidth: '70%',
    alignSelf: 'center',
  },
  cartBarEmoji: {
    fontSize: 22,
    marginRight: 7,
  },
  cartBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 7,
  },
  cartBarCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 7,
  },
  cartBarTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 4,
  },
});

export default ViewCartBar; 