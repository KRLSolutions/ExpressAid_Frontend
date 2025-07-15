import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Pressable, Dimensions } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AppDrawerParamList } from '../navigation/AppStack';
import { useCart } from '../CartContext';
import ViewCartBar from '../components/ViewCartBar';

const ICONS = [
  { name: 'stethoscope', label: 'Doctor', iconLib: FontAwesome5 },
  { name: 'local-pharmacy', label: 'Pharmacy', iconLib: MaterialCommunityIcons },
  { name: 'home-city', label: 'Hospital', iconLib: MaterialCommunityIcons },
  { name: 'ambulance', label: 'Ambulance', iconLib: MaterialCommunityIcons },
];

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  userData?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userData }) => {
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();
  const { cart } = useCart();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const goToSymptomEntry = () => {
    navigation.navigate('SymptomEntry');
  };

  // Extract first name from full name
  const getFirstName = (fullName: string) => {
    return fullName ? fullName.split(' ')[0] : 'User';
  };

  return (
    <View style={styles.bg}>
      {/* Top Bar - absolutely positioned */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {`Welcome ${getFirstName(userData?.name || 'User')}\nBook a nurse in 10 mins`}
          </Text>
        </View>
        <Pressable style={styles.searchWrap} onPress={goToSymptomEntry} android_ripple={{ color: '#e0e7ff' }}>
          <Ionicons name="search" size={22} color="#94a3b8" style={{ marginLeft: 16 }} />
          <Text style={styles.searchInput}>Book a Nurse in 10 Mins</Text>
        </Pressable>
        <View style={styles.iconRow}>
          {ICONS.map((item, idx) => {
            const IconLib = item.iconLib;
            return (
              <View key={item.label} style={styles.iconBtnWrap}>
                <TouchableOpacity style={styles.iconBtn}>
                  <IconLib name={item.name} size={30} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.iconLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {/* View Cart Bar at the bottom if cart has items */}
      <ViewCartBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 60,
    left: 0,
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 10,
  },
  menuBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  notifBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: Platform.OS === 'android' ? 270 : 140, // move content up, below top bar
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 44,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    lineHeight: 44,
    textShadowColor: 'rgba(37,99,235,0.18)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 16,
    elevation: 10,
    letterSpacing: 0.5,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '88%',
    height: 56,
    marginBottom: 36,
    elevation: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#94a3b8',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 10,
    marginRight: 16,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    marginBottom: 24,
    alignSelf: 'center',
  },
  iconBtnWrap: {
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  iconLabel: {
    color: '#222',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default HomeScreen; 