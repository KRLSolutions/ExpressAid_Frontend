import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, Pressable, Animated, Modal, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';

const SYMPTOMS = [
  { id: '1', emoji: '🌡️', title: 'Fever Check', price: 499, subtitle: 'Vitals, doctor call if needed', color: '#FFE4E1', iconColor: '#FF6B6B' },
  { id: '2', emoji: '💉', title: 'Injection at Home', price: 499, subtitle: 'IM/IV injection with Rx', color: '#E8F5E8', iconColor: '#4CAF50' },
  { id: '3', emoji: '❤️', title: 'Vitals Monitoring', price: 399, subtitle: 'BP, Pulse, Temperature', color: '#FFF3E0', iconColor: '#FF9800' },
  { id: '4', emoji: '👴', title: 'Elderly Care', price: 799, subtitle: 'Bedridden, hygiene, mobility', color: '#F3E5F5', iconColor: '#9C27B0' },
  { id: '5', emoji: '🩹', title: 'Wound Dressing', price: 599, subtitle: 'Surgical or injury dressing', color: '#FFF8E1', iconColor: '#FFC107' },
  { id: '6', emoji: '💧', title: 'IV Drip Setup', price: 699, subtitle: 'With doctor\'s Rx', color: '#E3F2FD', iconColor: '#2196F3' },
  { id: '7', emoji: '🩸', title: 'Blood Sample Collection', price: 399, subtitle: 'Partner with labs', color: '#FFEBEE', iconColor: '#F44336' },
  { id: '8', emoji: '🧾', title: 'Family Wellness', price: 1999, subtitle: 'Annual health check-up visits education & life', color: '#E8F5E8', iconColor: '#4CAF50' },
  { id: '9', emoji: '🧑‍🦽', title: 'Physiotherapy', price: 999, subtitle: 'At home physiotherapy sessions for pain relief, mobility and', color: '#F3E5F5', iconColor: '#9C27B0' },
  { id: '10', emoji: '🔁', title: 'Catheter Change', price: 699, subtitle: 'Male/female catheter handling', color: '#E0F2F1', iconColor: '#009688' },
  { id: '11', emoji: '🧻', title: 'Bedsore Care', price: 599, subtitle: 'Cleaning, dressing, turn support', color: '#FFF3E0', iconColor: '#FF9800' },
  { id: '12', emoji: '🩺', title: 'Post-Surgery Recovery', price: 899, subtitle: 'Daily care, dressing, vitals', color: '#E8EAF6', iconColor: '#3F51B5' },
  { id: '13', emoji: '🤰', title: 'Pregnancy Injection', price: 499, subtitle: 'Iron, TT, B12 as prescribed', color: '#FCE4EC', iconColor: '#E91E63' },
  { id: '14', emoji: '👶', title: 'Newborn Check-Up', price: 499, subtitle: 'Infant vitals, hygiene, bath', color: '#E1F5FE', iconColor: '#00BCD4' },
  { id: '15', emoji: '⚕️', title: 'Emergency First Response', price: 999, subtitle: 'Non-ICU prep until ambulance', color: '#FFEBEE', iconColor: '#F44336' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Changed to 2 columns for better alignment

// Define a type for service items
interface ServiceItem {
  id: string;
  emoji: string;
  title: string;
  price: number;
  subtitle: string;
  color: string;
  iconColor: string;
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
    Animated.stagger(60, animValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="heartbeat" size={20} color="#2563eb" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Choose a Service</Text>
              <Text style={styles.subtitle}>What do you need help with today?</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Services Grid */}
      <FlatList
        data={SYMPTOMS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: { item: ServiceItem; index: number }) => {
          const qty = cart.find(c => c.id === item.id)?.qty || 0;
          return (
            <Animated.View style={{
              opacity: animValues[index],
              transform: [{ scale: animValues[index].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
            }}>
              <Pressable
                style={({ pressed }) => [
                  styles.serviceCard,
                  { backgroundColor: item.color },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => {
                  setSelectedService(item as ServiceItem);
                  setModalVisible(true);
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
                  <Text style={styles.serviceEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
                <Text style={[styles.servicePrice, { color: item.iconColor }]}>₹{item.price}</Text>
                
                {qty > 0 && (
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, { backgroundColor: item.iconColor }]} 
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{qty}</Text>
                                         <TouchableOpacity 
                       style={[styles.quantityButton, { backgroundColor: item.iconColor }]} 
                       onPress={() => addItem({ id: item.id, emoji: item.emoji, title: item.title, subtitle: item.subtitle, price: item.price })}
                     >
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {/* Service Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <View style={[styles.modalIconContainer, { backgroundColor: selectedService.iconColor }]}>
                  <Text style={styles.modalEmoji}>{selectedService.emoji}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedService.title}</Text>
                <Text style={[styles.modalPrice, { color: selectedService.iconColor }]}>₹{selectedService.price}</Text>
                <Text style={styles.modalDescription}>{SERVICE_DETAILS[selectedService.id]}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.addButton, { backgroundColor: selectedService.iconColor }]}
                    onPress={() => {
                      if (selectedService) {
                        addItem({ id: selectedService.id, emoji: selectedService.emoji, title: selectedService.title, subtitle: selectedService.subtitle, price: selectedService.price });
                      }
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <Pressable ref={cartBarRef} style={styles.cartBar} onPress={goToCart}>
          <Text style={styles.cartBarEmoji}>{cart[0]?.emoji}</Text>
          <Text style={styles.cartBarText}>View cart</Text>
          <Text style={styles.cartBarCount}>{getCount()} ITEM{getCount() > 1 ? 'S' : ''}</Text>
          <Text style={styles.cartBarTotal}>₹{getTotal()}</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
      )}

      {/* Fly-to-cart animation overlay */}
      {flyAnim && (
        <Animated.View style={{
          position: 'absolute',
          left: flyAnim.x,
          top: flyAnim.y,
          zIndex: 100,
          transform: [
            { translateX: flyValue.interpolate({ inputRange: [0, 1], outputRange: [0, cartBarPos.x - flyAnim.x + 40] }) },
            { translateY: flyValue.interpolate({ inputRange: [0, 1], outputRange: [0, cartBarPos.y - flyAnim.y - 20] }) },
            { scale: flyValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
          ],
                 }}>
          <Text style={{ fontSize: 38 }}>{flyAnim.emoji}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 180,
  },
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
    minHeight: 32,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  addButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 80,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  cartBarEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  cartBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  cartBarCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  cartBarTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
});

export default SymptomEntryScreen; 