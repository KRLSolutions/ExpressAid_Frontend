import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, Pressable, Animated, Modal, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';

const SYMPTOMS = [
  { id: '1', emoji: '🌡️', title: 'Fever Check', price: 499, subtitle: 'Vitals, doctor call if needed' },
  { id: '2', emoji: '💉', title: 'Injection at Home', price: 499, subtitle: 'IM/IV injection with Rx' },
  { id: '3', emoji: '❤️', title: 'Vitals Monitoring', price: 399, subtitle: 'BP, Pulse, Temperature' },
  { id: '4', emoji: '👴', title: 'Elderly Care', price: 799, subtitle: 'Bedridden, hygiene, mobility' },
  { id: '5', emoji: '🩹', title: 'Wound Dressing', price: 599, subtitle: 'Surgical or injury dressing' },
  { id: '6', emoji: '💧', title: 'IV Drip Setup', price: 699, subtitle: 'With doctor\'s Rx' },
  { id: '7', emoji: '🩸', title: 'Blood Sample Collection', price: 399, subtitle: 'Partner with labs' },
  { id: '8', emoji: '🧾', title: 'Family Wellness Packages', price: 1999, subtitle: 'Annual health check-up visits for all family members. Health education & lifestyle coaching.' },
  { id: '9', emoji: '🧑‍🦽', title: 'Physiotherapy', price: 999, subtitle: 'At-home physiotherapy sessions for pain relief, mobility, and recovery.' },
  { id: '10', emoji: '🔁', title: 'Catheter Change', price: 699, subtitle: 'Male/female catheter handling' },
  { id: '11', emoji: '🧻', title: 'Bedsore Care', price: 599, subtitle: 'Cleaning, dressing, turn support' },
  { id: '12', emoji: '🩺', title: 'Post-Surgery Recovery', price: 899, subtitle: 'Daily care, dressing, vitals' },
  { id: '13', emoji: '🤰', title: 'Pregnancy Injection', price: 499, subtitle: 'Iron, TT, B12 as prescribed' },
  { id: '14', emoji: '👶', title: 'Newborn Check-Up', price: 499, subtitle: 'Infant vitals, hygiene, bath' },
  { id: '15', emoji: '⚕️', title: 'Emergency First Response', price: 999, subtitle: 'Non-ICU prep until ambulance' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 3;

// Define a type for service items
interface ServiceItem {
  id: string;
  emoji: string;
  title: string;
  price: number;
  subtitle: string;
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
    <View style={styles.bg}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#2563eb" style={{ fontWeight: 'bold' }} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', marginLeft: 8 }}>
          <FontAwesome5 name="heartbeat" size={24} color="#2563eb" style={{ marginRight: 8 }} />
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', textShadowColor: 'rgba(37,99,235,0.10)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, letterSpacing: 0.5 }}>Choose a Service</Text>
            <Text style={{ fontSize: 14, color: '#555', marginTop: 2, fontWeight: '500', textAlign: 'center' }}>What do you need help with today?</Text>
          </View>
        </View>
      </View>
      <View style={{ height: 18 }} /> {/* Add vertical spacing below heading */}
      <FlatList
        data={SYMPTOMS}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }: { item: ServiceItem; index: number }) => {
          const qty = cart.find(c => c.id === item.id)?.qty || 0;
          return (
            <Animated.View style={{
              opacity: animValues[index],
              transform: [{ scale: animValues[index].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
            }}>
              <Pressable
                style={({ pressed }) => [styles.cardModern, pressed && { backgroundColor: '#e0e7ff' }]}
                onPress={() => {
                  setSelectedService(item as ServiceItem);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
                {qty > 0 && (
                  <View style={styles.qtyRowModern}>
                    <TouchableOpacity style={styles.qtyBtnModern} onPress={() => removeItem(item.id)}>
                      <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyTextModern}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtnModern} onPress={() => addItem({ id: item.id, emoji: item.emoji, title: item.title, subtitle: item.subtitle, price: item.price })}>
                      <Ionicons name="add" size={20} color="#fff" />
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '85%', alignItems: 'center' }}>
            {selectedService && (
              <>
                <Text style={{ fontSize: 38 }}>{selectedService.emoji}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{selectedService.title}</Text>
                <Text style={{ fontSize: 15, color: '#2563eb', fontWeight: 'bold', marginBottom: 8 }}>₹{selectedService.price}</Text>
                <Text style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>{SERVICE_DETAILS[selectedService.id]}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22, marginRight: 12 }}
                    onPress={() => {
                      if (selectedService) {
                        addItem({ id: selectedService.id, emoji: selectedService.emoji, title: selectedService.title, subtitle: selectedService.subtitle, price: selectedService.price });
                      }
                      setModalVisible(false);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#eee', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      {cart.length > 0 && (
        <Pressable ref={cartBarRef} style={styles.cartBar} onPress={goToCart} android_ripple={{ color: '#e0e7ff' }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    height: 120,
    zIndex: 2,
  },
  headerContent: {
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
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    marginRight: 12,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'left',
    flex: 1,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 120,
  },
  cardModern: {
    backgroundColor: '#f0f6ff',
    borderRadius: 18,
    margin: 4,
    width: CARD_WIDTH,
    alignItems: 'center',
    padding: 14,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  emoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 32,
  },
  cardPrice: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qtyRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtnModern: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 2,
  },
  qtyTextModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginHorizontal: 6,
  },
  cartBar: {
    position: 'absolute',
    left: width * 0.15,
    right: width * 0.15,
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
    maxWidth: width * 0.7,
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

export default SymptomEntryScreen; 