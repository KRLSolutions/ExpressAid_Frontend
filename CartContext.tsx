import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './services/api';
import { useRef } from 'react';

export interface CartItem {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  price: number;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  getAfterHoursCharge: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

// --- Active Order Context ---
export interface ActiveOrder {
  orderId: string;
  _id?: string;
  status: string;
  assignedNurse?: any;
  createdAt?: string;
  acceptedAt?: string;
}

interface ActiveOrderContextType {
  activeOrder: ActiveOrder | null;
  setActiveOrder: (order: ActiveOrder | null) => void;
  clearActiveOrder: () => void;
  refreshActiveOrder: () => Promise<void>;
  finishActiveOrder: () => Promise<void>;
}

const ActiveOrderContext = createContext<ActiveOrderContextType | undefined>(undefined);

export const useActiveOrder = () => {
  const ctx = useContext(ActiveOrderContext);
  if (!ctx) throw new Error('useActiveOrder must be used within an ActiveOrderProvider');
  return ctx;
};

export const ActiveOrderProvider = ({ children }: { children: ReactNode }) => {
  const [activeOrder, setActiveOrderState] = useState<ActiveOrder | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const refreshCooldown = 5000; // 5 seconds cooldown between refreshes

  useEffect(() => {
    // On mount, fetch from backend only if authenticated
    const fetchActive = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('🔐 No token found, skipping active order fetch');
          return;
        }
        
        const res = await apiService.getActiveOrder();
        if (res && res.order) setActiveOrderState(res.order);
        else setActiveOrderState(null);
      } catch (error) {
        console.error('❌ Error fetching active order:', error);
        if (error instanceof Error && error.message && error.message.includes('Token required')) {
          console.log('🔐 Authentication required, user may need to log in');
        } else {
          setActiveOrderState(null);
        }
      }
    };
    fetchActive();
  }, []);

  const setActiveOrder = (order: ActiveOrder | null) => {
    setActiveOrderState(order);
    if (order) {
      AsyncStorage.setItem('activeOrder', JSON.stringify(order));
    } else {
      AsyncStorage.removeItem('activeOrder');
    }
  };

  const clearActiveOrder = () => setActiveOrder(null);

  const refreshActiveOrder = async () => {
    const now = Date.now();
    if (now - lastRefreshTime.current < refreshCooldown) {
      console.log('⏰ Active order refresh skipped - cooldown period');
      return;
    }
    
    lastRefreshTime.current = now;
    try {
      console.log('🔄 Refreshing active order...');
      const res = await apiService.getActiveOrder();
      if (res && res.order) setActiveOrderState(res.order);
      else setActiveOrderState(null);
    } catch (error) {
      console.error('❌ Error refreshing active order:', error);
      // Don't set activeOrder to null on auth errors, just log them
      if (error instanceof Error && error.message && error.message.includes('Token required')) {
        console.log('🔐 Authentication required for active order, user may need to log in');
      } else {
        setActiveOrderState(null);
      }
    }
  };

  // New: finish the active order
  const finishActiveOrder = async () => {
    if (!activeOrder?.orderId && !activeOrder?._id) return;
    const id = activeOrder.orderId || activeOrder._id;
    try {
      await apiService.finishOrder(id);
      setActiveOrderState(null);
      AsyncStorage.removeItem('activeOrder');
    } catch {}
  };

  return (
    <ActiveOrderContext.Provider value={{ activeOrder, setActiveOrder, clearActiveOrder, refreshActiveOrder, finishActiveOrder }}>
      {children}
    </ActiveOrderContext.Provider>
  );
};

// --- Selected Address Context ---
interface SelectedAddressContextType {
  selectedAddress: any;
  setSelectedAddress: (address: any) => void;
  clearSelectedAddress: () => void;
}

const SelectedAddressContext = createContext<SelectedAddressContextType | undefined>(undefined);

export const useSelectedAddress = () => {
  const ctx = useContext(SelectedAddressContext);
  if (!ctx) throw new Error('useSelectedAddress must be used within a SelectedAddressProvider');
  return ctx;
};

export const SelectedAddressProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAddress, setSelectedAddressState] = useState<any>(null);

  useEffect(() => {
    // On mount, restore from AsyncStorage
    const restore = async () => {
      const stored = await AsyncStorage.getItem('selectedAddress');
      if (stored) setSelectedAddressState(JSON.parse(stored));
    };
    restore();
  }, []);

  const setSelectedAddress = (address: any) => {
    setSelectedAddressState(address);
    if (address) {
      AsyncStorage.setItem('selectedAddress', JSON.stringify(address));
    } else {
      AsyncStorage.removeItem('selectedAddress');
    }
  };

  const clearSelectedAddress = () => setSelectedAddress(null);

  return (
    <SelectedAddressContext.Provider value={{ selectedAddress, setSelectedAddress, clearSelectedAddress }}>
      {children}
    </SelectedAddressContext.Provider>
  );
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveTime = useRef<number>(0);
  const saveCooldown = 2000; // 2 seconds cooldown between saves

  // Remove any lingering 'after_hours' items on mount
  useEffect(() => {
    setCart(prev => prev.filter(i => i.id !== 'after_hours'));
  }, []);

  // Wrap setCart to always filter out 'after_hours' items
  const safeSetCart: React.Dispatch<React.SetStateAction<CartItem[]>> = (value) => {
    if (typeof value === 'function') {
      setCart(prev => (value(prev) as CartItem[]).filter(i => i.id !== 'after_hours'));
    } else {
      setCart((value as CartItem[]).filter(i => i.id !== 'after_hours'));
    }
  };

  // Optimized debounced save cart to backend with cooldown
  useEffect(() => {
    console.log('🛒 Cart changed, length:', cart.length, 'items:', cart.map(i => `${i.title}(${i.qty})`));
    
    const now = Date.now();
    if (now - lastSaveTime.current < saveCooldown) {
      console.log('⏰ Cart save skipped - cooldown period');
      return;
    }
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    // Always save to backend, even when cart is empty
    saveTimeout.current = setTimeout(() => {
      const saveCartToBackend = async () => {
        try {
          lastSaveTime.current = Date.now();
          // Convert frontend cart structure to backend structure
          const backendCart = cart.filter(item => item.id !== 'after_hours').map(item => ({
            productId: item.id,
            name: item.title,
            price: item.price,
            quantity: item.qty,
            image: item.emoji
          }));
          console.log('💾 Saving cart to backend:', backendCart);
          await apiService.saveCart(backendCart);
          console.log('✅ Cart saved to backend successfully');
        } catch (error) {
          console.error('❌ Error saving cart to backend:', error);
        }
      };
      saveCartToBackend();
    }, 1000); // 1 second debounce instead of immediate save

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [cart]);

  const addItem = (item: Omit<CartItem, 'qty'>) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id);
      if (found) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const clearCart = async () => {
    setCart([]);
    // Also clear cart from backend immediately
    try {
      await apiService.saveCart([]);
      console.log('Cart cleared from backend successfully');
    } catch (error) {
      console.error('Error clearing cart from backend:', error);
    }
  };

  // Add a function to calculate after-hours charge
  const getAfterHoursCharge = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
    const hour = ist.getHours();
    // Count only real service items (not after-hours)
    const serviceCount = cart.filter(i => i.id !== 'after_hours').reduce((sum, i) => sum + i.qty, 0);
    if (hour >= 21 || hour < 7) {
      return 200 * serviceCount;
    }
    return 0;
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, setCart: safeSetCart, getAfterHoursCharge }}>
      {children}
    </CartContext.Provider>
  );
}; 