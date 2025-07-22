import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveOrder } from '../CartContext';

interface ViewActiveOrderBarProps {
  navigation: any;
  style?: any;
  textStyle?: any;
}

const ViewActiveOrderBar: React.FC<ViewActiveOrderBarProps> = ({ navigation, style, textStyle }) => {
  const { activeOrder, refreshActiveOrder, finishActiveOrder } = useActiveOrder();
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Check if active order still exists in database when component mounts
  useEffect(() => {
    if (
      activeOrder?.orderId &&
      !['finished', 'completed', 'cancelled', 'timeout'].includes(activeOrder.status)
    ) {
      refreshActiveOrder();
    }
  }, []); // Only run once when component mounts

  useEffect(() => {
    if (activeOrder && activeOrder.status === 'nurse_assigned') {
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
  }, [activeOrder?.orderId, activeOrder?.status]);

  if (!activeOrder || ['finished','completed','cancelled','timeout'].includes(activeOrder.status)) return null;

  return (
    <Animated.View style={[styles.orderBar, style, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}> 
      <Pressable style={styles.orderBarInner} onPress={() => navigation.navigate('SearchingForNurseScreen', { orderId: activeOrder.orderId || activeOrder._id })} android_ripple={{ color: '#e0e7ff' }}>
        <Ionicons name="medkit" size={14} color="#fff" style={{ marginRight: 5 }} />
        <Text style={[styles.orderBarText, textStyle]}>Track your nurse</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  orderBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 86, // slightly above the cart bar, moved up
    paddingHorizontal: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 36,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    minHeight: 24,
  },
  orderBarInner: {
    backgroundColor: '#4CAF50',
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 28,
    width: '75%',
    alignSelf: 'center',
    maxWidth: 320,
  },
  orderBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
});

export default ViewActiveOrderBar; 