import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../CartContext';

interface ViewCartBarProps {
  navigation: any;
  style?: any;
  textStyle?: any;
}

const ViewCartBar: React.FC<ViewCartBarProps> = ({ navigation, style, textStyle }) => {
  const { cart } = useCart();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cart.length) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 14,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cart.length]);

  if (!cart.length) return null;
  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const getCount = () => cart.reduce((a, b) => a + b.qty, 0);
  return (
    <Animated.View style={[styles.cartBar, style, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
      <Pressable style={styles.cartBarInner} onPress={() => navigation.navigate('Cart')} android_ripple={{ color: '#e0e7ff' }}>
        <Text style={styles.cartBarEmoji}>{cart[0]?.emoji}</Text>
        <Text style={[styles.cartBarText, textStyle]}>View cart</Text>
        <Text style={[styles.cartBarCount, textStyle]}>{getCount()} ITEM{getCount() > 1 ? 'S' : ''}</Text>
        <Text style={[styles.cartBarTotal, textStyle]}>₹{getTotal()}</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    paddingHorizontal: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 36,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    minHeight: 28,
  },
  cartBarInner: {
    backgroundColor: '#2563eb',
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 28,
    width: '75%',
    alignSelf: 'center',
    maxWidth: 320,
  },
  cartBarEmoji: {
    fontSize: 20,
    marginRight: 5,
  },
  cartBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 5,
  },
  cartBarCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 5,
  },
  cartBarTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 2,
  },
});

export default ViewCartBar; 