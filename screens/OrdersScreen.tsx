import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

interface Product {
  _id?: string;
  name: string;
  image?: string;
}

interface Nurse {
  name: string;
  phoneNumber?: string;
}

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  total: number;
  items: Product[];
  nurse?: Nurse;
  assignedNurse?: Nurse;
  paymentMethod?: string;
}

const STATUS_COLORS: Record<string, string> = {
  nurse_assigned: '#2563eb',
  completed: '#22c55e',
  finished: '#22c55e',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  no_nurses_available: '#f59e42',
  searching: '#f59e42',
  pending: '#f59e42',
};

const STATUS_LABELS: Record<string, string> = {
  nurse_assigned: 'Nurse Assigned',
  completed: 'Completed',
  finished: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  no_nurses_available: 'No Nurses Available',
  searching: 'Searching',
  pending: 'Pending',
};

const POLL_INTERVAL = 7000; // 7 seconds

const ACTIVE_STATUSES = ['nurse_assigned', 'pending', 'searching'];
const HISTORY_STATUSES = ['completed', 'finished', 'delivered', 'cancelled', 'no_nurses_available'];

const DUMMY_AVATAR = 'https://ui-avatars.com/api/?name=Nurse&background=cccccc&color=222222&rounded=true&size=96';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const navigation = useNavigation();

  // Polling for live sync
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.request('/orders');
        if (isMounted) setOrders(res.orders || []);
      } catch (err) {
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 120000); // 2 minutes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter(o => HISTORY_STATUSES.includes(o.status));

  const renderOrder = ({ item }: { item: Order }) => {
    const nurse = item.assignedNurse || item.nurse;
    const statusColor = STATUS_COLORS[item.status] || '#64748b';
    const statusLabel = STATUS_LABELS[item.status] || item.status;
    return (
      <View style={styles.cardModern}>
        {/* Header: Nurse, Status, Date */}
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: DUMMY_AVATAR }}
              style={styles.nurseAvatar}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.nurseNameModern}>{nurse?.name || 'Nurse Assigned'}</Text>
              {nurse?.phoneNumber && (
                <Text style={styles.nursePhoneModern}>{nurse.phoneNumber}</Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}> 
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        </View>
        {/* Items */}
        <View style={styles.itemsModernRow}>
          {item.items.map((prod, idx) => (
            <View key={prod._id || idx} style={styles.itemModernChip}>
              <Text style={styles.itemModernEmoji}>{prod.image || '\ud83e\ude7a'}</Text>
              <Text style={styles.itemModernName}>{prod.name}</Text>
            </View>
          ))}
        </View>
        {/* Divider */}
        <View style={styles.dividerModern} />
        {/* Details Row */}
        <View style={styles.detailsModernRow}>
          <View style={styles.detailCol}>
            <MaterialIcons name="payment" size={18} color="#2563eb" />
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{item.paymentMethod || 'N/A'}</Text>
          </View>
          <View style={styles.detailCol}>
            <MaterialIcons name="attach-money" size={18} color="#22c55e" />
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>₹{item.total}</Text>
          </View>
          <View style={styles.detailCol}>
            <MaterialIcons name="event" size={18} color="#64748b" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        {/* Order ID Row */}
        <View style={styles.orderIdRow}>
          <Text style={styles.orderIdLabel}>Order ID:</Text>
          <Text style={styles.orderIdValue}>{item._id}</Text>
        </View>
      </View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
        onPress={() => setTab('active')}
      >
        <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
        onPress={() => setTab('history')}
      >
        <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Order History</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackButton = () => (
    <TouchableOpacity
      style={{ position: 'absolute', left: 10, top: 48, zIndex: 10 }}
              onPress={() => (navigation as any).navigate('MainDrawer', { screen: 'Home' })}
    >
      <Ionicons name="arrow-back" size={28} color="#2563eb" />
    </TouchableOpacity>
  );

  const renderList = (data: Order[]) => (
    <FlatList<Order>
      data={data}
      keyExtractor={item => item._id}
      renderItem={renderOrder}
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Feather name="inbox" size={48} color="#ccc" />
          <Text style={{ color: '#888', marginTop: 12 }}>No orders found</Text>
        </View>
      }
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f8fa' }}>
      <View style={{ minHeight: 48 }} />
      {renderBackButton()}
      <View style={styles.headingRow}>
        <Text style={styles.screenTitle}>My Orders</Text>
      </View>
      {renderTabBar()}
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        tab === 'active' ? renderList(activeOrders) : renderList(historyOrders)
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nurseAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  nurseNameModern: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  nursePhoneModern: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  itemsModernRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 2,
  },
  itemModernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  itemModernEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  itemModernName: {
    fontSize: 14,
    color: '#333',
  },
  dividerModern: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  detailsModernRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginTop: 2,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 4,
  },
  orderIdValue: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: Platform.OS === 'android' ? 24 : 0,
    marginLeft: 12,
    marginBottom: 0,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
});

export default OrdersScreen; 