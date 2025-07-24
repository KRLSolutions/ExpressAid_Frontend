import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import SymptomEntryScreen from '../screens/SymptomEntryScreen';
import CartScreen from '../screens/CartScreen';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AddAddressScreen from '../screens/AddAddressScreen';
import { createStackNavigator } from '@react-navigation/stack';
import SelectAddressScreen from '../screens/SelectAddressScreen';
import SearchingForNurseScreen from '../screens/SearchingForNurseScreen';
import NurseAssignedScreen from '../screens/NurseAssignedScreen';
import OrdersScreen from '../screens/OrdersScreen';
import InviteFriendsScreen from '../screens/InviteFriendsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import SupportScreen from '../screens/SupportScreen';
import FAQScreen from '../screens/FAQScreen';
import DeleteProfileScreen from '../screens/DeleteProfileScreen';
import SelectPaymentMethodScreen from '../screens/SelectPaymentMethodScreen';
import CardEntryScreen from '../screens/CardEntryScreen';
import UPIIDEntryScreen from '../screens/UPIIDEntryScreen';
import CashfreePaymentScreen from '../screens/CashfreePaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';

type AppStackProps = {
  userData: any;
  onLogout: () => void;
};

function CustomDrawerContent({ navigation, userData, onLogout }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' }}>
      {/* Profile Section */}
      <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: '#e0f2fe', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 16,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#2563eb' }}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#222', marginBottom: 4, textAlign: 'center' }}>
          {userData?.name || 'User'}
        </Text>
        <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
          {userData?.phoneNumber || 'No phone'}
        </Text>
      </View>
      
      {/* Menu Items */}
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'flex-start', marginTop: 0 }}>
        <DrawerItem icon={<Feather name="list" size={24} color="#2563eb" />} label="Orders" onPress={() => navigation.navigate('Orders')} />
        <DrawerItem icon={<Feather name="user-plus" size={24} color="#2563eb" />} label="Invite Friends" onPress={() => navigation.navigate('InviteFriends')} />
        <DrawerItem icon={<Ionicons name="notifications-outline" size={24} color="#2563eb" />} label="Notification" onPress={() => navigation.navigate('Notifications')} />
        <DrawerItem icon={<Feather name="info" size={24} color="#2563eb" />} label="About us" onPress={() => navigation.navigate('AboutUs')} />
        <DrawerItem icon={<Feather name="headphones" size={24} color="#2563eb" />} label="Support" onPress={() => navigation.navigate('Support')} />
        <DrawerItem icon={<Feather name="help-circle" size={24} color="#2563eb" />} label="FAQ" onPress={() => navigation.navigate('FAQ')} />
      </View>
      
      {/* Delete Profile and Logout Buttons at the bottom */}
      <View style={{ padding: 24, paddingBottom: 40 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            width: '100%',
            borderWidth: 1,
            borderColor: '#ff3b30',
            marginBottom: 12,
          }}
          onPress={() => navigation.navigate('DeleteProfile')}
        >
          <Text style={{ color: '#ff3b30', fontWeight: 'bold', fontSize: 16 }}>Delete Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            width: '100%',
            elevation: 4,
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          onPress={onLogout}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DrawerItem({ icon, label, onPress, large }: { icon: React.ReactNode; label: string; onPress: () => void; large?: boolean }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 4,
      }}
      activeOpacity={0.7}
    >
      <View style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#f0f9ff', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginRight: 16,
      }}>
        {icon}
      </View>
      <Text style={{ 
        fontSize: 16, 
        color: '#374151', 
        fontWeight: '500',
        flex: 1,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export type AppDrawerParamList = {
  Home: undefined;
  SymptomEntry: undefined;
  Cart: { selectedPaymentMethod?: string };
  Orders: undefined;
  InviteFriends: undefined;
  Notifications: undefined;
  AboutUs: undefined;
  Support: undefined;
  FAQ: undefined;
  DeleteProfile: { onLogout: () => void };
  SearchingForNurseScreen: { orderId: string };
  SelectPaymentMethodScreen: { 
    selectedMethod?: string; 
    returnTo: string; 
    orderAmount?: number;
    transactionRef?: string;
    upiUrl?: string;
  };
  CardEntryScreen: { returnTo: string };
  UPIIDEntryScreen: { returnTo: string };
  CashfreePaymentScreen: { paymentSessionId: string };
  PaymentSuccessScreen: { amount: number; orderId: string };
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();
const Stack = createStackNavigator();

const MainDrawer = ({ userData, onLogout }: AppStackProps) => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: false,
      drawerType: 'slide',
      overlayColor: 'rgba(0,0,0,0.1)',
      drawerStyle: { width: 260 },
    }}
    drawerContent={props => <CustomDrawerContent {...props} userData={userData} onLogout={onLogout} />}
  >
    <Drawer.Screen name="Home">
      {props => <HomeScreen {...props} userData={userData} />}
    </Drawer.Screen>
    <Drawer.Screen name="SymptomEntry" component={SymptomEntryScreen} />
    <Drawer.Screen name="Cart" component={CartScreen} />
    <Drawer.Screen name="Orders" component={OrdersScreen} />
    <Drawer.Screen name="InviteFriends" component={InviteFriendsScreen} />
    <Drawer.Screen name="Notifications" component={NotificationsScreen} />
    <Drawer.Screen name="AboutUs" component={AboutUsScreen} />
    <Drawer.Screen name="Support" component={SupportScreen} />
    <Drawer.Screen name="FAQ" component={FAQScreen} />
    <Drawer.Screen name="DeleteProfile">
      {props => <DeleteProfileScreen {...props} onLogout={onLogout} />}
    </Drawer.Screen>
  </Drawer.Navigator>
);

const AppStack: React.FC<AppStackProps> = ({ userData, onLogout }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainDrawer">
      {props => <MainDrawer {...props} userData={userData} onLogout={onLogout} />}
    </Stack.Screen>
    <Stack.Screen name="AddAddress" component={AddAddressScreen} />
    <Stack.Screen name="SelectAddress" component={SelectAddressScreen} />
    <Stack.Screen name="SelectPaymentMethodScreen" component={SelectPaymentMethodScreen} />
    <Stack.Screen name="CardEntryScreen" component={CardEntryScreen} />
    <Stack.Screen name="UPIIDEntryScreen" component={UPIIDEntryScreen} />
    <Stack.Screen name="CashfreePaymentScreen" component={CashfreePaymentScreen} />
    <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
    <Stack.Screen name="SearchingForNurseScreen" component={SearchingForNurseScreen} />
    <Stack.Screen name="NurseAssignedScreen" component={NurseAssignedScreen} />
    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
});

export default AppStack; 