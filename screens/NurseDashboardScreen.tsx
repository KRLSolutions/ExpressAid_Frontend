import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../services/api';

interface AvailableOrder {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    image: string;
  }>;
  address: {
    address: string;
    latitude: number;
    longitude: number;
  };
  total: number;
  user: {
    name: string;
    phoneNumber: string;
  };
  createdAt: string;
  notifiedNurses: Array<{
    nurseId: string;
    distance: number;
  }>;
}

const NurseDashboardScreen = () => {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailableOrders = async () => {
    try {
      const response = await api.request('/orders/available');
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this order? You will need to arrive within 15 minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              await api.request(`/orders/${orderId}/accept`, {
                method: 'PATCH'
              });
              Alert.alert('Success', 'Order accepted! Please arrive within 15 minutes.');
              fetchAvailableOrders(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to accept order. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderOrder = ({ item }: { item: AvailableOrder }) => {
    const distance = item.notifiedNurses.find(n => n.nurseId === 'current-nurse-id')?.distance || 0;
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location" size={16} color="#2563eb" />
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Ionicons name="person-circle" size={20} color="#666" />
          <Text style={styles.customerName}>{item.user.name}</Text>
          <Text style={styles.customerPhone}>{item.user.phoneNumber}</Text>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Services:</Text>
          {item.items.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceEmoji}>{service.image}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceQuantity}>x{service.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.addressSection}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.addressText} numberOfLines={2}>
            {item.address.address}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{item.total}</Text>
          </View>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptOrder(item._id)}
          >
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading available orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <TouchableOpacity onPress={() => {
          setRefreshing(true);
          fetchAvailableOrders();
        }}>
          <Ionicons name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="inbox" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No orders available</Text>
          <Text style={styles.emptySubtext}>Check back later for new orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAvailableOrders();
          }}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  customerPhone: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  serviceQuantity: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalAmount: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  acceptButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default NurseDashboardScreen; 