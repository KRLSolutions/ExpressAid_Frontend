import api from '../services/api';

export const fetchAndSetCart = async (setCart: (cart: any[]) => void) => {
  try {
    console.log('🔄 Initializing cart from backend...');
    const res = await api.getCart();
    if (res.cart && res.cart.length > 0) {
      // Convert backend cart structure to frontend structure
      const frontendCart = res.cart.map((item: any) => ({
        id: item.productId,
        emoji: item.image || '📦',
        title: item.name,
        subtitle: 'Service',
        price: item.price,
        qty: item.quantity
      }));
      console.log('✅ Setting cart from backend:', frontendCart);
      setCart(frontendCart);
    } else {
      console.log('📭 No cart data from backend, setting empty cart');
      setCart([]);
    }
  } catch (error) {
    console.error('❌ Error initializing cart:', error);
    // Don't set cart to empty on error, let it use the default state
    // This prevents clearing the cart when there are network issues
  }
}; 