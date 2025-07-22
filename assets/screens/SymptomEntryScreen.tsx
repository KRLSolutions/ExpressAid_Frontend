import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
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
  { id: '8', emoji: '🫁', title: 'Nebulization', price: 399, subtitle: 'Nurse-administered, needs machine' },
  { id: '9', emoji: '🔁', title: 'Catheter Change', price: 699, subtitle: 'Male/female catheter handling' },
  { id: '10', emoji: '🧻', title: 'Bedsore Care', price: 599, subtitle: 'Cleaning, dressing, turn support' },
  { id: '11', emoji: '🩺', title: 'Post-Surgery Recovery', price: 899, subtitle: 'Daily care, dressing, vitals' },
  { id: '12', emoji: '🤰', title: 'Pregnancy Injection', price: 499, subtitle: 'Iron, TT, B12 as prescribed' },
  { id: '13', emoji: '👶', title: 'Newborn Check-Up', price: 499, subtitle: 'Infant vitals, hygiene, bath' },
  { id: '14', emoji: '💊', title: 'Medicine Reminder Support', price: 399, subtitle: 'Elderly med timing assist' },
  { id: '15', emoji: '🧼', title: 'Hygiene Support (Bed Bath)', price: 599, subtitle: 'Bedridden/elderly hygiene' },
  { id: '16', emoji: '🧪', title: 'Urine/Swab Sample', price: 399, subtitle: 'For UTI or lab tests' },
  { id: '17', emoji: '🧠', title: 'Mental Health Visit', price: 599, subtitle: 'Observation + doctor call' },
  { id: '18', emoji: '⚕️', title: 'Emergency First Response', price: 999, subtitle: 'Non-ICU prep until ambulance' },
  { id: '19', emoji: '🧾', title: 'Follow-Up Visit (Nurse)', price: 399, subtitle: 'Repeat or next-day visit' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 3;

const SymptomEntryScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { cart, addItem, removeItem, updateQty } = useCart();

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const getCount = () => cart.reduce((a, b) => a + b.qty, 0);

  return (
    <View style={styles.bg}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#2563eb" style={{ fontWeight: 'bold' }} />
        </TouchableOpacity>
        <Text style={styles.title}>Please Select Your Symptoms</Text>
      </View>
      <FlatList
        data={SYMPTOMS}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const qty = cart.find(c => c.id === item.id)?.qty || 0;
          return (
            <View style={styles.card}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
              {qty === 0 ? (
                <TouchableOpacity style={styles.addBtn} onPress={() => addItem({ id: item.id, emoji: item.emoji, title: item.title, subtitle: item.subtitle, price: item.price })}>
                  <Text style={styles.addBtnText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                    <Ionicons name="remove" size={20} color="#2563eb" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem({ id: item.id, emoji: item.emoji, title: item.title, subtitle: item.subtitle, price: item.price })}>
                    <Ionicons name="add" size={20} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
      {cart.length > 0 && (
        <Pressable style={styles.cartBar} onPress={goToCart} android_ripple={{ color: '#e0e7ff' }}>
          <Text style={styles.cartBarEmoji}>{cart[0]?.emoji}</Text>
          <Text style={styles.cartBarText}>View cart</Text>
          <Text style={styles.cartBarCount}>{getCount()} ITEM{getCount() > 1 ? 'S' : ''}</Text>
          <Text style={styles.cartBarTotal}>₹{getTotal()}</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
      )}
    </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 4,
    width: CARD_WIDTH,
    alignItems: 'center',
    padding: 14,
    elevation: 7,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  addBtn: {
    borderColor: '#2563eb',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 6,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  addBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2563eb',
    marginHorizontal: 8,
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