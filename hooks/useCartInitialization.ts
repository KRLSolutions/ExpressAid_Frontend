import api from '../services/api';

export const fetchAndSetCart = async (setCart: (cart: any[]) => void, currentCart: any[] = []) => {
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
      // Only set empty cart if local cart is also empty
      // This prevents clearing a local cart when backend returns empty
      if (currentCart.length === 0) {
        console.log('📭 No cart data from backend and local cart is empty, setting empty cart');
        setCart([]);
      } else {
        console.log('⚠️ Backend returned empty cart but local cart has items, preserving local cart');
        // Don't set cart to empty, keep the local cart
      }
    }
  } catch (error) {
    console.error('❌ Error initializing cart:', error);
    // Don't set cart to empty on error, let it use the default state
    // This prevents clearing the cart when there are network issues
  }
}; 