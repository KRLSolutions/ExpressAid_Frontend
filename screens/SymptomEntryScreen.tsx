import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, Pressable, Animated, Modal, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';
import { LinearGradient } from 'expo-linear-gradient';

const SYMPTOMS = [
  { id: '1', emoji: '🌡️', title: 'Fever Check', price: 499, subtitle: 'Vitals, doctor call if needed', color: '#ef4444', bgColor: '#fef2f2' },
  { id: '2', emoji: '💉', title: 'Injection at Home', price: 499, subtitle: 'IM/IV injection with Rx', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: '3', emoji: '❤️', title: 'Vitals Monitoring', price: 399, subtitle: 'BP, Pulse, Temperature', color: '#10b981', bgColor: '#ecfdf5' },
  { id: '4', emoji: '👴', title: 'Elderly Care', price: 799, subtitle: 'Bedridden, hygiene, mobility', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: '5', emoji: '🩹', title: 'Wound Dressing', price: 599, subtitle: 'Surgical or injury dressing', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: '6', emoji: '💧', title: 'IV Drip Setup', price: 699, subtitle: 'With doctor\'s Rx', color: '#06b6d4', bgColor: '#ecfeff' },
  { id: '7', emoji: '🩸', title: 'Blood Sample Collection', price: 399, subtitle: 'Partner with labs', color: '#dc2626', bgColor: '#fef2f2' },
  { id: '8', emoji: '🧾', title: 'Family Wellness Packages', price: 1999, subtitle: 'Annual health check-up visits for all family members. Health education & lifestyle coaching.', color: '#059669', bgColor: '#ecfdf5' },
  { id: '9', emoji: '🧑‍🦽', title: 'Physiotherapy', price: 999, subtitle: 'At-home physiotherapy sessions for pain relief, mobility, and recovery.', color: '#7c3aed', bgColor: '#f5f3ff' },
  { id: '10', emoji: '🔁', title: 'Catheter Change', price: 699, subtitle: 'Male/female catheter handling', color: '#0891b2', bgColor: '#ecfeff' },
  { id: '11', emoji: '🧻', title: 'Bedsore Care', price: 599, subtitle: 'Cleaning, dressing, turn support', color: '#ea580c', bgColor: '#fff7ed' },
  { id: '12', emoji: '🩺', title: 'Post-Surgery Recovery', price: 899, subtitle: 'Daily care, dressing, vitals', color: '#be185d', bgColor: '#fdf2f8' },
  { id: '13', emoji: '🤰', title: 'Pregnancy Injection', price: 499, subtitle: 'Iron, TT, B12 as prescribed', color: '#ec4899', bgColor: '#fdf2f8' },
  { id: '14', emoji: '👶', title: 'Newborn Check-Up', price: 499, subtitle: 'Infant vitals, hygiene, bath', color: '#f97316', bgColor: '#fff7ed' },
  { id: '15', emoji: '⚕️', title: 'Emergency First Response', price: 999, subtitle: 'Non-ICU prep until ambulance', color: '#dc2626', bgColor: '#fef2f2' },
];

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Changed to 2 columns for better presentation

// Define a type for service items
interface ServiceItem {
  id: string;
  emoji: string;
  title: string;
  price: number;
  subtitle: string;
  color: string;
  bgColor: string;
}

const SymptomEntryScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { cart, addItem, removeItem, updateQty } = useCart();

  // Fly-to-cart animation state
  const [flyAnim, setFlyAnim] = useState<{ emoji: string, x: number, y: number } | null>(null);
  const flyValue = useRef(new Animated.Value(0)).current;
  const cartBarRef = useRef<View>(null);
  const [cartBarPos, setCartBarPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Get cart bar position after layout
  useEffect(() => {
    if (cartBarRef.current) {
      cartBarRef.current.measure((fx, fy, width, height, px, py) => {
        setCartBarPos({ x: px, y: py });
      });
    }
  }, [cart.length]);

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const getCount = () => cart.reduce((a, b) => a + b.qty, 0);

  const animValues = useRef(SYMPTOMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(80, animValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Service details text mapping
  const SERVICE_DETAILS: { [key: string]: string } = {
    '1': 'Fever Check: Includes vitals check and doctor call if needed.',
    '2': 'Injection at Home: IM/IV injection with doctor prescription.',
    '3': 'Vitals Monitoring: BP, Pulse, Temperature monitoring at home.',
    '4': 'Elderly Care: Bedridden, hygiene, and mobility support.',
    '5': 'Wound Dressing: Surgical or injury dressing by a nurse.',
    '6': 'IV Drip Setup: IV setup at home with doctor\'s prescription.',
    '7': 'Blood Sample Collection: Home collection, partnered with labs.',
    '8': 'Family Wellness Packages: Annual health check-up visits for all family members. Health education & lifestyle coaching.',
    '9': 'Physiotherapy: At-home physiotherapy sessions for pain relief, mobility, and recovery.',
    '10': 'Catheter Change: Male/female catheter handling by a nurse.',
    '11': 'Bedsore Care: Cleaning, dressing, and turn support for bedsores.',
    '12': 'Post-Surgery Recovery: Daily care, dressing, and vitals monitoring after surgery.',
    '13': 'Pregnancy Injection: Iron, TT, B12 injections as prescribed.',
    '14': 'Newborn Check-Up: Infant vitals, hygiene, and bath support.',
    '15': 'Emergency First Response: Non-ICU emergency prep until ambulance arrives.',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Modern Header */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="medical-bag" size={28} color="#2563eb" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Choose a Service</Text>
              <Text style={styles.subtitle}>What do you need help with today?</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Services Grid */}
      <FlatList
        data={SYMPTOMS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }: { item: ServiceItem; index: number }) => {
          const qty = cart.find(c => c.id === item.id)?.qty || 0;
          return (
            <Animated.View 
              style={[
                styles.cardContainer,
                {
                  opacity: animValues[index],
                  transform: [
                    { 
                      scale: animValues[index].interpolate({ 
                        inputRange: [0, 1], 
                        outputRange: [0.8, 1] 
                      }) 
                    },
                    { 
                      translateY: animValues[index].interpolate({ 
                        inputRange: [0, 1], 
                        outputRange: [50, 0] 
                      }) 
                    }
                  ],
                }
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.serviceCard,
                  { backgroundColor: item.bgColor },
                  pressed && styles.cardPressed
                ]}
                onPress={() => {
                  setSelectedService(item);
                  setModalVisible(true);
                }}
              >
                {/* Service Icon */}
                <View style={[styles.emojiContainer, { backgroundColor: item.color }]}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>

                {/* Service Info */}
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.serviceSubtitle} numberOfLines={3}>{item.subtitle}</Text>
                  <Text style={[styles.servicePrice, { color: item.color }]}>₹{item.price}</Text>
                </View>

                {/* Quantity Controls - Only show if item is in cart */}
                {qty > 0 && (
                  <View style={[styles.quantityContainer, { backgroundColor: item.color }]}>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="remove" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{qty}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => addItem({ 
                        id: item.id, 
                        emoji: item.emoji, 
                        title: item.title, 
                        subtitle: item.subtitle, 
                        price: item.price 
                      })}
                    >
                      <Ionicons name="add" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {/* Enhanced Service Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            {selectedService && (
              <>
                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>

                <View style={[styles.modalHeader, { backgroundColor: selectedService.bgColor }]}>
                  <View style={[styles.modalIconContainer, { backgroundColor: selectedService.color }]}>
                    <Text style={styles.modalEmoji}>{selectedService.emoji}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedService.title}</Text>
                  <Text style={[styles.modalPrice, { color: selectedService.color }]}>₹{selectedService.price}</Text>
                </View>
                
                <View style={styles.modalContent}>
                  <Text style={styles.modalDescription}>{SERVICE_DETAILS[selectedService.id]}</Text>
                  
                  <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: selectedService.color }]}
                    onPress={() => {
                      addItem({ 
                        id: selectedService.id, 
                        emoji: selectedService.emoji, 
                        title: selectedService.title, 
                        subtitle: selectedService.subtitle, 
                        price: selectedService.price 
                      });
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="cart" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Enhanced Cart Bar */}
      {cart.length > 0 && (
        <Animated.View 
          ref={cartBarRef} 
          style={styles.cartBar}
        >
          <Pressable onPress={goToCart} style={styles.cartBarContent}>
            <View style={styles.cartBarLeft}>
              <Text style={styles.cartBarEmoji}>{cart[0]?.emoji}</Text>
              <View style={styles.cartBarInfo}>
                <Text style={styles.cartBarText}>View Cart</Text>
                <Text style={styles.cartBarCount}>{getCount()} item{getCount() > 1 ? 's' : ''}</Text>
              </View>
            </View>
            
            <View style={styles.cartBarRight}>
              <Text style={styles.cartBarTotal}>₹{getTotal()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* Fly-to-cart animation overlay */}
      {flyAnim && (
        <Animated.View style={{
          position: 'absolute',
          left: flyAnim.x,
          top: flyAnim.y,
          zIndex: 1000,
          transform: [
            { translateX: flyValue.interpolate({ inputRange: [0, 1], outputRange: [0, cartBarPos.x - flyAnim.x + 40] }) },
            { translateY: flyValue.interpolate({ inputRange: [0, 1], outputRange: [0, cartBarPos.y - flyAnim.y - 20] }) },
            { scale: flyValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
          ],
        }}>
          <Text style={{ fontSize: 38 }}>{flyAnim.emoji}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    height: 120,
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginRight: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  titleContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textShadowColor: 'rgba(37,99,235,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 24, // Add space between header and cards
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 180,
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 28,
  },
  serviceInfo: {
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 48,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quantityButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginHorizontal: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addToCartText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cartBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 32,
    backgroundColor: '#10b981',
    borderRadius: 28,
    elevation: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  cartBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBarEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cartBarInfo: {
    marginLeft: 4,
  },
  cartBarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cartBarCount: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    fontSize: 14,
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBarTotal: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default SymptomEntryScreen; 